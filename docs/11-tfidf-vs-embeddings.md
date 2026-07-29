---
title: TF-IDF versus Embeddings for This Lab
category: Concepts
id: LAB-011
---

# TF-IDF versus Embeddings for This Lab

## What this project uses

LocalRAG Study Assistant retrieves with **TF-IDF vectors** stored in SQLite and ranked by cosine similarity. That matches the Microsoft Tech Community local-rag sample’s practical choice for a small document set.

## Strengths of TF-IDF here

- No second model download for embeddings
- Extremely fast for tens of documents
- Easy to reason about: keyword-heavy questions retrieve keyword-heavy chunks

## When embeddings would help

Use or add an embedding model if:

- Users ask with synonyms that never appear in the documents
- The corpus grows to hundreds of loosely worded notes
- You need semantic similarity beyond lexical overlap

## Lab guidance

Passing the course does **not** require embeddings if TF-IDF + Foundry Local + SQLite is working and explained. Switching to embeddings is a valid stretch goal, not a mandatory gate.
