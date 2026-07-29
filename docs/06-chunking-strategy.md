---
title: Document Chunking Strategy
category: Pipeline
id: KB-006
---

# Document Chunking Strategy

RAG usually searches passage-sized chunks, not whole books.

## Why chunk?

Large documents exceed model context windows. Smaller chunks improve precision: the retriever can return the exact paragraph that answers the question.

## Common settings in this project

- Chunk size around 200 tokens
- Overlap around 25 tokens so ideas are not cut at boundaries
- topK of 3 chunks injected into each prompt

## Tips for students

- Prefer clear headings and short sections in source Markdown.
- Re-run ingestion after editing documents.
- If answers miss details, try slightly larger chunks or higher topK.
- If answers feel noisy, try smaller chunks or lower topK.
