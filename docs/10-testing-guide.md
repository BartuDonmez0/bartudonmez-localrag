---
title: Testing and Evaluation Guide
category: Testing
id: KB-010
---

# Testing and Evaluation Guide

## Functional tests

Prepare a small set of questions:

- Answerable questions whose answers appear in docs/
- Unanswerable questions (for example "What is the capital of Mars colony Alpha?") expecting a refusal
- Edge cases: empty input, very vague questions

## Quality checks

- Does the answer match the retrieved sources?
- Are safety or "I don't know" rules respected?
- Are responses concise enough for a student demo?

## Performance notes

On a typical laptop, small models often answer in a few seconds. If slow:

- Use fewer retrieved chunks (lower topK)
- Prefer Edge/compact prompt mode
- Avoid reloading the model between questions
