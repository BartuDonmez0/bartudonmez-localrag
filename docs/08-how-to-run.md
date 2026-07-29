---
title: How to Run This Application
category: HowTo
id: KB-008
---

# How to Run This Application

## Prerequisites

- Node.js 20 or later
- Microsoft Foundry Local installed on Windows or macOS
- Enough disk space for the chat model cache (about 2 GB on first run)

## Commands

```bash
npm install
npm run ingest
npm start
```

Then open http://127.0.0.1:3000 in a browser.

## What each command does

- `npm install` – Install Express, SQLite bindings, and the Foundry Local SDK.
- `npm run ingest` – Read Markdown files from docs/, chunk them, compute TF-IDF vectors, store them in data/rag.db.
- `npm start` – Load the local model and serve the chat UI.

## Adding your own documents

Place `.md` or `.txt` files in the docs/ folder, run `npm run ingest` again, or use the upload button in the UI for runtime indexing.
