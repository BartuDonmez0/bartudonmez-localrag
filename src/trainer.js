/**
 * LocalRAG Trainer
 * ----------------
 * Two-phase offline optimiser:
 *   Phase A – sweep chunkSize / overlap / topK using retrieval hit-rate (fast)
 *   Phase B – take top retrieval configs, try candidate Foundry models + temperatures,
 *             score grounded answers + refusals, pick the best combo
 *
 * Writes:
 *   config/best-config.json
 *   config/train-report.json
 *
 * Usage:
 *   npm run train
 *   npm run train -- --quick
 *   npm run train -- --models phi-3.5-mini,phi-4-mini
 */
import fs from "fs";
import path from "path";
import { FoundryLocalManager } from "foundry-local-sdk";
import { config, ROOT } from "./config.js";
import { ingestDocuments } from "./ingestLib.js";
import { VectorStore } from "./vectorStore.js";
import { SYSTEM_PROMPT } from "./prompts.js";

const args = process.argv.slice(2);
const QUICK = args.includes("--quick");
const modelsArg = args.find((a) => a.startsWith("--models="));
const EXTRA_MODELS = modelsArg
  ? modelsArg.replace("--models=", "").split(",").map((s) => s.trim()).filter(Boolean)
  : (process.env.TRAIN_MODELS || "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

function readCases() {
  const cases = JSON.parse(fs.readFileSync(config.casesPath, "utf-8"));
  return QUICK ? cases.slice(0, 4) : cases;
}

function includesAny(text, needles) {
  const hay = (text || "").toLowerCase();
  return needles.some((n) => hay.includes(String(n).toLowerCase()));
}

function scoreRetrieval(chunks, testCase) {
  if (testCase.type === "refusal") {
    // For refusals, empty or weak retrieval is OK; do not punish heavily
    return { hit: true, score: 1 };
  }
  const ids = new Set(chunks.map((c) => c.doc_id));
  const hit = testCase.expectDocIds.some((id) => ids.has(id));
  return { hit, score: hit ? 1 : 0 };
}

function scoreGeneration(answer, testCase) {
  const text = answer || "";
  let score = 0;
  let checks = 0;

  if (testCase.mustIncludeAny?.length) {
    checks += 1;
    if (includesAny(text, testCase.mustIncludeAny)) score += 1;
  }
  if (testCase.mustNotIncludeAny?.length) {
    checks += 1;
    if (!includesAny(text, testCase.mustNotIncludeAny)) score += 1;
  }
  if (testCase.type === "refusal") {
    checks += 1;
    if (includesAny(text, ["not available", "not in local knowledge base", "knowledge base"])) {
      score += 1;
    }
  }

  return checks === 0 ? 0 : score / checks;
}

function product(grids) {
  const keys = Object.keys(grids);
  let combos = [{}];
  for (const key of keys) {
    const next = [];
    for (const base of combos) {
      for (const value of grids[key]) {
        next.push({ ...base, [key]: value });
      }
    }
    combos = next;
  }
  return combos;
}

async function withTimeout(promise, ms, label) {
  let timer;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`Timeout: ${label}`)), ms);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

class ModelSession {
  constructor(alias) {
    this.alias = alias;
    this.model = null;
    this.chatClient = null;
  }

  async load() {
    const manager = FoundryLocalManager.create({ appName: "bartudonmez-localrag-trainer" });
    this.model = await manager.catalog.getModel(this.alias);
    if (!this.model.isCached) {
      console.log(`  ↓ Downloading ${this.alias}…`);
      await this.model.download((p) => {
        if (Math.round(p * 100) % 20 === 0) {
          process.stdout.write(`\r  ↓ ${this.alias} ${Math.round(p * 100)}%   `);
        }
      });
      process.stdout.write("\n");
    }
    await this.model.load();
    this.chatClient = this.model.createChatClient();
  }

  async answer(userMessage, context, temperature, maxTokens) {
    this.chatClient.settings.temperature = temperature;
    this.chatClient.settings.maxTokens = maxTokens;
    const messages = [
      { role: "system", content: SYSTEM_PROMPT },
      {
        role: "system",
        content: `Retrieved context from local knowledge base:\n\n${context}`,
      },
      { role: "user", content: userMessage },
    ];
    const response = await withTimeout(
      this.chatClient.completeChat(messages),
      90000,
      `completeChat:${this.alias}`
    );
    return response.choices?.[0]?.message?.content || "";
  }

  async close() {
    if (this.model) {
      try {
        await this.model.unload();
      } catch {
        /* ignore */
      }
    }
  }
}

function buildContext(chunks) {
  if (!chunks.length) return "No relevant documents found in local knowledge base.";
  return chunks
    .map((c, i) => `--- Document ${i + 1}: ${c.title} [${c.category}] ---\n${c.content}`)
    .join("\n\n");
}

function resolveModelCandidates(preferred) {
  const base = [preferred, "phi-3.5-mini", "phi-4-mini", "qwen2.5-1.5b", ...EXTRA_MODELS];
  return [...new Set(base.filter(Boolean))];
}

async function pickAvailableModels(candidates) {
  const manager = FoundryLocalManager.create({ appName: "bartudonmez-localrag-trainer" });
  const available = [];
  for (const alias of candidates) {
    try {
      const model = await withTimeout(manager.catalog.getModel(alias), 20000, `getModel:${alias}`);
      if (model) available.push(alias);
    } catch (err) {
      console.log(`  · skip model ${alias}: ${err.message}`);
    }
  }
  if (available.length === 0) available.push(config.model);
  return QUICK ? available.slice(0, 1) : available.slice(0, 3);
}

async function phaseA_retrieval(cases) {
  console.log("\n=== Phase A: Retrieval hyperparameter search ===\n");

  const grid = QUICK
    ? {
        chunkSize: [200, 280],
        chunkOverlap: [25, 40],
        topK: [3, 5],
      }
    : {
        chunkSize: [160, 200, 280],
        chunkOverlap: [15, 25, 40],
        topK: [2, 3, 5],
      };

  const combos = product(grid);
  const grounded = cases.filter((c) => c.type === "grounded");
  const results = [];

  for (let i = 0; i < combos.length; i++) {
    const combo = combos[i];
    const dbPath = path.join(ROOT, "data", `train-a-${i}.db`);
    ingestDocuments({
      docsDir: config.docsDir,
      dbPath,
      chunkSize: combo.chunkSize,
      chunkOverlap: combo.chunkOverlap,
      quiet: true,
    });

    const store = new VectorStore(dbPath);
    let hits = 0;
    for (const testCase of grounded) {
      const chunks = store.search(testCase.question, combo.topK);
      if (scoreRetrieval(chunks, testCase).hit) hits += 1;
    }
    store.close();
    try {
      fs.unlinkSync(dbPath);
      fs.unlinkSync(dbPath + "-wal");
      fs.unlinkSync(dbPath + "-shm");
    } catch {
      /* ignore */
    }

    const retrievalScore = grounded.length ? hits / grounded.length : 0;
    results.push({ ...combo, retrievalScore, hits, total: grounded.length });
    console.log(
      `  [${i + 1}/${combos.length}] chunk=${combo.chunkSize}/${combo.chunkOverlap} topK=${combo.topK} → retrieval ${hits}/${grounded.length} (${(retrievalScore * 100).toFixed(0)}%)`
    );
  }

  results.sort((a, b) => b.retrievalScore - a.retrievalScore || b.topK - a.topK);
  const top = results.slice(0, QUICK ? 2 : 3);
  console.log("\nTop retrieval configs:");
  for (const r of top) {
    console.log(
      `  • chunk=${r.chunkSize}/${r.chunkOverlap} topK=${r.topK} score=${(r.retrievalScore * 100).toFixed(0)}%`
    );
  }
  return { results, top };
}

async function phaseB_generation(cases, topRetrieval, modelAliases) {
  console.log("\n=== Phase B: Model + temperature search ===\n");
  console.log(`Candidate models: ${modelAliases.join(", ")}`);

  const temperatures = QUICK ? [0.1] : [0.05, 0.2, 0.35];
  const leaderboard = [];

  for (const alias of modelAliases) {
    console.log(`\nLoading model ${alias}…`);
    const session = new ModelSession(alias);
    try {
      await session.load();
    } catch (err) {
      console.log(`  ✗ Failed to load ${alias}: ${err.message}`);
      continue;
    }

    for (const retrieval of topRetrieval) {
      const dbPath = path.join(
        ROOT,
        "data",
        `train-b-${alias.replace(/[^a-z0-9.-]/gi, "_")}-${retrieval.chunkSize}-${retrieval.chunkOverlap}.db`
      );
      ingestDocuments({
        docsDir: config.docsDir,
        dbPath,
        chunkSize: retrieval.chunkSize,
        chunkOverlap: retrieval.chunkOverlap,
        quiet: true,
      });
      const store = new VectorStore(dbPath);

      for (const temperature of temperatures) {
        const perCase = [];
        let retrievalHits = 0;
        let genScoreSum = 0;
        let groundedCount = 0;

        for (const testCase of cases) {
          const chunks = store.search(testCase.question, retrieval.topK);
          const ret = scoreRetrieval(chunks, testCase);
          if (testCase.type === "grounded" && ret.hit) retrievalHits += 1;
          if (testCase.type === "grounded") groundedCount += 1;

          const context = buildContext(chunks);
          let answer = "";
          try {
            answer = await session.answer(
              testCase.question,
              context,
              temperature,
              config.maxTokens ?? 1024
            );
          } catch (err) {
            answer = "";
            console.log(`    ! ${testCase.id} failed: ${err.message}`);
          }

          const g = scoreGeneration(answer, testCase);
          genScoreSum += g;
          perCase.push({
            id: testCase.id,
            retrievalHit: ret.hit,
            generationScore: g,
            answerPreview: (answer || "").slice(0, 180),
          });
        }

        const retrievalScore = groundedCount ? retrievalHits / groundedCount : 0;
        const generationScore = cases.length ? genScoreSum / cases.length : 0;
        // Prefer generation slightly, but keep retrieval honest
        const totalScore = 0.45 * retrievalScore + 0.55 * generationScore;

        const row = {
          model: alias,
          temperature,
          chunkSize: retrieval.chunkSize,
          chunkOverlap: retrieval.chunkOverlap,
          topK: retrieval.topK,
          retrievalScore,
          generationScore,
          totalScore,
          perCase,
        };
        leaderboard.push(row);
        console.log(
          `  ${alias} T=${temperature} chunk=${retrieval.chunkSize}/${retrieval.chunkOverlap} k=${retrieval.topK} → total ${(totalScore * 100).toFixed(1)}% (ret ${(retrievalScore * 100).toFixed(0)}% / gen ${(generationScore * 100).toFixed(0)}%)`
        );
      }

      store.close();
      try {
        fs.unlinkSync(dbPath);
        fs.unlinkSync(dbPath + "-wal");
        fs.unlinkSync(dbPath + "-shm");
      } catch {
        /* ignore */
      }
    }

    await session.close();
  }

  leaderboard.sort((a, b) => b.totalScore - a.totalScore);
  return leaderboard;
}

async function main() {
  console.log("=== LocalRAG Trainer ===");
  console.log(QUICK ? "Mode: QUICK" : "Mode: FULL");
  console.log(`Docs: ${config.docsDir}`);
  console.log(`Cases: ${config.casesPath}`);

  fs.mkdirSync(path.join(ROOT, "config"), { recursive: true });
  fs.mkdirSync(path.join(ROOT, "data"), { recursive: true });

  const cases = readCases();
  const phaseA = await phaseA_retrieval(cases);

  const candidates = resolveModelCandidates(config.model);
  const models = await pickAvailableModels(candidates);

  const leaderboard = await phaseB_generation(cases, phaseA.top, models);
  if (leaderboard.length === 0) {
    console.error("No successful training runs. Is Foundry Local available?");
    process.exit(1);
  }

  const best = leaderboard[0];
  const bestPayload = {
    updatedAt: new Date().toISOString(),
    best: {
      score: best.totalScore,
      config: {
        model: best.model,
        temperature: best.temperature,
        chunkSize: best.chunkSize,
        chunkOverlap: best.chunkOverlap,
        topK: best.topK,
        maxTokens: config.maxTokens ?? 1024,
        compactMaxTokens: config.compactMaxTokens ?? 512,
      },
    },
    runnerUp: leaderboard.slice(1, 4).map((r) => ({
      score: r.totalScore,
      model: r.model,
      temperature: r.temperature,
      chunkSize: r.chunkSize,
      chunkOverlap: r.chunkOverlap,
      topK: r.topK,
    })),
  };

  fs.writeFileSync(config.bestConfigPath, JSON.stringify(bestPayload, null, 2));
  fs.writeFileSync(
    config.trainReportPath,
    JSON.stringify(
      {
        updatedAt: bestPayload.updatedAt,
        mode: QUICK ? "quick" : "full",
        phaseA: phaseA.results,
        leaderboard,
      },
      null,
      2
    )
  );

  // Rebuild production DB with winning chunk params
  console.log("\nRebuilding production index with best chunk settings…");
  ingestDocuments({
    docsDir: config.docsDir,
    dbPath: config.dbPath,
    chunkSize: best.chunkSize,
    chunkOverlap: best.chunkOverlap,
    quiet: false,
  });

  console.log("\n=== Winner ===");
  console.log(JSON.stringify(bestPayload.best, null, 2));
  console.log(`\nSaved: ${config.bestConfigPath}`);
  console.log(`Report: ${config.trainReportPath}`);
  console.log("Restart the server (`npm start`) to load the new config.");
}

main().catch((err) => {
  console.error("Training failed:", err);
  process.exit(1);
});
