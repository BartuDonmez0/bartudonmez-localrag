---
title: Document Chunking Playbook
category: RAG Pipeline
id: LAB-004
---

# Document Chunking Playbook

Chunking is the step that decides retrieval quality more than model size for small corpora.

## Default project settings

Configured in `src/config.js` for this lab:

- `chunkSize`: **200** approximate tokens
- `chunkOverlap`: **25** tokens
- `topK`: **3** chunks injected into each prompt

## When to change settings

| Observation | Change |
|-------------|--------|
| Answers miss the second half of a procedure | Increase `chunkSize` to 250–300 or raise overlap to 40 |
| Answers mix unrelated topics | Decrease `chunkSize` toward 120–150 |
| Model replies slowly / context too long | Lower `topK` to 2 |
| Retrieval misses synonym questions | Improve document wording headings; optional: add embedding retrieval later |

## Authoring rules for knowledge docs

1. One clear H1 title and optional YAML front-matter (`title`, `category`, `id`).
2. Prefer short sections with descriptive H2 headings (procedures, tables, decision steps).
3. Put exact numbers (times, ports, scores, room codes) in the prose so TF-IDF can match them.
4. Avoid stuffing an entire textbook into one file; split by topic.
5. After editing Markdown, always run `npm run ingest` again before demoing.

## Overlap rationale

Overlap prevents a sentence that starts near a chunk boundary from being truncated without context. For step-by-step safety or submission rules, overlap of 20–40 tokens is recommended.
