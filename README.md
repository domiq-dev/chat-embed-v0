# 🔧 Team Coding Protocol

This document outlines the required practices for contributing to the codebase. Follow these rules strictly to maintain code quality, avoid duplication, and streamline collaboration.

---

## 1. ✅ Code Comments Are Mandatory

- Every function or logic block **must include comments**.
- Focus on **what it does** and **why it matters** — not just how it works.
- **Uncommented or unclear code will be rejected** during review.

---

## 2. 🖊️ Cursor Log Required for Every Commit

At the end of each push or pull request, include a **cursor log**:

```plaintext
[Cursor Log]
- File: query_handler.py
- Line 104: Added similarity threshold logic (threshold = 0.9) to gate direct retrieval.
- Reason: Align with RAG routing design approved by Fengli.

## 3. 🚫 No Redundant Work

- **Read what others have implemented before starting new code.**
- **Do not re-implement functionality** that already exists.
- If anything is unclear, **ask in Slack first**.
- If you're modifying existing logic, **annotate your intent clearly** and wait for code review.

---

## 4. 🔒 Code Merging Process

- 🔐 **Fengli and Patrick can merge into the `main` branch before RAG deployment.**
- After RAG is live, **Fengli, Nimil, and Patrick will review all code before merges.**
- Use **pull requests only** — absolutely **no direct pushes to `main`**.
