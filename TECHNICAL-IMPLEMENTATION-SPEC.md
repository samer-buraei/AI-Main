# 🔧 Technical Implementation Specification
## GitHub Orchestrator - Pre-Coding Technical Details

**Version:** 1.0  
**Date:** 2024-01-15  
**Approach:** Beginner-Friendly (JSON columns, Lazy Analyzer via GitHub API)

---

## 📋 Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema (JSON-First Approach)](#database-schema)
3. [GitHub API Integration](#github-api-integration)
4. [AI Integration Strategy](#ai-integration-strategy)
5. [API Endpoints Specification](#api-endpoints)
6. [Frontend Components](#frontend-components)
7. [MCP Tools Implementation](#mcp-tools)
8. [Data Flow Diagrams](#data-flow)
9. [Error Handling](#error-handling)
10. [Testing Strategy](#testing-strategy)
11. [Implementation Order](#implementation-order)

---

## 🏗️ Architecture Overview

### High-Level Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER INTERACTION                         │
│  Dashboard → Create Project → Add GitHub URL → Submit      │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              BACKEND API (Express)                          │
│  POST /api/orchestrator/analyze                             │
│  → Creates orchestration_sessions record                    │
│  → Calls GitHub API (lazy analyzer)                        │
│  → Stores metadata in JSON column                           │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│           GITHUB API (No Cloning!)                          │
│  GET /repos/{owner}/{repo}/contents                         │
│  → Gets file list (tree)                                    │
│  → Reads package.json (or similar)                         │
│  → Returns metadata only                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              AI SERVICE (Claude/GPT)                        │
│  Prompt A: Analyze metadata → Tech stack summary            │
│  Prompt B: Generate questions → User interview              │
│  Prompt C: Create task plan → Final breakdown               │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              DATABASE (SQLite + JSON)                        │
│  orchestration_sessions table                                │
│  → repo_metadata (JSON)                                     │
│  → analysis_json (JSON)                                     │
│  → qa_history (JSON)                                        │
│  → final_plan (JSON)                                        │
└─────────────────────────────────────────────────────────────┘
```

### Key Design Principles

1. **JSON-First Storage**: Flexible, no schema migrations for new fields
2. **Lazy Analyzer**: GitHub API only, no cloning/downloading
3. **Incremental Processing**: One step at a time, store state between steps
4. **Mock-Friendly**: Can test UI without AI API calls
5. **Error Recovery**: Each step can be retried independently

---

## 💾 Database Schema

### Table: `orchestration_sessions`

```sql
CREATE TABLE IF NOT EXISTS orchestration_sessions (
  -- Primary Key
  id TEXT PRIMARY KEY,                    -- UUID v4
  
  -- Foreign Key
  project_id TEXT NOT NULL,               -- Links to projects table
  
  -- Status Tracking
  status TEXT DEFAULT 'pending',          -- State machine: pending → analyzing → waiting_for_user → planning → complete
  
  -- GitHub URL (Input)
  github_url TEXT,                        -- Full URL: https://github.com/owner/repo
  
  -- JSON COLUMNS (Flexible Storage)
  repo_metadata JSON,                    -- Step 1: Raw GitHub API response
  analysis_json JSON,                     -- Step 2: AI analysis of tech stack
  qa_history JSON,                       -- Step 3: Questions + user answers
  final_plan JSON,                       -- Step 4: Generated task breakdown
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign Key Constraint
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_orch_project ON orchestration_sessions(project_id);
CREATE INDEX IF NOT EXISTS idx_orch_status ON orchestration_sessions(status);
```

### JSON Column Structures

#### `repo_metadata` Structure
```json
{
  "success": true,
  "owner": "facebook",
  "repo": "react",
  "file_structure": [
    "package.json",
    "README.md",
    "src/",
    "tests/"
  ],
  "config_file_name": "package.json",
  "config_content": "{\"name\":\"react\",\"version\":\"18.0.0\",\"dependencies\":{...}}",
  "readme_preview": "React is a JavaScript library...",
  "detected_language": "JavaScript",
  "detected_framework": "React",
  "fetched_at": "2024-01-15T10:00:00Z"
}
```

#### `analysis_json` Structure
```json
{
  "tech_stack": {
    "language": "JavaScript",
    "framework": "React",
    "version": "18.2.0",
    "state_management": "Context API",
    "styling": "CSS Modules",
    "testing": "Jest"
  },
  "project_type": "frontend_library",
  "complexity": "high",
  "estimated_size": "large",
  "key_features": [
    "Component-based architecture",
    "Virtual DOM",
    "Hooks API"
  ],
  "analysis_date": "2024-01-15T10:01:00Z"
}
```

#### `qa_history` Structure
```json
{
  "questions": [
    {
      "id": "q1",
      "category": "Scope",
      "question": "What feature do you want to add?",
      "type": "multiple-choice",
      "options": [
        {"value": "auth", "label": "Authentication"},
        {"value": "chat", "label": "Real-time chat"},
        {"value": "other", "label": "Other"}
      ],
      "recommendation": "auth",
      "reasoning": "Based on your React setup, auth is a common first feature"
    }
  ],
  "responses": {
    "q1": "auth",
    "q2": ["jwt", "oauth"],
    "q3": "yes"
  },
  "submitted_at": "2024-01-15T10:05:00Z"
}
```

#### `final_plan` Structure
```json
{
  "phases": [
    {
      "name": "Setup & Infrastructure",
      "week": 1,
      "tasks": [
        {
          "id": "pending-001",
          "title": "Install authentication dependencies",
          "description": "Add @auth0/nextjs-auth0 or similar package",
          "agent": "@backend",
          "estimated_hours": 2,
          "dependencies": [],
          "files_to_modify": ["package.json"]
        }
      ]
    }
  ],
  "summary": {
    "total_tasks": 12,
    "by_agent": {
      "@backend": 6,
      "@frontend": 6
    },
    "estimated_timeline": "2-3 weeks",
    "estimated_hours": 48
  },
  "generated_at": "2024-01-15T10:10:00Z"
}
```

---

## 🔌 GitHub API Integration

### Implementation: `fetchRepoMetadata.js`

**Location:** `vibecoding-mcp-server/src/tools/fetchRepoMetadata.js`

**Dependencies:**
```json
{
  "axios": "^1.7.2"
}
```

**Function Signature:**
```javascript
async function fetchRepoMetadata(repoUrl: string): Promise<RepoMetadata>
```

**Technical Details:**

#### 1. URL Parsing
```javascript
// Input: "https://github.com/facebook/react"
// Output: { owner: "facebook", repo: "react" }

function parseGitHubUrl(url) {
  const cleanUrl = url.replace(/^https?:\/\/(www\.)?github\.com\//, '');
  const parts = cleanUrl.split('/').filter(Boolean);
  
  if (parts.length < 2) {
    throw new Error('Invalid GitHub URL format');
  }
  
  return {
    owner: parts[0],
    repo: parts[1],
    branch: parts[2] || 'main' // Default to 'main' branch
  };
}
```

#### 2. GitHub API Endpoints Used

**Endpoint 1: Get Repository Contents**
```javascript
GET https://api.github.com/repos/{owner}/{repo}/contents
Headers: {
  Accept: 'application/vnd.github.v3+json',
  // Optional: Authorization: 'token YOUR_TOKEN' (for private repos)
}
```

**Response Structure:**
```json
[
  {
    "name": "package.json",
    "type": "file",
    "size": 1234,
    "download_url": "https://raw.githubusercontent.com/..."
  },
  {
    "name": "src",
    "type": "dir"
  }
]
```

**Endpoint 2: Get File Content**
```javascript
GET https://api.github.com/repos/{owner}/{repo}/contents/{path}
Headers: {
  Accept: 'application/vnd.github.v3+json'
}
```

**Response Structure:**
```json
{
  "name": "package.json",
  "content": "ewogICJuYW1lIjogInJlYWN0IiwKICAidmVyc2lvbiI6ICIxOC4wLjAiCn0=",  // Base64 encoded
  "encoding": "base64",
  "size": 1234
}
```

#### 3. Config File Detection Logic

```javascript
const CONFIG_FILES = {
  javascript: ['package.json', 'package-lock.json', 'yarn.lock'],
  python: ['requirements.txt', 'pyproject.toml', 'setup.py', 'Pipfile'],
  java: ['pom.xml', 'build.gradle', 'build.gradle.kts'],
  ruby: ['Gemfile', 'Gemfile.lock'],
  go: ['go.mod', 'go.sum'],
  rust: ['Cargo.toml', 'Cargo.lock'],
  php: ['composer.json', 'composer.lock']
};

function findConfigFile(fileList) {
  // Priority order: package.json > requirements.txt > pom.xml > etc.
  const priority = [
    'package.json',
    'requirements.txt',
    'pyproject.toml',
    'pom.xml',
    'build.gradle',
    'go.mod',
    'Cargo.toml',
    'composer.json'
  ];
  
  for (const configFile of priority) {
    if (fileList.includes(configFile)) {
      return configFile;
    }
  }
  
  return null;
}
```

#### 4. Base64 Decoding

```javascript
function decodeBase64Content(encodedContent) {
  try {
    return Buffer.from(encodedContent, 'base64').toString('utf-8');
  } catch (error) {
    throw new Error(`Failed to decode content: ${error.message}`);
  }
}
```

#### 5. Content Size Limiting

```javascript
const MAX_CONFIG_SIZE = 3000; // characters
const MAX_README_SIZE = 2000; // characters

function truncateContent(content, maxSize) {
  if (content.length <= maxSize) {
    return content;
  }
  return content.substring(0, maxSize) + '... [truncated]';
}
```

#### 6. Error Handling

```javascript
async function fetchRepoMetadata(repoUrl) {
  try {
    const { owner, repo } = parseGitHubUrl(repoUrl);
    
    // Check if repo exists and is accessible
    const repoInfo = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}`,
      {
        headers: {
          'Accept': 'application/vnd.github.v3+json',
          // Add token if available: 'Authorization': `token ${process.env.GITHUB_TOKEN}`
        }
      }
    );
    
    // Get file tree
    const contents = await axios.get(
      `https://api.github.com/repos/${owner}/${repo}/contents`,
      { headers: { 'Accept': 'application/vnd.github.v3+json' } }
    );
    
    // Process files...
    
  } catch (error) {
    if (error.response?.status === 404) {
      return { success: false, error: 'Repository not found' };
    }
    if (error.response?.status === 403) {
      return { success: false, error: 'Rate limit exceeded or private repo' };
    }
    return { success: false, error: error.message };
  }
}
```

#### 7. Rate Limiting Considerations

**GitHub API Limits:**
- Unauthenticated: 60 requests/hour
- Authenticated: 5,000 requests/hour

**Strategy:**
```javascript
// Store in .env
GITHUB_TOKEN=your_personal_access_token

// Use in requests
const headers = {
  'Accept': 'application/vnd.github.v3+json',
  ...(process.env.GITHUB_TOKEN && {
    'Authorization': `token ${process.env.GITHUB_TOKEN}`
  })
};
```

**Caching Strategy:**
```javascript
// Cache repo metadata for 1 hour
const cache = new Map();

function getCachedMetadata(repoUrl) {
  const cached = cache.get(repoUrl);
  if (cached && Date.now() - cached.timestamp < 3600000) {
    return cached.data;
  }
  return null;
}
```

---

## 🤖 AI Integration Strategy

### AI Service Selection

**Options:**
1. **OpenAI GPT-4** - Best quality, $0.03/1K tokens
2. **Anthropic Claude** - Great for long context, $0.008/1K tokens
3. **Local LLM** - Free, but requires setup (Ollama, etc.)

**Recommendation:** Start with Claude (better price/quality), fallback to GPT-4

### Environment Setup

```javascript
// .env file
AI_PROVIDER=claude  // or 'openai' or 'local'
ANTHROPIC_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
LOCAL_LLM_URL=http://localhost:11434  // For Ollama
```

### Prompt Engineering

#### Prompt A: The Detective (Analyze Tech Stack)

**Input:**
```javascript
{
  file_structure: ["package.json", "src/", "tests/"],
  config_content: "{ \"name\": \"my-app\", \"dependencies\": {...} }",
  readme_preview: "A React application..."
}
```

**System Prompt:**
```
You are a Senior Tech Lead analyzing a codebase. Your job is to identify the technology stack and project characteristics.

Given the file structure and configuration file, provide a JSON response with:
1. Primary programming language
2. Main framework/library
3. Version (if detectable)
4. State management approach (if applicable)
5. Styling approach (if applicable)
6. Testing framework (if applicable)
7. Project type (frontend_app, backend_api, fullstack, library, etc.)
8. Complexity level (simple, medium, complex)
9. Estimated project size (small, medium, large)
10. Key architectural patterns detected

Be specific and accurate. If you cannot determine something, use null.
```

**Expected Output:**
```json
{
  "tech_stack": {
    "language": "JavaScript",
    "framework": "React",
    "version": "18.2.0",
    "state_management": "Context API",
    "styling": "CSS Modules",
    "testing": "Jest"
  },
  "project_type": "frontend_app",
  "complexity": "medium",
  "estimated_size": "medium",
  "patterns": ["Component-based", "Functional Components", "Hooks"]
}
```

#### Prompt B: The Interviewer (Generate Questions)

**Input:**
```javascript
{
  tech_stack: { language: "JavaScript", framework: "React" },
  user_goal: "Add authentication to my app"
}
```

**System Prompt:**
```
You are a Product Manager interviewing a developer about their project enhancement.

Context:
- Tech Stack: ${tech_stack}
- User's Goal: ${user_goal}

Generate 5-8 targeted questions to understand:
1. Scope and priorities
2. Technical preferences
3. Integration requirements
4. Timeline expectations
5. User experience goals

For each question:
- Make it specific to their tech stack
- Provide multiple-choice options when possible
- Include a "recommended" answer with reasoning
- Keep questions concise (1-2 sentences)

Return JSON array of questions.
```

**Expected Output:**
```json
{
  "questions": [
    {
      "id": "q1",
      "category": "Authentication Method",
      "question": "Which authentication method do you prefer?",
      "type": "multiple-choice",
      "options": [
        {"value": "jwt", "label": "JWT tokens (stateless)"},
        {"value": "session", "label": "Session-based (stateful)"},
        {"value": "oauth", "label": "OAuth (Google, GitHub, etc.)"}
      ],
      "recommendation": "jwt",
      "reasoning": "JWT works well with React and provides stateless authentication"
    }
  ]
}
```

#### Prompt C: The Planner (Generate Task Breakdown)

**Input:**
```javascript
{
  tech_stack: {...},
  user_goal: "Add authentication",
  qa_responses: { q1: "jwt", q2: "yes", ... }
}
```

**System Prompt:**
```
You are a Technical Project Manager creating a detailed implementation plan.

Context:
- Tech Stack: ${tech_stack}
- Goal: ${user_goal}
- User Responses: ${qa_responses}

Create a comprehensive task breakdown with:
1. Phases (logical groupings, typically 1-2 weeks each)
2. Tasks per phase (each task should be 2-8 hours of work)
3. For each task:
   - Clear, actionable title
   - Detailed description (what, why, how)
   - Agent assignment (@backend, @frontend, @devops, @qa)
   - Estimated hours
   - Dependencies (array of task IDs)
   - Files to modify (if known from codebase structure)

Consider:
- Follow existing code patterns
- Identify integration points
- Realistic timeline
- Test requirements

Return JSON with phases and summary.
```

**Expected Output:**
```json
{
  "phases": [
    {
      "name": "Backend Setup",
      "week": 1,
      "tasks": [
        {
          "id": "pending-001",
          "title": "Install JWT dependencies",
          "description": "Add jsonwebtoken and bcrypt packages to package.json",
          "agent": "@backend",
          "estimated_hours": 1,
          "dependencies": [],
          "files_to_modify": ["package.json"]
        }
      ]
    }
  ],
  "summary": {
    "total_tasks": 12,
    "by_agent": {"@backend": 6, "@frontend": 6},
    "estimated_timeline": "2-3 weeks",
    "estimated_hours": 48
  }
}
```

### AI Service Wrapper

**File:** `vibecoding-backend/src/services/aiService.js`

```javascript
const axios = require('axios');

class AIService {
  constructor() {
    this.provider = process.env.AI_PROVIDER || 'claude';
    this.apiKey = this.provider === 'claude' 
      ? process.env.ANTHROPIC_API_KEY 
      : process.env.OPENAI_API_KEY;
  }

  async analyzeTechStack(metadata) {
    const prompt = this.buildAnalysisPrompt(metadata);
    return await this.callAI(prompt);
  }

  async generateQuestions(context) {
    const prompt = this.buildQuestionPrompt(context);
    return await this.callAI(prompt);
  }

  async generateTaskPlan(context) {
    const prompt = this.buildPlanPrompt(context);
    return await this.callAI(prompt);
  }

  async callAI(prompt) {
    if (this.provider === 'claude') {
      return await this.callClaude(prompt);
    } else if (this.provider === 'openai') {
      return await this.callOpenAI(prompt);
    } else if (this.provider === 'local') {
      return await this.callLocalLLM(prompt);
    }
  }

  async callClaude(prompt) {
    const response = await axios.post(
      'https://api.anthropic.com/v1/messages',
      {
        model: 'claude-3-opus-20240229',
        max_tokens: 4096,
        messages: [
          { role: 'user', content: prompt }
        ]
      },
      {
        headers: {
          'x-api-key': this.apiKey,
          'anthropic-version': '2023-06-01',
          'content-type': 'application/json'
        }
      }
    );
    
    return JSON.parse(response.data.content[0].text);
  }

  async callOpenAI(prompt) {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-4',
        messages: [
          { role: 'system', content: 'You are a helpful technical assistant.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000
      },
      {
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    return JSON.parse(response.data.choices[0].message.content);
  }

  async callLocalLLM(prompt) {
    // For Ollama or similar
    const response = await axios.post(
      `${process.env.LOCAL_LLM_URL}/api/generate`,
      {
        model: 'llama2',
        prompt: prompt,
        stream: false
      }
    );
    
    return JSON.parse(response.data.response);
  }
}

module.exports = new AIService();
```

---

## 🔌 API Endpoints Specification

### 1. POST `/api/orchestrator/analyze`

**Purpose:** Start repository analysis

**Request:**
```json
{
  "project_id": "proj-123",
  "github_url": "https://github.com/facebook/react"
}
```

**Response:**
```json
{
  "success": true,
  "session_id": "orch-456",
  "status": "analyzing",
  "message": "Analyzing repository... This may take 30-60 seconds."
}
```

**Implementation:**
```javascript
router.post('/analyze', async (req, res) => {
  try {
    const { project_id, github_url } = req.body;
    
    // Validate
    if (!project_id || !github_url) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Create session
    const sessionId = uuidv4();
    const db = getDatabase();
    
    db.run(
      `INSERT INTO orchestration_sessions 
       (id, project_id, github_url, status) 
       VALUES (?, ?, ?, ?)`,
      [sessionId, project_id, github_url, 'analyzing'],
      async (err) => {
        if (err) {
          return res.status(500).json({ error: err.message });
        }
        
        // Start async analysis
        analyzeRepository(sessionId, github_url)
          .catch(error => {
            // Update session with error
            db.run(
              `UPDATE orchestration_sessions 
               SET status = 'failed', 
                   repo_metadata = ? 
               WHERE id = ?`,
              [JSON.stringify({ error: error.message }), sessionId]
            );
          });
        
        res.json({
          success: true,
          session_id: sessionId,
          status: 'analyzing',
          message: 'Analysis started...'
        });
      }
    );
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
```

### 2. GET `/api/orchestrator/:sessionId/status`

**Purpose:** Poll for analysis status

**Response:**
```json
{
  "session_id": "orch-456",
  "status": "waiting_for_user",
  "progress": {
    "step": "analysis_complete",
    "repo_metadata": { /* ... */ },
    "analysis_json": { /* ... */ }
  }
}
```

### 3. POST `/api/orchestrator/:sessionId/questionnaire/submit`

**Purpose:** Submit user responses

**Request:**
```json
{
  "responses": {
    "q1": "jwt",
    "q2": ["yes", "no"],
    "q3": "2-3 weeks"
  }
}
```

**Response:**
```json
{
  "success": true,
  "status": "planning",
  "message": "Generating task plan..."
}
```

### 4. GET `/api/orchestrator/:sessionId/plan`

**Purpose:** Get generated task plan

**Response:**
```json
{
  "session_id": "orch-456",
  "status": "planning_complete",
  "plan": { /* final_plan JSON structure */ }
}
```

### 5. POST `/api/orchestrator/:sessionId/approve`

**Purpose:** Approve plan and create tasks

**Request:**
```json
{
  "approved": true,
  "modifications": [
    {
      "task_id": "pending-001",
      "changes": {
        "estimated_hours": 3
      }
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "tasks_created": 12,
  "task_ids": ["T-001", "T-002", ...]
}
```

---

## 🎨 Frontend Components

### 1. Enhanced ProjectCreationModal

**New Fields:**
```typescript
interface ProjectForm {
  // Existing fields...
  github_url?: string;
  goal?: string;
  enable_orchestration?: boolean;
}
```

**UI Changes:**
```jsx
{enableOrchestration && (
  <div className="orchestration-section">
    <label>GitHub Repository URL</label>
    <input
      type="url"
      placeholder="https://github.com/owner/repo"
      value={githubUrl}
      onChange={(e) => setGithubUrl(e.target.value)}
    />
    
    <label>What do you want to build?</label>
    <textarea
      placeholder="e.g., Add authentication with JWT"
      value={goal}
      onChange={(e) => setGoal(e.target.value)}
    />
  </div>
)}
```

### 2. OrchestrationFlow Component

**States:**
- `analyzing` - Show spinner, poll status
- `questioning` - Show questionnaire
- `planning` - Show "Generating plan..." message
- `reviewing` - Show plan for approval
- `complete` - Redirect to Kanban board

**Polling Logic:**
```javascript
useEffect(() => {
  if (status === 'analyzing' || status === 'planning') {
    const interval = setInterval(async () => {
      const status = await fetchOrchestrationStatus(sessionId);
      setStatus(status.status);
      if (status.status === 'waiting_for_user') {
        setQuestions(status.questions);
      }
    }, 2000); // Poll every 2 seconds
    
    return () => clearInterval(interval);
  }
}, [status, sessionId]);
```

---

## 🔧 MCP Tools

### Tool: `orchestrate-project`

**Location:** `vibecoding-mcp-server/src/tools/orchestrateProject.js`

**Implementation:**
```javascript
const fetchRepoMetadata = require('./fetchRepoMetadata');
const aiService = require('../../vibecoding-backend/src/services/aiService');

async function orchestrateProject(input) {
  const { projectId, githubUrl, goal } = input;
  
  // 1. Fetch metadata
  const metadata = await fetchRepoMetadata(githubUrl);
  
  // 2. Analyze with AI
  const analysis = await aiService.analyzeTechStack(metadata);
  
  // 3. Generate questions
  const questions = await aiService.generateQuestions({
    tech_stack: analysis.tech_stack,
    goal: goal
  });
  
  // 4. Create session in DB
  const sessionId = await createOrchestrationSession({
    project_id: projectId,
    github_url: githubUrl,
    repo_metadata: metadata,
    analysis_json: analysis,
    status: 'waiting_for_user'
  });
  
  return {
    sessionId,
    status: 'waiting_for_user',
    analysis,
    questions
  };
}
```

---

## 🔄 Data Flow

### Complete Flow Diagram

```
User Action: Create Project + GitHub URL
    ↓
[Frontend] POST /api/projects
    ↓
[Backend] Create project record
    ↓
[Frontend] POST /api/orchestrator/analyze
    ↓
[Backend] Create orchestration_sessions record (status: 'analyzing')
    ↓
[Backend] Async: fetchRepoMetadata(githubUrl)
    ↓
[GitHub API] GET /repos/{owner}/{repo}/contents
    ↓
[Backend] Store in repo_metadata JSON column
    ↓
[Backend] Call AI: analyzeTechStack(metadata)
    ↓
[AI Service] Returns tech stack analysis
    ↓
[Backend] Store in analysis_json, update status: 'waiting_for_user'
    ↓
[Frontend] Poll GET /api/orchestrator/:id/status
    ↓
[Frontend] Display questions to user
    ↓
[User] Answers questions
    ↓
[Frontend] POST /api/orchestrator/:id/questionnaire/submit
    ↓
[Backend] Store in qa_history, update status: 'planning'
    ↓
[Backend] Call AI: generateTaskPlan(context)
    ↓
[AI Service] Returns task breakdown
    ↓
[Backend] Store in final_plan, update status: 'planning_complete'
    ↓
[Frontend] Display plan for review
    ↓
[User] Approves plan
    ↓
[Frontend] POST /api/orchestrator/:id/approve
    ↓
[Backend] Create tasks in tasks table
    ↓
[Frontend] Redirect to Kanban board
```

---

## ⚠️ Error Handling

### Error Types

1. **GitHub API Errors**
   - 404: Repo not found
   - 403: Rate limit or private repo
   - 500: GitHub server error

2. **AI Service Errors**
   - API key invalid
   - Rate limit exceeded
   - Invalid JSON response

3. **Database Errors**
   - Foreign key constraint
   - JSON parsing error

### Error Handling Strategy

```javascript
async function analyzeRepository(sessionId, githubUrl) {
  try {
    // Step 1: Fetch metadata
    const metadata = await fetchRepoMetadata(githubUrl);
    if (!metadata.success) {
      throw new Error(metadata.error);
    }
    
    // Step 2: Store metadata
    await updateSession(sessionId, {
      repo_metadata: JSON.stringify(metadata),
      status: 'analyzing_ai'
    });
    
    // Step 3: AI analysis
    const analysis = await aiService.analyzeTechStack(metadata);
    
    // Step 4: Store analysis
    await updateSession(sessionId, {
      analysis_json: JSON.stringify(analysis),
      status: 'waiting_for_user'
    });
    
  } catch (error) {
    // Update session with error
    await updateSession(sessionId, {
      status: 'failed',
      repo_metadata: JSON.stringify({
        error: error.message,
        stack: error.stack
      })
    });
    
    // Log error
    logger.error('Repository analysis failed', {
      sessionId,
      error: error.message
    });
  }
}
```

---

## 🧪 Testing Strategy

### Unit Tests

```javascript
// test/fetchRepoMetadata.test.js
describe('fetchRepoMetadata', () => {
  it('should parse GitHub URL correctly', () => {
    const result = parseGitHubUrl('https://github.com/facebook/react');
    expect(result).toEqual({ owner: 'facebook', repo: 'react' });
  });
  
  it('should fetch package.json from public repo', async () => {
    const metadata = await fetchRepoMetadata('https://github.com/facebook/react');
    expect(metadata.success).toBe(true);
    expect(metadata.config_file_name).toBe('package.json');
  });
});
```

### Integration Tests

```javascript
// test/orchestrator.test.js
describe('Orchestration Flow', () => {
  it('should complete full flow', async () => {
    // 1. Create project
    const project = await createProject({ name: 'Test' });
    
    // 2. Start analysis
    const session = await startAnalysis(project.id, 'https://github.com/test/repo');
    
    // 3. Wait for analysis (mock AI)
    await waitForStatus(session.id, 'waiting_for_user');
    
    // 4. Submit questionnaire
    await submitQuestionnaire(session.id, mockResponses);
    
    // 5. Verify plan generated
    const plan = await getPlan(session.id);
    expect(plan.summary.total_tasks).toBeGreaterThan(0);
  });
});
```

### Mock Data for Testing

```javascript
// test/mocks/repoMetadata.mock.js
const mockRepoMetadata = {
  success: true,
  owner: 'test',
  repo: 'test-repo',
  file_structure: ['package.json', 'src/', 'README.md'],
  config_file_name: 'package.json',
  config_content: JSON.stringify({
    name: 'test-app',
    dependencies: { react: '^18.0.0' }
  })
};
```

---

## 📝 Implementation Order

### Phase 1: Database & Basic Structure (Day 1-2)

1. ✅ Add `orchestration_sessions` table to database.js
2. ✅ Test table creation
3. ✅ Create basic API route structure
4. ✅ Test database operations

### Phase 2: GitHub Integration (Day 3-4)

1. ✅ Create `fetchRepoMetadata.js`
2. ✅ Test with public repos
3. ✅ Add error handling
4. ✅ Add caching (optional)

### Phase 3: API Endpoints (Day 5-6)

1. ✅ Implement `/analyze` endpoint
2. ✅ Implement `/status` endpoint
3. ✅ Test with mock data
4. ✅ Add error handling

### Phase 4: AI Integration (Day 7-8)

1. ✅ Create `aiService.js`
2. ✅ Implement analysis prompt
3. ✅ Test with mock AI responses
4. ✅ Connect to real AI (optional)

### Phase 5: Frontend (Day 9-10)

1. ✅ Update project creation form
2. ✅ Create orchestration flow component
3. ✅ Add polling logic
4. ✅ Test UI flow

### Phase 6: Questionnaire (Day 11-12)

1. ✅ Implement question generation
2. ✅ Create questionnaire component
3. ✅ Implement submission
4. ✅ Test full flow

### Phase 7: Task Planning (Day 13-14)

1. ✅ Implement plan generation
2. ✅ Create plan review component
3. ✅ Implement approval
4. ✅ Test task creation

---

## ✅ Pre-Coding Checklist

- [ ] Database schema reviewed and approved
- [ ] GitHub API access confirmed (token if needed)
- [ ] AI service selected and API key obtained
- [ ] Environment variables documented
- [ ] Error handling strategy agreed upon
- [ ] Testing approach confirmed
- [ ] Implementation order approved
- [ ] Mock data strategy for testing

---

**This specification is ready for code review and implementation!**

