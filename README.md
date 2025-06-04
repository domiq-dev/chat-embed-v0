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
```

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

---

## 5. 🧼 Auto-Formatting on Commit (Prettier + Husky)

We use [Prettier](https://prettier.io/) to automatically format code on every commit via Git hooks. This ensures consistent style across the codebase.

### ✅ To enable auto-formatting:

If you're working on this repo for the first time, or you've just pulled down updates to Husky, run:

```bash
npm install
```

This will set up Husky and Prettier for you. From then on, every time you commit, Prettier will automatically format your staged files. If any files are changed by Prettier, you'll need to re-stage and commit again.

If you have issues, make sure you are using a recent version of Node.js and npm.

---

## 🚀 Widget for Apartment Websites

To add the chat widget to your apartment website, add these two script tags:

```html
<script>
  window.domIQChat = {
    config: {
      propertyId: 'YOUR_PROPERTY_ID',
    },
  };
</script>
<script async src="https://chat.domiq.ai/widget.min.js"></script>
```

Replace `YOUR_PROPERTY_ID` with your actual property ID.

The widget will appear in the bottom-right corner of your website.
