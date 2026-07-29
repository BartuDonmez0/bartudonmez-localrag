---
title: Microsoft Foundry Local
category: Tools
id: KB-002
---

# Microsoft Foundry Local

Foundry Local is Microsoft's on-device AI runtime. It downloads, caches, and runs small language models entirely on your computer.

## Key properties

- No cloud account or API key required after the first model download.
- Runs on CPU or NPU; a dedicated GPU is not required.
- Provides an SDK for Node.js and Python.
- Manages model discovery, download progress, and loading.

## Role in this project

This assistant uses Foundry Local to run a chat model (for example Phi-3.5 Mini) locally. User questions and retrieved document chunks are sent to that model in-process. After models are cached, the app can answer offline with no outbound network calls.

## Typical first-run note

The first launch may download a model of roughly 2 GB. Later launches reuse the local cache and start faster.
