---
title: Privacy and Offline Data Policy
category: Policy
id: LAB-009
---

# Privacy and Offline Data Policy

## Goal of LocalRAG

This assistant is designed so student documents and questions stay on the device. After model weights are cached, chat queries should not require internet.

## Allowed network activity

- First-time Foundry model download from Microsoft’s model catalog
- Optional `npm install` dependency download
- Optional `git push` of your source code to GitHub

## Disallowed for the graded demo

- Sending document contents to a public cloud LLM API as the primary generator
- Uploading the knowledge base to a third-party RAG SaaS for the official demo
- Recording other students’ screen sessions without consent

## Uploading documents in the UI

Files uploaded through the browser are stored in the local SQLite database under `data/`. Treat that file as private. Do not share `rag.db` if it contains unpublished course notes or personal data.

## Screenshots and videos

Blur student IDs, email addresses, and VPN credentials before publishing demo videos publicly.
