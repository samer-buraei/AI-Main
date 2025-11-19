# 📖 How to Use Vibecoding Project Manager

## Table of Contents
1. [Starting the System](#starting-the-system)
2. [Using the Dashboard](#using-the-dashboard)
3. [Managing Projects](#managing-projects)
4. [Managing Tasks](#managing-tasks)
5. [Using the API Directly](#using-the-api-directly)
6. [Connecting Cursor IDE (MCP Integration)](#connecting-cursor-ide-mcp-integration)
7. [Advanced Workflows](#advanced-workflows)

---

## 🚀 Starting the System

### Option 1: Using the Batch File (Easiest)
Double-click `start-vibecoding.bat` in the project root. This will:
- Check system requirements
- Install dependencies if needed
- Start all three services in separate windows

### Option 2: Manual Start
Open 3 separate terminals and run:

**Terminal 1 - Backend API:**
```bash
cd vibecoding-backend
npm install  # First time only
npm run dev
```

**Terminal 2 - Frontend Dashboard:**
```bash
cd vibecoding-dashboard
npm install  # First time only
npm start
```

**Terminal 3 - MCP Server:**
```bash
cd vibecoding-mcp-server
npm install  # First time only
npm run dev
```

### Access Points
- 📊 **Dashboard**: http://localhost:3000
- 🔌 **Backend API**: http://localhost:4000
- 🤖 **MCP Server**: http://localhost:4001

---

## 🖥️ Using the Dashboard

### 1. Creating a Project

1. Click the **"+ New Project"** button in the sidebar
2. Fill in the project details:
   - **Project Name** (required): e.g., "E-Commerce Store"
   - **Description**: Brief overview of the project
   - **Project Type**: Select from preset types or choose "Other"
   - **Tech Stack**: Frontend, Backend, and Database technologies
3. Click **"Create Project"**

### 2. Viewing the Kanban Board

After creating a project, you'll see a 4-column Kanban board:
- **Ready**: Tasks waiting to be started
- **In Progress**: Tasks currently being worked on
- **Done**: Completed tasks
- **Blocked**: Tasks that are blocked by dependencies

### 3. Task Cards

Each task card shows:
- **Title** and **Description**
- **Assigned Agent** (color-coded):
  - 🔵 @frontend (blue)
  - 🟢 @backend (green)
  - 🟡 @qa (yellow)
  - 🟣 @devops (purple)
- **Task ID**: Unique identifier (e.g., T-b769fbdd)
- **Status**: Current workflow state

### 4. Drag-and-Drop Tasks

Simply **click and drag** a task card from one column to another to update its status. The system will automatically:
- Update the database
- Sync with all connected clients
- Maintain task history

---

## 📋 Managing Projects

### Creating Projects (Dashboard)
Use the **"+ New Project"** button as described above.

### Switching Between Projects
Click on any project in the sidebar to switch to that project's Kanban board.

### Project Information
Each project card in the sidebar shows:
- Project name
- Project type
- Description

---

## ✅ Managing Tasks

### Creating Tasks via API (Recommended)

Tasks are typically created programmatically or via the MCP server. Here's how:

**Using PowerShell:**
```powershell
$projectId = "YOUR-PROJECT-ID-HERE"
$body = @{
    project_id = $projectId
    title = "Implement user authentication"
    description = "Add JWT-based auth with login and register"
    status = "READY"
    assigned_to = "@backend"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/api/tasks" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

**Using cURL:**
```bash
curl -X POST http://localhost:4000/api/tasks \
  -H "Content-Type: application/json" \
  -d '{
    "project_id": "YOUR-PROJECT-ID-HERE",
    "title": "Build product catalog",
    "description": "Create product listing with filters",
    "status": "READY",
    "assigned_to": "@frontend"
  }'
```

### Task Status Values
- `READY` - Task is ready to be worked on
- `IN_PROGRESS` - Task is currently being worked on
- `DONE` - Task is completed
- `BLOCKED` - Task is blocked by dependencies

### Updating Task Status

**Dashboard Method:**
Drag and drop the task card to a different column.

**API Method:**
```powershell
$taskId = "T-b769fbdd"
$updates = @{
    status = "IN_PROGRESS"
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:4000/api/tasks/$taskId" `
    -Method PUT `
    -Body $updates `
    -ContentType "application/json"
```

---

## 🔌 Using the API Directly

### API Endpoints

#### **Projects**

**Get all projects:**
```http
GET http://localhost:4000/api/projects
```

**Get single project:**
```http
GET http://localhost:4000/api/projects/{id}
```

**Create project:**
```http
POST http://localhost:4000/api/projects
Content-Type: application/json

{
  "name": "My Project",
  "description": "Project description",
  "project_type": "other",
  "tech_stack": {
    "frontend": "React",
    "backend": "Node.js",
    "database": "PostgreSQL"
  }
}
```

**Update project:**
```http
PUT http://localhost:4000/api/projects/{id}
Content-Type: application/json

{
  "name": "Updated Project Name",
  "description": "New description"
}
```

**Delete project:**
```http
DELETE http://localhost:4000/api/projects/{id}
```

#### **Tasks**

**Get tasks for a project:**
```http
GET http://localhost:4000/api/tasks/byProject/{projectId}
```

**Create task:**
```http
POST http://localhost:4000/api/tasks
Content-Type: application/json

{
  "project_id": "project-uuid",
  "title": "Task title",
  "description": "Task description",
  "status": "READY",
  "assigned_to": "@frontend"
}
```

**Update task:**
```http
PUT http://localhost:4000/api/tasks/{taskId}
Content-Type: application/json

{
  "status": "IN_PROGRESS",
  "description": "Updated description"
}
```

**Delete task:**
```http
DELETE http://localhost:4000/api/tasks/{taskId}
```

#### **Health Check**
```http
GET http://localhost:4000/health
```

---

## 🤖 Connecting Cursor IDE (MCP Integration)

### What is MCP?

The **Model Context Protocol (MCP)** allows Cursor IDE to use specialized tools for project management. The Vibecoding MCP Server provides 4 powerful tools.

### Setup in Cursor IDE

1. **Open Cursor Settings**
   - Press `Ctrl+,` (Windows/Linux) or `Cmd+,` (Mac)
   - Or go to File > Preferences > Settings

2. **Navigate to MCP Settings**
   - Search for "MCP" or navigate to Tools & MCP

3. **Add MCP Server**
   - Click "Add MCP Server"
   - Enter URL: `http://localhost:4001`
   - Click Save

4. **Verify Connection**
   - The MCP server should show as "Connected"
   - You should see 4 available tools

### Available MCP Tools

#### 1. **analyze-request**
Analyzes a natural language request and creates tasks.

**Usage in Cursor:**
```
@mcp analyze-request
{
  "projectId": "your-project-id",
  "request": "Add dark mode to the application with toggle in settings"
}
```

**What it does:**
- Breaks down the request into discrete tasks
- Determines which agent should handle each task
- Creates tasks in the backend automatically
- Returns the created tasks

#### 2. **generate-context-pack**
Fetches all project knowledge and creates a focused context for an agent.

**Usage:**
```
@mcp generate-context-pack
{
  "projectId": "your-project-id",
  "taskId": "T-b769fbdd",
  "agentType": "@frontend"
}
```

**What it does:**
- Retrieves project documentation
- Gets the specific task details
- Tailors the context for the agent type
- Returns a ready-to-use context pack

#### 3. **spawn-sub-orchestrator**
Creates a project-specific system prompt for a new AI instance.

**Usage:**
```
@mcp spawn-sub-orchestrator
{
  "projectId": "your-project-id"
}
```

**What it does:**
- Fetches all project knowledge files
- Generates a comprehensive system prompt
- Prepares context for a sub-orchestrator AI
- Returns the prompt for a new Cursor tab/instance

#### 4. **update-task-status**
Updates a task's workflow status.

**Usage:**
```
@mcp update-task-status
{
  "taskId": "T-b769fbdd",
  "newStatus": "DONE"
}
```

**What it does:**
- Updates the task status in the database
- Triggers UI refresh in the dashboard
- Maintains task history

### Example AI Workflow with MCP

1. **Orchestrator AI analyzes user request:**
   ```
   Use analyze-request to create tasks for "Add user profile page"
   ```

2. **Frontend agent gets context:**
   ```
   Use generate-context-pack for task T-abc123 with agentType "@frontend"
   ```

3. **Agent completes work:**
   ```
   Use update-task-status to mark T-abc123 as "DONE"
   ```

4. **Spawn specialized orchestrator:**
   ```
   Use spawn-sub-orchestrator to create a focused AI for this project
   ```

---

## 🎯 Advanced Workflows

### Workflow 1: Full Feature Implementation

1. **Create Project** (via Dashboard)
   - Name: "Social Media App"
   - Type: "Other"
   - Tech Stack: React, Express, PostgreSQL

2. **Define Feature** (via MCP in Cursor)
   ```
   Use analyze-request:
   "Add user authentication with email/password, social login (Google, Facebook), 
   and password reset functionality"
   ```

3. **Monitor Progress** (via Dashboard)
   - Watch tasks move through Kanban columns
   - See which agents are assigned

4. **Agent Work** (via MCP in Cursor)
   ```
   For each task:
   - Get context: generate-context-pack
   - Do the work
   - Update status: update-task-status
   ```

### Workflow 2: Managing Multiple Projects

1. **Dashboard**: Switch between projects using sidebar
2. **Each project has**:
   - Independent task board
   - Separate agent assignments
   - Isolated workflow state

### Workflow 3: Team Collaboration

1. **Backend team** works on `@backend` tasks
2. **Frontend team** works on `@frontend` tasks
3. **Dashboard** shows real-time progress
4. **MCP tools** coordinate handoffs between agents

---

## 💡 Best Practices

### Project Organization
- Create one project per application or feature set
- Use descriptive project names and descriptions
- Keep tech stack information up-to-date

### Task Management
- Break large features into small, discrete tasks
- Assign tasks to the appropriate agent type
- Use BLOCKED status when dependencies aren't met
- Move tasks to DONE only when fully complete

### Agent Types
- `@frontend` - UI/UX, client-side logic
- `@backend` - APIs, databases, server logic
- `@qa` - Testing, quality assurance
- `@devops` - Deployment, infrastructure
- `@orchestrator` - Planning, coordination

### MCP Integration
- Use `analyze-request` for initial feature breakdown
- Use `generate-context-pack` before starting work
- Update task status regularly
- Spawn sub-orchestrators for complex projects

---

## 🔧 Troubleshooting

### Dashboard Not Loading
1. Check that all services are running (ports 3000, 4000, 4001)
2. Refresh the browser (F5)
3. Check browser console for errors (F12)

### Tasks Not Showing
1. Ensure you've selected a project
2. Refresh the page
3. Verify tasks exist via API: 
   ```
   GET http://localhost:4000/api/tasks/byProject/{projectId}
   ```

### MCP Not Connecting
1. Verify MCP server is running on port 4001
2. Check health endpoint: `http://localhost:4001/health`
3. Restart Cursor IDE
4. Re-add the MCP server in settings

### Drag-and-Drop Not Working
- Ensure you're clicking on the task card (not the button)
- Try using the API to update task status instead
- Check that no other draggable elements are interfering

---

## 📚 Additional Resources

- **Backend API Documentation**: `vibecoding-backend/README.md`
- **Frontend Documentation**: `vibecoding-dashboard/README.md`
- **MCP Server Documentation**: `vibecoding-mcp-server/README.md`
- **Troubleshooting Guide**: `TROUBLESHOOTING.md`

---

## 🎉 Quick Reference

| Action | Method | Endpoint/Location |
|--------|--------|-------------------|
| Create Project | Dashboard | Click "+ New Project" |
| View Projects | Dashboard | Sidebar |
| Create Task | API | `POST /api/tasks` |
| Update Task | Dashboard/API | Drag-drop or `PUT /api/tasks/{id}` |
| Get Project Tasks | API | `GET /api/tasks/byProject/{projectId}` |
| MCP: Analyze Request | Cursor | `analyze-request` tool |
| MCP: Get Context | Cursor | `generate-context-pack` tool |
| MCP: Update Status | Cursor | `update-task-status` tool |

---

**Need Help?** Check the logs in each service window for detailed error messages.

**Stopping Services:** Close the PowerShell/CMD windows or run `stop-vibecoding.bat`

---

*Built with ❤️ for AI-powered development*

