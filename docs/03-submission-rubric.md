---
title: RAG Project Submission Rubric
category: Assessment
id: LAB-003
---

# RAG Project Submission Rubric

Final grading for the Local RAG track uses this rubric (100 points).

## Scoring breakdown

| Criterion | Points | Pass requirement |
|-----------|--------|------------------|
| Working offline Q&A | 30 | Answers grounded questions using retrieved docs |
| Responsible refusal | 10 | Unknown questions return a clear “not in knowledge base” style reply |
| Local pipeline | 20 | Foundry Local + local store (SQLite/TF-IDF or embeddings) visible in code |
| Documentation | 15 | README explains purpose, architecture, run steps, example questions |
| GitHub quality | 10 | Public repo, clear commits, no secrets committed |
| Demo video (≈3 minutes) | 15 | Shows live answers + one refusal + what you learned |

## Hard fails (automatic incomplete)

- Project requires a cloud API key at runtime for the main demo
- Repository is empty or private when mentors need to review
- No evidence the knowledge base was actually used (always hallucinated answers with no sources)
- Video is longer than 6 minutes or shows only slides with no running app

## Late policy

- Deadline is **23:59 local time** on your declared end date in the summer school list.
- Up to 48 hours late: **-10 points**.
- More than 48 hours late without email approval: submission marked incomplete until rescheduled.

## What to put in the video

1. Open the UI and show Offline ready.
2. Ask one domain question that retrieves a specific procedure.
3. Ask one out-of-domain question that correctly refuses.
4. Briefly open Sources and point to a document title.
5. State one technical lesson learned (chunking, prompts, or memory/model load).
