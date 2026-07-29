---
title: Git and GitHub Workflow for the RAG Track
category: Delivery
id: LAB-006
---

# Git and GitHub Workflow for the RAG Track

Mentors review your public GitHub repository. Follow this workflow so your history is reviewable.

## Required repository contents

- Source code under `src/` and `public/`
- Knowledge documents under `docs/`
- `README.md` with purpose, architecture, run instructions, example questions
- `package.json` with start/ingest scripts
- `.gitignore` that excludes `node_modules/`, `data/*.db`, `.env`, and model caches

## Recommended commit style

Write short commits that explain **why**:

- `Add lab knowledge base for offline RAG retrieval`
- `Harden chat scrolling and request timeouts`
- `Document submission rubric and demo script`

Avoid one giant commit named `final` if possible. Mentors prefer a readable history.

## Secrets policy

Never commit:

- API keys (not needed for Foundry Local offline demo)
- `.env` files with tokens
- Personal VPN passwords
- Large model weight files from the Foundry cache

## Branching

For this course, `main` is enough. If you experiment, use a feature branch and merge before the deadline.

## Linking for grading

Paste the exact HTTPS GitHub URL into the summer school list column **Projenin Github Linki**, for example:

`https://github.com/<you>/<repo>`

Private repos are only accepted if you explicitly invite the mentor account provided by organizers.
