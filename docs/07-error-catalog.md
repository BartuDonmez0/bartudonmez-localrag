---
title: Common Runtime Error Catalog
category: Troubleshooting
id: LAB-007
---

# Common Runtime Error Catalog

## ERR_MODULE_NOT_FOUND

You import a file with the wrong path or forgot `"type": "module"` / `.js` extensions in ESM imports.

Fix: verify relative paths from `src/server.js`, reinstall with `npm install`, restart.

## EADDRINUSE :::3000

Port 3000 is already bound.

Fix: find and stop the previous Node process, or change `port` in `src/config.js` and reopen that URL.

## SQLITE_CANTOPEN / database locked

Another process holds `data/rag.db`, or the `data/` folder does not exist.

Fix: stop duplicate servers, delete stale `*.db-wal` only if no server is running, rerun `npm run ingest`.

## Model alias not found / catalog hang

Foundry cannot resolve `phi-3.5-mini` because the service is down or registry unreachable on first download.

Fix: start Foundry (`foundry status`), ensure internet for first download, then retry.

## better-sqlite3 NODE_MODULE_VERSION mismatch

Native addon built for a different Node version.

Fix: delete `node_modules`, switch to Node 20+, run `npm install` again.

## Empty retrieval / always refusing

Ingest never ran, or documents are empty.

Fix: confirm `docs/` has Markdown files, run `npm run ingest`, check Indexed Documents in the UI.

## Stream stuck / Send button never returns

A previous response stream hung while RAM was exhausted.

Fix: free memory, refresh the page, restart `npm start`. The UI timeout should abort hung requests after about 120 seconds.
