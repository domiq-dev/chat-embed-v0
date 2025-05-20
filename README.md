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
