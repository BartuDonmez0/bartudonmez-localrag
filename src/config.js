// Application configuration – defaults + optional tuned best-config overlay
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
export const ROOT = path.resolve(__dirname, "..");

const BEST_CONFIG_PATH = path.join(ROOT, "config", "best-config.json");

const defaults = {
  // Model
  model: "phi-3.5-mini",
  temperature: 0.1,
  maxTokens: 1024,
  compactMaxTokens: 512,

  // RAG
  docsDir: path.join(ROOT, "docs"),
  dbPath: path.join(ROOT, "data", "rag.db"),
  chunkSize: 200,
  chunkOverlap: 25,
  topK: 3,
  // Drop weak TF-IDF matches so the model is not fed unrelated lab docs
  minRetrievalScore: 0.12,

  // Server
  port: 3000,
  host: "127.0.0.1",

  // UI
  publicDir: path.join(ROOT, "public"),

  // Paths used by trainer
  bestConfigPath: BEST_CONFIG_PATH,
  casesPath: path.join(ROOT, "eval", "cases.json"),
  trainReportPath: path.join(ROOT, "config", "train-report.json"),
};

function loadBestOverlay() {
  try {
    if (!fs.existsSync(BEST_CONFIG_PATH)) return {};
    const raw = JSON.parse(fs.readFileSync(BEST_CONFIG_PATH, "utf-8"));
    const overlay = raw?.best?.config || raw?.config || {};
    const allowed = [
      "model",
      "temperature",
      "maxTokens",
      "compactMaxTokens",
      "chunkSize",
      "chunkOverlap",
      "topK",
      "minRetrievalScore",
    ];
    const picked = {};
    for (const key of allowed) {
      if (overlay[key] !== undefined) picked[key] = overlay[key];
    }
    return picked;
  } catch {
    return {};
  }
}

export const config = {
  ...defaults,
  ...loadBestOverlay(),
};

/** Reload best-config.json into the live config object (used after training). */
export function reloadBestConfig() {
  const overlay = loadBestOverlay();
  Object.assign(config, defaults, overlay);
  return config;
}
