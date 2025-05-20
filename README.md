1. Code Comments Are Mandatory
Every function or logic block must be commented.
Explain what it does and why it's needed — not just how.
Unclear or uncommented code will be rejected.
2. Cursor Log Required for Every Commit
At the end of each push or PR, include a cursor log like this:
[Cursor Log]
- File: query_handler.py
- Line 104: Added similarity threshold logic (threshold = 0.9) to gate direct retrieval.
- Reason: Align with RAG routing design approved by Fengli.
This log helps everyone know
what changed, where, and why.
 3. No Redundant Work
Always read what others have done before you code.
Ask in Slack if unclear — avoid duplicated or conflicting logic.
If you’re unsure, annotate your proposed change and wait for review.
4. Code Merging Process
:lock: Fengli and Patrick will merge into main branch before RAG deploy.
After RAG deployment is live, Fengli, Nimil and Patrick will participate in code review before merge.
Use PRs, no direct pushes to main branch.
Additional Guidelines:
Use consistent naming.
Push frequently with clear commit messages.
Ask early. If you're stuck for more than 30 minutes, post in Slack.
