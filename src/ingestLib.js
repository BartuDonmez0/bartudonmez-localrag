/**
 * Shared document ingestion used by CLI ingest and the trainer.
 */
import fs from "fs";
import path from "path";
import { parseFrontMatter, chunkText } from "./chunker.js";
import { VectorStore } from "./vectorStore.js";

/**
 * @param {object} options
 * @param {string} options.docsDir
 * @param {string} options.dbPath
 * @param {number} options.chunkSize
 * @param {number} options.chunkOverlap
 * @param {boolean} [options.quiet]
 * @returns {{ files: number, chunks: number, dbPath: string }}
 */
export function ingestDocuments({
  docsDir,
  dbPath,
  chunkSize,
  chunkOverlap,
  quiet = false,
}) {
  if (!fs.existsSync(docsDir)) {
    throw new Error(`Docs directory not found: ${docsDir}`);
  }

  const files = fs
    .readdirSync(docsDir)
    .filter((f) => f.endsWith(".md"))
    .sort();

  if (files.length === 0) {
    throw new Error(`No markdown files found in ${docsDir}`);
  }

  if (!quiet) {
    console.log(`Found ${files.length} documents.\n`);
  }

  const store = new VectorStore(dbPath);
  store.clear();

  let totalChunks = 0;

  for (const file of files) {
    const raw = fs.readFileSync(path.join(docsDir, file), "utf-8");
    const { meta, body } = parseFrontMatter(raw);
    const docId = meta.id || path.basename(file, ".md");
    const title = meta.title || file;
    const category = meta.category || "Uncategorised";

    const chunks = chunkText(body, chunkSize, chunkOverlap);

    for (let i = 0; i < chunks.length; i++) {
      store.insert(docId, title, category, i, chunks[i]);
    }

    if (!quiet) {
      console.log(`  ✓ ${file} → ${chunks.length} chunk(s)  [${category}]`);
    }
    totalChunks += chunks.length;
  }

  store.close();

  return { files: files.length, chunks: totalChunks, dbPath };
}
