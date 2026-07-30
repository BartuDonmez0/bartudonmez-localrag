---
title: Incident Response for Broken Local RAG Demos
category: Troubleshooting
id: LAB-005
---

# Incident Response for Broken Local RAG Demos

Use this decision path if your demo fails five minutes before presentation.

## Step 1 — Classify the failure

1. **UI not loading** → go to Network/Server
2. **UI loads, Send disabled forever** → go to Model Load
3. **Answers ignore your documents** → go to Retrieval
4. **Answers invent facts not in docs** → go to Prompting
5. **Laptop freezes / fans scream** → go to Resources

## Step 2 — Network/Server

- Confirm process: `npm start` still running in the project folder.
- Confirm URL is exactly `http://127.0.0.1:3000` (not another machine’s IP unless intended).
- If port busy: stop other Node servers, restart.
- Hard refresh the browser (`Ctrl+F5`) after UI changes.

## Step 3 — Model Load

- Check Task Manager free RAM. Below ~2 GB free is risky for Phi-3.5 Mini.
- Close browsers with many tabs, games, and heavy IDEs.
- Run `foundry status`. Service should be reachable.
- Re-download if cache corrupt: `foundry model download phi-3.5-mini`.

## Step 4 — Retrieval

- Run `npm run ingest` and confirm chunk count > 0.
- Open the upload panel → Indexed documents should list your titles.
- Ask a question that uses a **rare keyword** from a doc (room `B-214`, deadline `23:59`, score `30 points`).
- If TF-IDF retrieves wrong chunks, rewrite headings to include those keywords.

## Step 5 — Prompting

- Ensure system prompt forbids answering outside context.
- Demo a deliberate unknown question that cannot appear in your docs (for example a fictional place or person), and expect refusal.
- If refusal fails, tighten `src/prompts.js` and raise `minRetrievalScore` slightly, then restart the server.
- Important: do **not** paste the exact unknown demo question into handbook Markdown, or TF-IDF may retrieve that paragraph.

## Step 6 — Resources

- Prefer GPU/NPU variant when available but do not block demo for GPU.
- Compact / Edge mode reduces prompt verbosity.
- As last resort: reboot, reopen only VS Code + one browser tab + Foundry + `npm start`.

## Escalation

If still blocked after these steps, email the organizer with: OS, `foundry --version`, free RAM, and a screenshot of the status pill.
