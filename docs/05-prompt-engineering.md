---
title: Prompt Engineering for Local Q&A
category: Concepts
id: KB-005
---

# Prompt Engineering for Local Q&A

Good prompts decide whether the model stays grounded in retrieved context.

## System vs user messages

- **System prompt** – Role, safety rules, response format, and "do not invent facts".
- **User message** – The actual question, optionally preceded by retrieved context.

## Recommended rules for RAG assistants

- Answer only from the provided context.
- If context is insufficient, say you do not know.
- Prefer short structured answers (summary, steps, references).
- Ask for clarification when the question is ambiguous.

## Example instruction

"If the answer is not in the provided context, say: This information is not available in the local knowledge base."
