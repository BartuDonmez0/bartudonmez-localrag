---
title: SQLite as a Local Vector Store
category: Data
id: KB-004
---

# SQLite as a Local Vector Store

SQLite is a serverless SQL database stored as a single file. In this project it stores document chunks and their TF-IDF vectors.

## Why SQLite fits local RAG

- No separate database server to install or manage
- Cross-platform and widely available
- Easy to back up: copy one file
- Good enough for small-to-medium collections with an in-memory cache

## What is stored

Each row typically includes chunk text, metadata (title, source file), and a vector representation used for similarity search at query time.

## Scaling note

Brute-force or inverted-index search over all chunks is fine for student projects. Very large corpora may need specialized vector databases.
