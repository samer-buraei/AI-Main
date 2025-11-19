# 👨‍💻 Developer Guide & Architecture Map

**Welcome to the team.** This document explains how the magic works so you can fix bugs or add features without breaking the architecture.

---

## 📂 Critical File Map

If you touch nothing else, understand these files:

### 1. The "Brain" (Backend Logic)
**File:** `vibecoding-backend/src/routes/orchestrator.js`

*   **Role:** The core intelligence.
*   **What it does:** Handles the `/analyze` and `/plan` endpoints. It calls the scanner, runs the logic (currently Mock AI), and saves the session state.
*   **Key Function:** Look for `router.post('/analyze')` to see how we generate questions and run the "Skill Detective".

### 2. The "Eyes" (Scanner)
**File:** `vibecoding-mcp-server/src/tools/fetchRepoMetadata.js`

*   **Role:** The lightweight scanner.
*   **Logic:** It does **NOT** git clone (which is slow). It uses the GitHub API to fetch file lists and reads only config files (`package.json`, `requirements.txt`).
*   **Why:** This keeps the token cost low and the speed high.

### 3. The "Face" (Wizard UI)
**File:** `vibecoding-dashboard/src/components/ProjectWizard.js`

*   **Role:** The 3-step state machine for the UI.
*   **Logic:** It handles the flow:
    `Input` -> (API Call) -> `Questions/Recommendations` -> (API Call) -> `Plan` -> (API Call) -> `Create`.

### 4. The "Memory" (Database)
**File:** `vibecoding-backend/src/config/database.js`

*   **Schema:** We use SQLite with **JSON Columns**.
*   **Why:** Instead of strict columns (`repo_name`, `repo_stars`), we dump the entire analysis into `repo_metadata` (JSON). This allows us to change the AI prompt structure without needing database migrations.

---

## 🧩 Key Logic Flows

### A. The "Orchestrator" Flow
1.  Frontend sends GitHub URL to `POST /api/orchestrator/analyze`.
2.  Backend calls `fetchRepoMetadata` to get file lists and config content.
3.  Backend runs **"Skill Detective" Logic**:
    *   "If `docker-compose.yml` exists -> Recommend Docker MCP."
    *   "If `dronekit` found -> Recommend `@hardware` Agent."
4.  Backend saves state to `orchestration_sessions` table.
5.  Frontend renders Questions and Recommendations.

### B. The "Context Pack" Flow
1.  User selects a task in Cursor.
2.  MCP Server calls `generate-context-pack`.
3.  It fetches `PROJECT_MAP.md` and `AGENTS_CONFIG` from the DB.
4.  It constructs a prompt: *"You are the @backend agent. Only touch these files..."*
5.  Cursor receives this strict context window.

---

## 🔮 Roadmap & Next Steps

You are picking up a functional MVP. Here is what needs to be built next:

### 1. Replace Mock AI with Real LLM
*   **Where:** `vibecoding-backend/src/routes/orchestrator.js`
*   **Task:** Replace the `if (package.json) ...` logic with a real call to OpenAI/Anthropic API.
*   **Prompt:** *"Here is the file list. You are a Senior Architect. Generate 3 questions to clarify the scope."*

### 2. Implement "Auto-Execution"
*   **Current:** The system creates tasks, but a human must execute them.
*   **Goal:** Create a loop where the Orchestrator iterates through "Ready" tasks and attempts to write the code automatically using the MCP tools.

### 3. Deep Code Analysis
*   **Current:** `fetchRepoMetadata.js` only looks at the root level.
*   **Goal:** Update it to recursively scan `src/` folders to understand the actual project structure better.

---

## 🆘 Troubleshooting

*   **"Repo Analysis Failed":** Check if the repo is private. You may need to add a `GITHUB_TOKEN` to your `.env` file.
*   **"Database Locked":** SQLite serves one write at a time. If the dashboard freezes, restart the backend process.
*   **"Wizard Button Missing":** Ensure you have run `upload-to-git.ps1` to get the latest `App.js` updates.

