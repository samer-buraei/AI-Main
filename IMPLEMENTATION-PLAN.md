# 🎯 IMPLEMENTATION PLAN: GitHub-Orchestrator Workflow

## Executive Summary

**Goal:** Enable AI orchestrator to analyze GitHub repositories, ask clarifying questions, and automatically generate + execute task plans.

**Timeline:** 4-6 weeks for full implementation  
**Complexity:** Medium-High  
**Risk Level:** Medium  
**ROI:** Very High (10x productivity improvement)

---

## 🏗️ Architecture Overview

### Current System
```
┌─────────────────┐
│   Dashboard     │ ← User creates projects manually
│   (React)       │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   Backend API   │ ← Stores projects & tasks
│   (Express)     │
└────────┬────────┘
         │
         ↓
┌─────────────────┐
│   SQLite DB     │ ← Persists data
└─────────────────┘

         +

┌─────────────────┐
│   MCP Server    │ ← Cursor calls 4 tools
│   (Express)     │    (analyze-request, etc.)
└─────────────────┘
```

### Proposed Enhanced System
```
┌─────────────────────────────────────────────┐
│              Dashboard (React)              │
│                                             │
│  ┌──────────────┐  ┌──────────────────┐   │
│  │ Project Form │  │ Questionnaire UI │   │
│  │ + GitHub URLs│  │ (Interactive)    │   │
│  └──────────────┘  └──────────────────┘   │
└─────────────┬───────────────────────────────┘
              │
              ↓
┌─────────────────────────────────────────────┐
│          Backend API (Express)              │
│                                             │
│  ┌─────────────┐  ┌──────────────────┐    │
│  │ GitHub      │  │ Questionnaire    │    │
│  │ Integration │  │ Manager          │    │
│  └─────────────┘  └──────────────────┘    │
│                                             │
│  ┌─────────────┐  ┌──────────────────┐    │
│  │ Codebase    │  │ Task Generator   │    │
│  │ Analyzer    │  │ (AI-powered)     │    │
│  └─────────────┘  └──────────────────┘    │
└─────────────┬───────────────────────────────┘
              │
              ↓
┌─────────────────────────────────────────────┐
│            SQLite Database                  │
│                                             │
│  • projects (enhanced schema)               │
│  • tasks                                    │
│  • orchestration_sessions (NEW)             │
│  • questionnaire_responses (NEW)            │
│  • codebase_analysis (NEW)                  │
└─────────────────────────────────────────────┘

              +

┌─────────────────────────────────────────────┐
│         MCP Server (Express)                │
│                                             │
│  Existing Tools:                            │
│  • analyze-request                          │
│  • generate-context-pack                    │
│  • spawn-sub-orchestrator                   │
│  • update-task-status                       │
│                                             │
│  NEW Tools:                                 │
│  • orchestrate-project (GitHub → Questions) │
│  • submit-questionnaire (Answers → Tasks)   │
│  • analyze-repository (Deep code analysis)  │
│  • execute-plan (Auto-implementation)       │
└─────────────────────────────────────────────┘

              +

┌─────────────────────────────────────────────┐
│        External Services (NEW)              │
│                                             │
│  • GitHub API (repo access)                 │
│  • AI Service (Claude/GPT for analysis)     │
│  • Redis (caching, optional)                │
└─────────────────────────────────────────────┘
```

---

## 📊 Data Model Changes

### 1. Enhanced `projects` Table
```sql
-- Existing columns
id TEXT PRIMARY KEY
name TEXT NOT NULL
description TEXT
project_type TEXT
tech_stack TEXT  -- JSON
created_at DATETIME
updated_at DATETIME

-- NEW columns
github_repos TEXT                  -- JSON array of repo URLs
orchestration_status TEXT          -- 'pending'|'analyzing'|'questioning'|'planning'|'executing'|'complete'
questionnaire_data TEXT            -- JSON {questions, responses, timestamp}
codebase_analysis TEXT             -- JSON {structure, dependencies, patterns}
orchestration_plan TEXT            -- JSON {phases, tasks, timeline}
goal TEXT                          -- User's high-level goal
auto_execution_enabled BOOLEAN     -- Allow AI to auto-implement
```

### 2. NEW `orchestration_sessions` Table
```sql
CREATE TABLE orchestration_sessions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  status TEXT NOT NULL,              -- 'analyzing'|'questioning'|'planning'|'executing'|'complete'|'failed'
  current_phase TEXT,                -- Which phase of orchestration
  started_at DATETIME,
  completed_at DATETIME,
  
  -- Analysis data
  repos_analyzed TEXT,               -- JSON array of analyzed repos
  analysis_summary TEXT,             -- JSON {languages, frameworks, patterns}
  
  -- Questionnaire data
  questions_generated TEXT,          -- JSON array of questions
  responses_received TEXT,           -- JSON array of responses
  
  -- Planning data
  tasks_planned INTEGER,             -- Number of tasks to create
  estimated_timeline TEXT,           -- "4-6 weeks"
  
  -- Execution data
  tasks_created INTEGER,
  tasks_completed INTEGER,
  
  -- Error handling
  errors TEXT,                       -- JSON array of errors
  
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

### 3. NEW `codebase_snapshots` Table
```sql
CREATE TABLE codebase_snapshots (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  repo_url TEXT NOT NULL,
  snapshot_date DATETIME,
  
  -- Repository info
  repo_name TEXT,
  repo_owner TEXT,
  default_branch TEXT,
  
  -- Structure analysis
  file_structure TEXT,               -- JSON tree of files
  entry_points TEXT,                 -- JSON array of main files
  
  -- Tech stack detection
  languages TEXT,                    -- JSON {language: percentage}
  frameworks TEXT,                   -- JSON array of detected frameworks
  dependencies TEXT,                 -- JSON from package.json/requirements.txt
  
  -- Code metrics
  total_files INTEGER,
  total_lines INTEGER,
  component_count INTEGER,
  api_endpoint_count INTEGER,
  
  -- Patterns detected
  architecture_pattern TEXT,         -- "MVC", "Redux", "Microservices"
  state_management TEXT,             -- "Redux", "Context", "MobX"
  testing_framework TEXT,            -- "Jest", "Mocha", etc.
  
  FOREIGN KEY (project_id) REFERENCES projects(id)
);
```

### 4. Database Migration Script
```sql
-- migrations/005_add_orchestration.sql

-- Add columns to projects
ALTER TABLE projects ADD COLUMN github_repos TEXT;
ALTER TABLE projects ADD COLUMN orchestration_status TEXT DEFAULT 'pending';
ALTER TABLE projects ADD COLUMN questionnaire_data TEXT;
ALTER TABLE projects ADD COLUMN codebase_analysis TEXT;
ALTER TABLE projects ADD COLUMN orchestration_plan TEXT;
ALTER TABLE projects ADD COLUMN goal TEXT;
ALTER TABLE projects ADD COLUMN auto_execution_enabled BOOLEAN DEFAULT 0;

-- Create new tables
CREATE TABLE orchestration_sessions (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  status TEXT NOT NULL,
  current_phase TEXT,
  started_at DATETIME,
  completed_at DATETIME,
  repos_analyzed TEXT,
  analysis_summary TEXT,
  questions_generated TEXT,
  responses_received TEXT,
  tasks_planned INTEGER,
  estimated_timeline TEXT,
  tasks_created INTEGER,
  tasks_completed INTEGER,
  errors TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

CREATE TABLE codebase_snapshots (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL,
  repo_url TEXT NOT NULL,
  snapshot_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  repo_name TEXT,
  repo_owner TEXT,
  default_branch TEXT,
  file_structure TEXT,
  entry_points TEXT,
  languages TEXT,
  frameworks TEXT,
  dependencies TEXT,
  total_files INTEGER,
  total_lines INTEGER,
  component_count INTEGER,
  api_endpoint_count INTEGER,
  architecture_pattern TEXT,
  state_management TEXT,
  testing_framework TEXT,
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX idx_orchestration_project ON orchestration_sessions(project_id);
CREATE INDEX idx_orchestration_status ON orchestration_sessions(status);
CREATE INDEX idx_snapshot_project ON codebase_snapshots(project_id);
```

---

## 🔌 API Endpoints (Backend)

### Projects API (Enhanced)

#### POST `/api/projects`
**Enhanced to accept GitHub repos**

Request:
```json
{
  "name": "TaskMaster Enhancement",
  "description": "Add collaboration features",
  "project_type": "enhancement",
  "tech_stack": {
    "frontend": "React + TypeScript",
    "backend": "Node.js + Express",
    "database": "PostgreSQL"
  },
  "github_repos": [
    "https://github.com/company/taskmaster-web",
    "https://github.com/company/taskmaster-api"
  ],
  "goal": "Add team workspaces and real-time collaboration",
  "auto_execution_enabled": true
}
```

Response:
```json
{
  "project": {
    "id": "proj-123",
    "name": "TaskMaster Enhancement",
    "orchestration_status": "analyzing",
    "github_repos": ["https://github.com/company/taskmaster-web", ...],
    "created_at": "2024-01-15T10:00:00Z"
  },
  "orchestration_session": {
    "id": "orch-456",
    "status": "analyzing",
    "message": "Analyzing repositories... This may take 1-2 minutes."
  }
}
```

#### GET `/api/projects/:id/orchestration`
**Get orchestration status**

Response:
```json
{
  "session": {
    "id": "orch-456",
    "status": "questioning",
    "current_phase": "questionnaire",
    "progress": {
      "repos_analyzed": 2,
      "questions_generated": 8,
      "responses_received": 0
    }
  },
  "questions": [
    {
      "id": "q1",
      "category": "Scope",
      "question": "Should team workspaces be hierarchical or flat?",
      "type": "multiple-choice",
      "options": [
        {"value": "flat", "label": "Flat: All teams equal"},
        {"value": "hierarchical", "label": "Hierarchical: Org → Teams"},
        {"value": "flexible", "label": "Flexible: Ad-hoc workspaces"}
      ],
      "recommendation": "hierarchical",
      "reasoning": "Your existing user model supports hierarchical structure"
    },
    // ... more questions
  ]
}
```

### Orchestration API (NEW)

#### POST `/api/orchestration/analyze`
**Trigger repository analysis**

Request:
```json
{
  "project_id": "proj-123",
  "github_repos": [
    "https://github.com/company/taskmaster-web"
  ]
}
```

Response:
```json
{
  "session_id": "orch-456",
  "status": "analyzing",
  "estimated_time": "60-120 seconds"
}
```

#### POST `/api/orchestration/questionnaire/submit`
**Submit questionnaire responses**

Request:
```json
{
  "session_id": "orch-456",
  "responses": {
    "q1": "hierarchical",
    "q2": ["live_updates", "presence", "comments"],
    "q3": "medium_detail",
    "q4": "yes_all_acceptable",
    "q5": "standard_4_6_weeks"
  }
}
```

Response:
```json
{
  "session_id": "orch-456",
  "status": "planning",
  "message": "Generating task breakdown based on your responses...",
  "estimated_time": "30-60 seconds"
}
```

#### GET `/api/orchestration/:sessionId/plan`
**Get generated task plan**

Response:
```json
{
  "session_id": "orch-456",
  "status": "planning_complete",
  "plan": {
    "phases": [
      {
        "name": "Infrastructure",
        "week": 1,
        "tasks": 8,
        "tasks_list": [
          {
            "id": "pending-001",
            "title": "Add Redis client & configuration",
            "description": "Setup Redis for caching and pub/sub",
            "agent": "@backend",
            "estimated_hours": 4,
            "dependencies": []
          },
          // ... more tasks
        ]
      },
      // ... more phases
    ],
    "summary": {
      "total_tasks": 48,
      "by_agent": {
        "@backend": 22,
        "@frontend": 23,
        "@devops": 1,
        "@qa": 2
      },
      "estimated_timeline": "6 weeks",
      "estimated_hours": 384
    }
  }
}
```

#### POST `/api/orchestration/:sessionId/approve`
**Approve and create tasks**

Request:
```json
{
  "approved": true,
  "modifications": [
    {
      "task_id": "pending-015",
      "changes": {
        "description": "Updated description",
        "estimated_hours": 6
      }
    }
  ],
  "auto_execute": true
}
```

Response:
```json
{
  "session_id": "orch-456",
  "status": "executing",
  "tasks_created": 48,
  "task_ids": ["T-001", "T-002", ...],
  "message": "Tasks created. Auto-execution started."
}
```

### GitHub Integration API (NEW)

#### POST `/api/github/analyze-repo`
**Analyze a single repository**

Request:
```json
{
  "repo_url": "https://github.com/company/taskmaster-web",
  "depth": "full"  // or "quick"
}
```

Response:
```json
{
  "repo": {
    "name": "taskmaster-web",
    "owner": "company",
    "url": "https://github.com/company/taskmaster-web",
    "default_branch": "main",
    "last_commit": "2024-01-10T15:30:00Z"
  },
  "analysis": {
    "languages": {
      "TypeScript": 75.3,
      "JavaScript": 20.1,
      "CSS": 4.6
    },
    "frameworks": ["React", "Redux Toolkit", "React Router"],
    "dependencies": {
      "react": "^18.2.0",
      "redux": "^4.2.1",
      // ... more
    },
    "structure": {
      "src/": {
        "components/": 67,
        "pages/": 23,
        "services/": 8,
        "utils/": 15
      }
    },
    "patterns": {
      "state_management": "Redux Toolkit",
      "styling": "TailwindCSS + CSS Modules",
      "routing": "React Router v6",
      "api_client": "Axios with interceptors",
      "testing": "Jest + React Testing Library"
    },
    "metrics": {
      "total_files": 245,
      "total_lines": 18350,
      "component_count": 67,
      "test_coverage": 65.3
    }
  }
}
```

---

## 🛠️ MCP Tools (New)

### Tool 1: `orchestrate-project`

**Purpose:** Start orchestration workflow for a project

**Input Schema:**
```typescript
{
  projectId: string;
  githubRepos: string[];
  goal: string;
  options?: {
    analysisDepth: 'quick' | 'full';
    autoExecute: boolean;
  };
}
```

**Implementation Flow:**
```javascript
async function orchestrateProject(input) {
  const { projectId, githubRepos, goal, options } = input;
  
  // 1. Create orchestration session
  const session = await createOrchestrationSession({
    project_id: projectId,
    status: 'analyzing'
  });
  
  // 2. Analyze each repository
  const analyses = [];
  for (const repoUrl of githubRepos) {
    const analysis = await analyzeRepository(repoUrl, options?.analysisDepth);
    analyses.push(analysis);
    
    // Save snapshot
    await saveCodebaseSnapshot(projectId, repoUrl, analysis);
  }
  
  // 3. Generate contextual questions
  const questions = await generateQuestions({
    goal,
    analyses,
    projectType: 'enhancement'  // or 'greenfield', 'refactor'
  });
  
  // 4. Update session
  await updateSession(session.id, {
    status: 'questioning',
    repos_analyzed: JSON.stringify(analyses),
    questions_generated: JSON.stringify(questions)
  });
  
  // 5. Return questions to user
  return {
    sessionId: session.id,
    status: 'awaiting_responses',
    analysis: analyses,
    questions: questions,
    nextAction: 'User must answer questions via submit-questionnaire'
  };
}
```

**AI Integration Point:**
```javascript
async function generateQuestions(context) {
  const prompt = `
You are analyzing a project enhancement request.

Goal: ${context.goal}

Existing Codebases:
${context.analyses.map(a => `
- ${a.repo.name}: ${a.languages} using ${a.frameworks.join(', ')}
  Structure: ${JSON.stringify(a.structure)}
  Patterns: ${JSON.stringify(a.patterns)}
`).join('\n')}

Generate 5-10 targeted questions to understand:
1. Scope and priorities
2. Technical preferences
3. Integration requirements
4. Timeline and constraints
5. User experience goals

Return JSON array of questions with:
- id, category, question, type, options (if multiple-choice)
- recommendation (your suggested answer)
- reasoning (why you recommend it)
`;

  const response = await callAI(prompt);
  return JSON.parse(response);
}
```

---

### Tool 2: `submit-questionnaire`

**Purpose:** Process responses and generate task plan

**Input Schema:**
```typescript
{
  sessionId: string;
  responses: Record<string, any>;
}
```

**Implementation Flow:**
```javascript
async function submitQuestionnaire(input) {
  const { sessionId, responses } = input;
  
  // 1. Get session and analysis
  const session = await getSession(sessionId);
  const analyses = JSON.parse(session.repos_analyzed);
  const questions = JSON.parse(session.questions_generated);
  
  // 2. Update session with responses
  await updateSession(sessionId, {
    status: 'planning',
    responses_received: JSON.stringify(responses)
  });
  
  // 3. Generate task breakdown using AI
  const plan = await generateTaskPlan({
    goal: session.goal,
    analyses,
    questions,
    responses
  });
  
  // 4. Save plan to session
  await updateSession(sessionId, {
    status: 'planning_complete',
    tasks_planned: plan.tasks.length,
    estimated_timeline: plan.timeline
  });
  
  // 5. Save plan to project
  await updateProject(session.project_id, {
    orchestration_plan: JSON.stringify(plan)
  });
  
  return {
    sessionId,
    status: 'planning_complete',
    plan,
    nextAction: 'Review and approve plan via approve-plan'
  };
}
```

**AI Integration Point:**
```javascript
async function generateTaskPlan(context) {
  const prompt = `
You are creating a detailed implementation plan.

Goal: ${context.goal}

Codebase Analysis:
${JSON.stringify(context.analyses, null, 2)}

User's Responses:
${JSON.stringify(context.responses, null, 2)}

Generate a comprehensive task breakdown with:
1. Phases (logical groupings by week)
2. Tasks per phase
3. Each task should have:
   - Title (clear, actionable)
   - Description (detailed what/why/how)
   - Agent assignment (@backend, @frontend, @devops, @qa)
   - Estimated hours
   - Dependencies (task IDs it depends on)
   - Files to modify (if known)

Consider:
- Existing code patterns (follow their conventions)
- Integration points (identify files to modify)
- Dependencies between tasks
- Realistic timeline
- Test requirements

Return JSON with structure:
{
  "phases": [
    {
      "name": "Phase name",
      "week": 1,
      "tasks": [/* task objects */]
    }
  ],
  "timeline": "6 weeks",
  "total_hours": 384
}
`;

  const response = await callAI(prompt);
  return JSON.parse(response);
}
```

---

### Tool 3: `analyze-repository`

**Purpose:** Deep analysis of a GitHub repository

**Input Schema:**
```typescript
{
  repoUrl: string;
  depth: 'quick' | 'full';
  focusAreas?: string[];  // e.g., ['components', 'api', 'database']
}
```

**Implementation:**
```javascript
async function analyzeRepository(repoUrl, depth = 'full') {
  // 1. Fetch repo metadata from GitHub API
  const repoInfo = await fetchGitHubRepoInfo(repoUrl);
  
  // 2. Clone or fetch file tree
  const fileTree = await getFileTree(repoUrl);
  
  // 3. Detect languages and frameworks
  const languages = await detectLanguages(fileTree);
  const frameworks = await detectFrameworks(fileTree);
  
  // 4. Analyze package dependencies
  const packageFiles = await getPackageFiles(fileTree);
  const dependencies = await analyzeDependencies(packageFiles);
  
  // 5. Detect patterns and architecture
  const patterns = await detectPatterns(fileTree, dependencies);
  
  // 6. Calculate metrics
  const metrics = await calculateMetrics(fileTree);
  
  // 7. If full depth, analyze code structure
  if (depth === 'full') {
    const structure = await analyzeCodeStructure(fileTree);
    const entryPoints = await findEntryPoints(fileTree);
    
    return {
      repo: repoInfo,
      languages,
      frameworks,
      dependencies,
      patterns,
      metrics,
      structure,
      entryPoints
    };
  }
  
  return {
    repo: repoInfo,
    languages,
    frameworks,
    dependencies,
    patterns,
    metrics
  };
}
```

---

### Tool 4: `execute-orchestration-plan`

**Purpose:** Auto-execute approved task plan with AI agents

**Input Schema:**
```typescript
{
  sessionId: string;
  approved: boolean;
  modifications?: Array<{
    taskId: string;
    changes: Partial<Task>;
  }>;
}
```

**Implementation Flow:**
```javascript
async function executeOrchestrationPlan(input) {
  const { sessionId, approved, modifications } = input;
  
  if (!approved) {
    return { status: 'cancelled', message: 'Plan not approved' };
  }
  
  // 1. Get plan and create tasks
  const session = await getSession(sessionId);
  const plan = JSON.parse(session.orchestration_plan);
  
  // Apply modifications
  if (modifications) {
    applyModifications(plan, modifications);
  }
  
  // 2. Create all tasks in database
  const createdTasks = [];
  for (const phase of plan.phases) {
    for (const task of phase.tasks) {
      const createdTask = await createTask({
        project_id: session.project_id,
        title: task.title,
        description: task.description,
        status: 'READY',
        assigned_to: task.agent,
        allowed_paths: task.files_to_modify || []
      });
      createdTasks.push(createdTask);
    }
  }
  
  // 3. Update session
  await updateSession(sessionId, {
    status: 'executing',
    tasks_created: createdTasks.length
  });
  
  // 4. If auto-execution enabled, start agents
  if (session.auto_execution_enabled) {
    await startAutoExecution(session.project_id, createdTasks);
  }
  
  return {
    sessionId,
    status: 'executing',
    tasksCreated: createdTasks.length,
    taskIds: createdTasks.map(t => t.id),
    autoExecutionStarted: session.auto_execution_enabled
  };
}

async function startAutoExecution(projectId, tasks) {
  // This would integrate with your AI agent system
  // For each task in dependency order:
  //   1. Get task context (generate-context-pack)
  //   2. Execute with appropriate agent (@backend, @frontend, etc.)
  //   3. Update status (update-task-status)
  //   4. Move to next task
  
  // Implementation would be a separate service/worker
  await queueAutoExecution(projectId, tasks);
}
```

---

## 🎨 Frontend Components

### 1. Enhanced ProjectCreationModal

```typescript
// vibecoding-dashboard/src/components/CreateProjectModal.js

interface ProjectFormData {
  name: string;
  description: string;
  project_type: string;
  tech_stack: {
    frontend: string;
    backend: string;
    database: string;
  };
  github_repos: string[];  // NEW
  goal: string;             // NEW
  auto_execution_enabled: boolean;  // NEW
}

function CreateProjectModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState<ProjectFormData>({
    // ... existing fields
    github_repos: [],
    goal: '',
    auto_execution_enabled: false
  });
  
  const [repoInput, setRepoInput] = useState('');
  
  const addRepo = () => {
    if (repoInput && isValidGitHubUrl(repoInput)) {
      setFormData({
        ...formData,
        github_repos: [...formData.github_repos, repoInput]
      });
      setRepoInput('');
    }
  };
  
  const handleSubmit = async () => {
    const response = await createProject(formData);
    
    if (formData.github_repos.length > 0) {
      // Navigate to orchestration flow
      navigate(`/project/${response.project.id}/orchestration`);
    } else {
      // Traditional flow
      onSuccess(response.project);
    }
  };
  
  return (
    <Modal>
      {/* ... existing fields ... */}
      
      {/* NEW: GitHub Repositories */}
      <div className="form-section">
        <label>GitHub Repositories (Optional)</label>
        <p className="text-sm text-gray-400">
          Add existing repos to analyze and enhance
        </p>
        
        <div className="repo-input">
          <input
            type="url"
            placeholder="https://github.com/user/repo"
            value={repoInput}
            onChange={(e) => setRepoInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && addRepo()}
          />
          <button onClick={addRepo}>Add</button>
        </div>
        
        {formData.github_repos.length > 0 && (
          <div className="repo-list">
            {formData.github_repos.map((repo, idx) => (
              <div key={idx} className="repo-item">
                {repo}
                <button onClick={() => removeRepo(idx)}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      {/* NEW: Goal/Objective */}
      {formData.github_repos.length > 0 && (
        <div className="form-section">
          <label>What do you want to build?</label>
          <textarea
            placeholder="e.g., Add real-time chat with file sharing"
            value={formData.goal}
            onChange={(e) => setFormData({...formData, goal: e.target.value})}
            rows={3}
          />
        </div>
      )}
      
      {/* NEW: Auto-execution toggle */}
      {formData.github_repos.length > 0 && (
        <div className="form-section">
          <label className="checkbox-label">
            <input
              type="checkbox"
              checked={formData.auto_execution_enabled}
              onChange={(e) => setFormData({
                ...formData,
                auto_execution_enabled: e.target.checked
              })}
            />
            Enable auto-execution (AI will implement tasks automatically)
          </label>
        </div>
      )}
      
      <div className="actions">
        <button onClick={onClose}>Cancel</button>
        <button onClick={handleSubmit} className="primary">
          {formData.github_repos.length > 0 
            ? 'Create & Analyze' 
            : 'Create Project'}
        </button>
      </div>
    </Modal>
  );
}
```

---

### 2. OrchestrationFlow Component

```typescript
// vibecoding-dashboard/src/components/OrchestrationFlow.js

function OrchestrationFlow({ projectId }) {
  const [session, setSession] = useState(null);
  const [phase, setPhase] = useState('analyzing'); // analyzing, questioning, planning, reviewing, executing
  
  useEffect(() => {
    // Poll for orchestration status
    const interval = setInterval(async () => {
      const status = await fetchOrchestrationStatus(projectId);
      setSession(status.session);
      setPhase(status.session.status);
    }, 2000);
    
    return () => clearInterval(interval);
  }, [projectId]);
  
  return (
    <div className="orchestration-flow">
      <ProgressIndicator phase={phase} />
      
      {phase === 'analyzing' && <AnalyzingView session={session} />}
      {phase === 'questioning' && <QuestionnaireView session={session} />}
      {phase === 'planning' && <PlanningView session={session} />}
      {phase === 'reviewing' && <PlanReviewView session={session} />}
      {phase === 'executing' && <ExecutionView session={session} />}
    </div>
  );
}
```

---

### 3. QuestionnaireComponent

```typescript
// vibecoding-dashboard/src/components/OrchestrationQuestionnaire.js

function OrchestrationQuestionnaire({ session, onSubmit }) {
  const [responses, setResponses] = useState({});
  const questions = JSON.parse(session.questions_generated || '[]');
  
  const handleResponse = (questionId, value) => {
    setResponses({
      ...responses,
      [questionId]: value
    });
  };
  
  const handleSubmit = async () => {
    await submitQuestionnaire(session.id, responses);
    onSubmit();
  };
  
  const allAnswered = questions.every(q => responses[q.id]);
  
  return (
    <div className="questionnaire">
      <div className="header">
        <h2>🤖 Let me understand your project better</h2>
        <p>
          I've analyzed {session.repos_analyzed?.length || 0} repositories.
          Answer these questions to help me create the optimal plan.
        </p>
      </div>
      
      <div className="questions">
        {questions.map((question, idx) => (
          <QuestionCard
            key={question.id}
            question={question}
            index={idx + 1}
            value={responses[question.id]}
            onChange={(value) => handleResponse(question.id, value)}
          />
        ))}
      </div>
      
      <div className="actions">
        <div className="progress">
          {Object.keys(responses).length} / {questions.length} answered
        </div>
        <button
          onClick={handleSubmit}
          disabled={!allAnswered}
          className="primary"
        >
          Generate Task Plan →
        </button>
      </div>
    </div>
  );
}

function QuestionCard({ question, index, value, onChange }) {
  return (
    <div className="question-card">
      <div className="question-header">
        <span className="question-number">Question {index}</span>
        <span className="question-category">{question.category}</span>
      </div>
      
      <h3>{question.question}</h3>
      
      {question.type === 'multiple-choice' && (
        <div className="options">
          {question.options.map((option) => (
            <label
              key={option.value}
              className={`option ${value === option.value ? 'selected' : ''}`}
            >
              <input
                type="radio"
                name={question.id}
                value={option.value}
                checked={value === option.value}
                onChange={(e) => onChange(e.target.value)}
              />
              <div className="option-content">
                <div className="option-label">{option.label}</div>
                {option.description && (
                  <div className="option-description">{option.description}</div>
                )}
              </div>
            </label>
          ))}
        </div>
      )}
      
      {question.type === 'text' && (
        <textarea
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Your answer..."
          rows={4}
        />
      )}
      
      {question.type === 'multiple-select' && (
        <div className="checkbox-group">
          {question.options.map((option) => (
            <label key={option.value} className="checkbox-label">
              <input
                type="checkbox"
                checked={(value || []).includes(option.value)}
                onChange={(e) => {
                  const newValue = e.target.checked
                    ? [...(value || []), option.value]
                    : (value || []).filter(v => v !== option.value);
                  onChange(newValue);
                }}
              />
              {option.label}
            </label>
          ))}
        </div>
      )}
      
      {question.recommendation && (
        <div className="recommendation">
          <span className="label">💡 Recommended:</span>
          <span className="value">
            {question.options.find(o => o.value === question.recommendation)?.label}
          </span>
          {question.reasoning && (
            <p className="reasoning">{question.reasoning}</p>
          )}
        </div>
      )}
    </div>
  );
}
```

---

### 4. PlanReviewComponent

```typescript
// vibecoding-dashboard/src/components/PlanReview.js

function PlanReview({ session, onApprove, onModify }) {
  const plan = JSON.parse(session.orchestration_plan || '{}');
  const [selectedPhase, setSelectedPhase] = useState(0);
  
  return (
    <div className="plan-review">
      <div className="plan-header">
        <h2>📋 Generated Task Plan</h2>
        <div className="plan-summary">
          <div className="stat">
            <span className="label">Total Tasks</span>
            <span className="value">{plan.summary?.total_tasks}</span>
          </div>
          <div className="stat">
            <span className="label">Timeline</span>
            <span className="value">{plan.summary?.estimated_timeline}</span>
          </div>
          <div className="stat">
            <span className="label">Estimated Hours</span>
            <span className="value">{plan.summary?.estimated_hours}h</span>
          </div>
        </div>
      </div>
      
      <div className="agent-breakdown">
        {Object.entries(plan.summary?.by_agent || {}).map(([agent, count]) => (
          <div key={agent} className="agent-stat">
            <span className={`agent-badge ${agent.replace('@', '')}`}>
              {agent}
            </span>
            <span className="count">{count} tasks</span>
          </div>
        ))}
      </div>
      
      <div className="phases">
        <div className="phase-tabs">
          {plan.phases?.map((phase, idx) => (
            <button
              key={idx}
              className={`phase-tab ${selectedPhase === idx ? 'active' : ''}`}
              onClick={() => setSelectedPhase(idx)}
            >
              <div className="phase-name">{phase.name}</div>
              <div className="phase-meta">Week {phase.week} • {phase.tasks.length} tasks</div>
            </button>
          ))}
        </div>
        
        <div className="phase-content">
          {plan.phases?.[selectedPhase] && (
            <PhaseDetails phase={plan.phases[selectedPhase]} />
          )}
        </div>
      </div>
      
      <div className="actions">
        <button onClick={onModify} className="secondary">
          Modify Plan
        </button>
        <button onClick={() => onApprove(plan)} className="primary">
          Approve & Create Tasks
        </button>
      </div>
    </div>
  );
}

function PhaseDetails({ phase }) {
  return (
    <div className="phase-details">
      <h3>{phase.name}</h3>
      <p className="phase-description">Week {phase.week}</p>
      
      <div className="task-list">
        {phase.tasks.map((task, idx) => (
          <div key={idx} className="task-preview">
            <div className="task-header">
              <h4>{task.title}</h4>
              <span className={`agent-badge ${task.agent.replace('@', '')}`}>
                {task.agent}
              </span>
            </div>
            <p className="task-description">{task.description}</p>
            <div className="task-meta">
              <span>⏱️ {task.estimated_hours}h</span>
              {task.dependencies?.length > 0 && (
                <span>🔗 {task.dependencies.length} dependencies</span>
              )}
              {task.files_to_modify?.length > 0 && (
                <span>📝 {task.files_to_modify.length} files</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

---

## 🔄 Implementation Phases

### Phase 1: Foundation (Week 1)
**Goal:** Basic infrastructure for orchestration

**Tasks:**
1. Database migration (add new tables and columns)
2. Update project creation API to accept github_repos
3. Add basic GitHub API integration (fetch repo info)
4. Simple repository analyzer (detect languages, frameworks)
5. Update frontend form to accept GitHub URLs

**Deliverable:** Can create projects with GitHub repos, basic analysis

**Risk:** Low  
**Effort:** 20-25 hours

---

### Phase 2: Orchestration Core (Week 2-3)
**Goal:** Implement orchestration session management

**Tasks:**
1. Create orchestration_sessions table and API
2. Implement `orchestrate-project` MCP tool
3. Build repository analyzer (deep analysis)
4. Create questionnaire generation AI integration
5. Build QuestionnaireComponent in dashboard
6. Implement `submit-questionnaire` MCP tool

**Deliverable:** Full questionnaire flow working

**Risk:** Medium (AI integration complexity)  
**Effort:** 40-50 hours

---

### Phase 3: Task Planning (Week 4)
**Goal:** AI-generated task breakdown

**Tasks:**
1. Implement task plan generation AI
2. Create plan visualization component
3. Build plan modification UI
4. Implement `execute-orchestration-plan` MCP tool
5. Task creation from approved plans

**Deliverable:** Complete planning and approval flow

**Risk:** Medium (AI prompt engineering)  
**Effort:** 35-40 hours

---

### Phase 4: Auto-Execution (Week 5-6)
**Goal:** AI agents automatically implement tasks

**Tasks:**
1. Build agent coordination system
2. Implement task execution queue
3. Add progress tracking
4. Create monitoring dashboard
5. Error handling and rollback

**Deliverable:** Full auto-execution capability

**Risk:** High (complex agent orchestration)  
**Effort:** 50-60 hours

---

### Phase 5: Polish & Testing (Week 7)
**Goal:** Production ready

**Tasks:**
1. Comprehensive testing
2. Error handling improvements
3. Performance optimization
4. Documentation
5. User feedback integration

**Deliverable:** Production-ready system

**Risk:** Low  
**Effort:** 25-30 hours

---

## 🧪 Testing Strategy

### Unit Tests
- Repository analyzer functions
- Questionnaire generator
- Task plan generator
- Each MCP tool independently

### Integration Tests
- Full orchestration flow
- GitHub API integration
- Database operations
- MCP tool chain

### End-to-End Tests
```javascript
describe('Orchestration Workflow', () => {
  it('should complete full flow from repo to tasks', async () => {
    // 1. Create project with GitHub repos
    const project = await createProject({
      name: 'Test Project',
      github_repos: ['https://github.com/test/repo'],
      goal: 'Add authentication'
    });
    
    // 2. Wait for analysis
    await waitForStatus(project.id, 'questioning');
    
    // 3. Get questions
    const orchestration = await getOrchestration(project.id);
    expect(orchestration.questions).toHaveLength(5);
    
    // 4. Submit responses
    await submitQuestionnaire(orchestration.session.id, mockResponses);
    
    // 5. Wait for plan
    await waitForStatus(project.id, 'planning_complete');
    
    // 6. Get and verify plan
    const plan = await getPlan(orchestration.session.id);
    expect(plan.summary.total_tasks).toBeGreaterThan(0);
    
    // 7. Approve plan
    await approvePlan(orchestration.session.id);
    
    // 8. Verify tasks created
    const tasks = await getTasks(project.id);
    expect(tasks.length).toBe(plan.summary.total_tasks);
  });
});
```

### Performance Tests
- Repository analysis time (target: < 2 minutes)
- Question generation time (target: < 30 seconds)
- Task plan generation time (target: < 1 minute)
- Database query performance

---

## 🚨 Risk Assessment

### High Risks

1. **AI Unpredictability**
   - **Risk:** AI-generated plans may be inconsistent or incorrect
   - **Mitigation:** 
     - Extensive prompt engineering
     - Human review step (approval)
     - Fallback to simpler analysis

2. **GitHub Rate Limiting**
   - **Risk:** Hitting GitHub API rate limits
   - **Mitigation:**
     - Implement caching
     - Use authenticated requests (5000/hour vs 60/hour)
     - Queue and batch requests

3. **Complex Codebase Analysis**
   - **Risk:** Large repos may take too long to analyze
   - **Mitigation:**
     - Implement "quick" vs "full" analysis modes
     - Async processing with progress updates
     - Timeout limits

### Medium Risks

4. **User Question Fatigue**
   - **Risk:** Too many questions frustrate users
   - **Mitigation:**
     - Adaptive questioning (stop when confident)
     - Provide "recommended" answers
     - Allow skipping with defaults

5. **Task Plan Quality**
   - **Risk:** Generated tasks may not be actionable
   - **Mitigation:**
     - Allow plan modification before approval
     - Learn from feedback
     - Iterative improvement

### Low Risks

6. **Database Schema Changes**
   - **Risk:** Migration issues
   - **Mitigation:**
     - Thorough testing in dev environment
     - Rollback plan
     - Backward compatibility

---

## 📊 Success Metrics

### Quantitative
- **Repository Analysis Time:** < 2 minutes for typical repos
- **Question Accuracy:** > 80% of questions relevant to goal
- **Plan Acceptance Rate:** > 70% of plans approved without modification
- **Task Completion Rate:** > 60% of tasks completed as planned
- **User Time Saved:** > 5x reduction in manual planning time

### Qualitative
- User satisfaction with questionnaire
- Quality of generated task descriptions
- Accuracy of agent assignments
- Relevance of dependencies identified

---

## 💰 Cost Analysis

### Development Costs
- Phase 1: 25 hours × $100/hour = $2,500
- Phase 2: 45 hours × $100/hour = $4,500
- Phase 3: 37 hours × $100/hour = $3,700
- Phase 4: 55 hours × $100/hour = $5,500
- Phase 5: 28 hours × $100/hour = $2,800
- **Total Development:** ~$19,000

### Operational Costs (Monthly)
- AI API calls (Claude/GPT): $50-200/month
- GitHub API: Free (with auth)
- Server resources: Minimal (current infrastructure)
- **Total Operational:** ~$50-200/month

### ROI Calculation
- **Time Saved per Project:** 8-10 hours of manual planning
- **Projects per Month:** Assuming 10 projects
- **Hours Saved:** 80-100 hours/month
- **Value at $100/hour:** $8,000-10,000/month
- **Payback Period:** ~2 months

---

## 🎯 Decision Points

### Go/No-Go Criteria

**Proceed to Phase 2 if:**
- ✅ Phase 1 completed successfully
- ✅ Repository analysis working for 5+ test repos
- ✅ Basic UI functioning
- ✅ User feedback positive

**Proceed to Phase 4 (Auto-execution) if:**
- ✅ Phases 1-3 stable
- ✅ Task plans consistently high quality
- ✅ User trust in AI-generated plans
- ⚠️ **This is optional** - can ship without auto-execution

### Alternative Approach

If AI integration proves too complex, fallback to:
- **Manual Mode:** Use AI for analysis only, human creates tasks
- **Template Mode:** Pre-built templates for common scenarios
- **Hybrid Mode:** AI suggests, human approves every task

---

## 📋 Checklist for Implementation

### Before Starting
- [ ] Review and approve this plan
- [ ] Set up AI API access (Claude/GPT)
- [ ] Create GitHub personal access token
- [ ] Prepare test repositories
- [ ] Set up development environment

### Phase 1
- [ ] Database migration script written
- [ ] Migration tested on dev database
- [ ] API endpoints updated
- [ ] Frontend form updated
- [ ] GitHub integration working
- [ ] Basic analyzer implemented
- [ ] Unit tests written
- [ ] Integration tests passing
- [ ] Deployed to staging

### Phase 2
- [ ] Orchestration API completed
- [ ] MCP tools implemented
- [ ] AI question generation working
- [ ] Questionnaire UI built
- [ ] Full flow tested
- [ ] User acceptance testing

### Phase 3
- [ ] Task plan generator working
- [ ] Plan visualization complete
- [ ] Modification UI functional
- [ ] Task creation working
- [ ] End-to-end testing complete

### Phase 4 (Optional)
- [ ] Agent system designed
- [ ] Execution queue implemented
- [ ] Progress tracking working
- [ ] Error handling robust
- [ ] Safety measures in place

### Phase 5
- [ ] All tests passing
- [ ] Documentation complete
- [ ] Performance acceptable
- [ ] User training materials ready
- [ ] Production deployment plan ready

---

## 🎓 Training Plan

### For Users
1. **Video Tutorial** (10 min): Creating project with GitHub repos
2. **Written Guide**: Answering questionnaire effectively
3. **Best Practices**: Writing good project goals
4. **FAQ**: Common issues and solutions

### For Developers
1. **Architecture Overview**: System design and data flow
2. **API Documentation**: All new endpoints
3. **MCP Tool Guide**: How to use and extend tools
4. **Troubleshooting**: Common issues and debugging

---

## 🚀 Launch Strategy

### Soft Launch (Week 8)
- Enable for internal testing only
- Invite 5-10 beta users
- Collect feedback
- Fix critical issues

### Beta Launch (Week 9-10)
- Open to wider user base (opt-in)
- Monitor usage and errors
- Iterate based on feedback
- Improve AI prompts

### Full Launch (Week 11)
- Make default for new projects
- Migration guide for existing projects
- Announcement and marketing
- Support resources ready

---

## 📝 Open Questions

1. **Which AI provider?** Claude Opus vs GPT-4 vs open-source?
2. **Caching strategy?** Redis vs in-memory vs database?
3. **Auto-execution scope?** Full automation or human-in-loop?
4. **GitHub permissions?** Public repos only or private with OAuth?
5. **Pricing model?** Free tier limits? Premium features?

---

## ✅ Approval Required

This plan requires approval for:

1. **Architecture decisions** (new tables, MCP tools)
2. **AI integration** (costs, provider choice)
3. **Timeline** (7 weeks realistic?)
4. **Scope** (include auto-execution or not?)
5. **Resources** (developer time allocation)

---

**Plan Version:** 1.0  
**Created:** 2024-01-15  
**Author:** AI Implementation Architect  
**Status:** Awaiting Review

---

**Next Steps After Approval:**
1. Review by senior LLM or technical lead
2. Refine based on feedback
3. Break down into detailed tickets
4. Assign developers
5. Begin Phase 1 implementation

