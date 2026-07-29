---
title: What is RAG?
category: Concepts
id: KB-001
---

# What is RAG?

Retrieval-Augmented Generation (RAG) is a pattern that grounds AI answers in your own documents.

## The three steps

1. **Retrieve** – Find the most relevant passages from a local knowledge base.
2. **Augment** – Add those passages to the model prompt as context.
3. **Generate** – Let a local language model write an answer using only that context.

## Why RAG matters

- Reduces hallucinations because the model must use retrieved text.
- Enables source attribution (which document chunk was used).
- Works with private data without uploading files to the cloud.
- Lets small on-device models answer domain questions accurately.

## When to use RAG

Use RAG when you have manuals, FAQs, course notes, or policies and need Q&A that stays faithful to those sources.
