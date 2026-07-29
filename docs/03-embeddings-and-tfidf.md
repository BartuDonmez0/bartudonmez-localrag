---
title: Retrieval with TF-IDF and Embeddings
category: Concepts
id: KB-003
---

# Retrieval with TF-IDF and Embeddings

RAG needs a way to score which document chunks match a question.

## TF-IDF (used in this project)

TF-IDF measures how important a word is in a chunk relative to the whole collection. Query and chunks become sparse vectors. Cosine similarity ranks the closest chunks. Benefits:

- Fully offline; no embedding model download
- Very fast on small document sets
- Transparent term weights

## Neural embeddings

Embedding models map text into dense vectors that capture semantic meaning. Similar ideas score high even when wording differs. They need an extra model and more compute, but can help on diverse phrasing.

## Practical rule

For a small curated knowledge base (tens of documents), TF-IDF plus SQLite is enough. For large or highly paraphrased corpora, consider embedding-based retrieval.
