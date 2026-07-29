---
title: Architecture Overview
category: Architecture
id: KB-009
---

# Architecture Overview

All components run on a single machine with no cloud dependency after model download.

## Layers

1. **Client** – Single HTML page with chat UI and quick-action buttons.
2. **Server** – Node.js Express app exposing chat and status endpoints.
3. **RAG pipeline** – Chunker, TF-IDF vector store, prompt builder, chat engine.
4. **Data** – SQLite database file holding chunks and vectors.
5. **AI** – Foundry Local SDK running Phi-3.5 Mini (or another catalog model) in-process.

## Query flow

User question → embed/score with TF-IDF → retrieve top chunks from SQLite → build system + context + user messages → local LLM generates answer → stream tokens to the browser via Server-Sent Events.
