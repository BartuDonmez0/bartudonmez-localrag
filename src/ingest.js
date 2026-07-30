/**
 * Ingestion CLI.
 * Usage: node src/ingest.js
 */
import { config } from "./config.js";
import { ingestDocuments } from "./ingestLib.js";

console.log("=== Local RAG – Document Ingestion ===\n");
console.log(
  `Params: chunkSize=${config.chunkSize}, overlap=${config.chunkOverlap}, db=${config.dbPath}\n`
);

try {
  const result = ingestDocuments({
    docsDir: config.docsDir,
    dbPath: config.dbPath,
    chunkSize: config.chunkSize,
    chunkOverlap: config.chunkOverlap,
  });
  console.log(
    `\nIngestion complete: ${result.chunks} chunks from ${result.files} documents.`
  );
  console.log(`Database: ${result.dbPath}`);
} catch (err) {
  console.error("Ingestion failed:", err.message || err);
  process.exit(1);
}
