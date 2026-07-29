---
title: Foundry Local Workstation Setup Checklist
category: Setup
id: LAB-002
---

# Foundry Local Workstation Setup Checklist

Use this checklist before you start coding the RAG pipeline.

## Required software versions

- Windows 10/11 or macOS 13+
- Node.js **20.11 or later** (`node -v`)
- Foundry Local CLI **0.10+** (`foundry --version`)
- Git 2.40+
- At least **4 GB free RAM** when loading Phi-3.5 Mini
- About **2.5 GB** disk free for the model cache

## Installation order

1. Install Node.js LTS from the official site (do not use an ancient Node 16 packaging from old tutorials).
2. Install Foundry Local:
   ```powershell
   winget install Microsoft.FoundryLocal
   ```
3. Open a **new** terminal so `foundry` is on PATH.
4. Verify: `foundry status` should show CLI version and, when ready, a local service URL.
5. Clone your project, then run:
   ```bash
   npm install
   npm run ingest
   npm start
   ```
6. Open `http://127.0.0.1:3000` and wait until status shows **Offline ready**.

## Common setup failures

| Symptom | Likely cause | Fix |
|---------|--------------|-----|
| `foundry` not found | Terminal opened before install | Close terminal, reopen, retry |
| Status stuck on downloading >30 min | Slow network / low disk | Free disk, restart `foundry model download phi-3.5-mini` |
| UI open but Send disabled | Model still loading | Wait; check Free RAM ≥ 4 GB |
| `better-sqlite3` build error | Missing build tools on Windows | Install “Desktop development with C++” workload |
| Port 3000 in use | Another Node process | Stop old `npm start` or change `config.port` |

## Mentoring note

Mentors will only help with environment issues if you can show the output of `node -v`, `foundry --version`, and `foundry status`.
