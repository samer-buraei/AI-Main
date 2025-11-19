# ⚡ Quick Start Examples

## 5-Minute Getting Started Guide

### Step 1: Start the System
```bash
# Double-click this file:
start-vibecoding.bat

# Wait for all 3 services to start
# ✓ Backend API: http://localhost:4000
# ✓ Frontend: http://localhost:3000
# ✓ MCP Server: http://localhost:4001
```

### Step 2: Create Your First Project (PowerShell)

```powershell
# Create a new project via API
$project = @{
    name = "My Awesome App"
    description = "A revolutionary new application"
    project_type = "other"
    tech_stack = @{
        frontend = "React"
        backend = "Express"
        database = "PostgreSQL"
    }
} | ConvertTo-Json

$response = Invoke-RestMethod `
    -Uri "http://localhost:4000/api/projects" `
    -Method POST `
    -Body $project `
    -ContentType "application/json"

# Save the project ID for later
$projectId = $response.id
Write-Host "Created project: $projectId" -ForegroundColor Green
```

### Step 3: Add Some Tasks

```powershell
# Task 1: Setup authentication
$task1 = @{
    project_id = $projectId
    title = "Implement user authentication"
    description = "JWT-based auth with login, register, and password reset"
    status = "READY"
    assigned_to = "@backend"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:4000/api/tasks" `
    -Method POST `
    -Body $task1 `
    -ContentType "application/json"

# Task 2: Build login UI
$task2 = @{
    project_id = $projectId
    title = "Create login page"
    description = "Beautiful responsive login form with validation"
    status = "READY"
    assigned_to = "@frontend"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:4000/api/tasks" `
    -Method POST `
    -Body $task2 `
    -ContentType "application/json"

# Task 3: Add database models
$task3 = @{
    project_id = $projectId
    title = "Design user database schema"
    description = "Create tables for users, sessions, and profiles"
    status = "IN_PROGRESS"
    assigned_to = "@backend"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:4000/api/tasks" `
    -Method POST `
    -Body $task3 `
    -ContentType "application/json"

Write-Host "✓ Created 3 tasks!" -ForegroundColor Green
```

### Step 4: View in Dashboard

1. Open browser to http://localhost:3000
2. Select "My Awesome App" from the sidebar
3. See your tasks in the Kanban board:
   - **Ready**: 2 tasks
   - **In Progress**: 1 task

---

## Common API Operations

### Get All Projects
```powershell
$projects = Invoke-RestMethod -Uri "http://localhost:4000/api/projects"
$projects | Format-Table name, project_type, id
```

### Get Tasks for a Project
```powershell
$projectId = "YOUR-PROJECT-ID"
$tasks = Invoke-RestMethod -Uri "http://localhost:4000/api/tasks/byProject/$projectId"
$tasks | Format-Table title, status, assigned_to
```

### Update Task Status
```powershell
$taskId = "T-abc123"
$update = @{
    status = "DONE"
} | ConvertTo-Json

Invoke-RestMethod `
    -Uri "http://localhost:4000/api/tasks/$taskId" `
    -Method PUT `
    -Body $update `
    -ContentType "application/json"
```

### Delete a Task
```powershell
$taskId = "T-abc123"
Invoke-RestMethod `
    -Uri "http://localhost:4000/api/tasks/$taskId" `
    -Method DELETE
```

---

## Using cURL (Bash/Linux/Mac)

### Create Project
```bash
curl -X POST http://localhost:4000/api/projects \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Project",
    "description": "Description here",
    "project_type": "other",
    "tech_stack": {
      "frontend": "React",
      "backend": "Node.js",
      "database": "MongoDB"
    }
  }'
```

### Create Task
```bash
PROJECT_ID="your-project-id-here"

curl -X POST http://localhost:4000/api/tasks \
  -H "Content-Type: application/json" \
  -d "{
    \"project_id\": \"$PROJECT_ID\",
    \"title\": \"Build API endpoints\",
    \"description\": \"Create REST API for users\",
    \"status\": \"READY\",
    \"assigned_to\": \"@backend\"
  }"
```

### Update Task
```bash
TASK_ID="T-abc123"

curl -X PUT http://localhost:4000/api/tasks/$TASK_ID \
  -H "Content-Type: application/json" \
  -d '{
    "status": "IN_PROGRESS"
  }'
```

### Get All Tasks
```bash
PROJECT_ID="your-project-id-here"
curl http://localhost:4000/api/tasks/byProject/$PROJECT_ID
```

---

## Complete Example: E-Commerce Project

### Create the Project
```powershell
$ecommerce = @{
    name = "E-Commerce Store"
    description = "Full-featured online store with cart and checkout"
    project_type = "other"
    tech_stack = @{
        frontend = "React + Redux"
        backend = "Express + Stripe"
        database = "PostgreSQL"
    }
} | ConvertTo-Json

$project = Invoke-RestMethod `
    -Uri "http://localhost:4000/api/projects" `
    -Method POST `
    -Body $ecommerce `
    -ContentType "application/json"

$projectId = $project.id
```

### Add Complete Feature Set
```powershell
# Define all tasks
$tasks = @(
    @{
        title = "Design database schema"
        description = "Products, orders, cart, users, payments"
        status = "READY"
        assigned_to = "@backend"
    },
    @{
        title = "Setup authentication"
        description = "JWT auth with email/password"
        status = "READY"
        assigned_to = "@backend"
    },
    @{
        title = "Build product catalog API"
        description = "CRUD endpoints for products"
        status = "READY"
        assigned_to = "@backend"
    },
    @{
        title = "Create product listing page"
        description = "Grid view with filters and search"
        status = "READY"
        assigned_to = "@frontend"
    },
    @{
        title = "Implement shopping cart"
        description = "Add/remove items, update quantities"
        status = "READY"
        assigned_to = "@frontend"
    },
    @{
        title = "Build checkout flow"
        description = "Multi-step checkout with Stripe"
        status = "READY"
        assigned_to = "@frontend"
    },
    @{
        title = "Add admin dashboard"
        description = "Manage products, orders, customers"
        status = "READY"
        assigned_to = "@frontend"
    },
    @{
        title = "Integrate payment processing"
        description = "Stripe integration for payments"
        status = "READY"
        assigned_to = "@backend"
    }
)

# Create all tasks
foreach ($task in $tasks) {
    $taskBody = @{
        project_id = $projectId
        title = $task.title
        description = $task.description
        status = $task.status
        assigned_to = $task.assigned_to
    } | ConvertTo-Json
    
    Invoke-RestMethod `
        -Uri "http://localhost:4000/api/tasks" `
        -Method POST `
        -Body $taskBody `
        -ContentType "application/json" | Out-Null
    
    Write-Host "✓ $($task.title)" -ForegroundColor Green
}

Write-Host "`n🎉 Created E-Commerce project with 8 tasks!" -ForegroundColor Cyan
Write-Host "View it at: http://localhost:3000" -ForegroundColor Yellow
```

---

## MCP Tool Examples (Use in Cursor)

### Example 1: Analyze a Feature Request
```javascript
// In Cursor, use the MCP tool:
{
  "tool": "analyze-request",
  "input": {
    "projectId": "your-project-id",
    "request": "Add dark mode to the entire application with a toggle button in the settings menu that persists the user's preference"
  }
}

// Returns: 
// - Task 1: Create dark mode color scheme (@frontend)
// - Task 2: Build theme toggle component (@frontend)
// - Task 3: Add theme persistence to localStorage (@frontend)
// - Task 4: Update all components for theme support (@frontend)
```

### Example 2: Get Context for a Task
```javascript
{
  "tool": "generate-context-pack",
  "input": {
    "projectId": "your-project-id",
    "taskId": "T-abc123",
    "agentType": "@frontend"
  }
}

// Returns:
// - Project overview
// - Task details
// - Relevant documentation
// - Tech stack info
// - Related tasks
```

### Example 3: Update Task Status
```javascript
{
  "tool": "update-task-status",
  "input": {
    "taskId": "T-abc123",
    "newStatus": "DONE"
  }
}

// Returns:
// - Updated task object
// - New status confirmation
```

---

## Health Checks

### Check All Services
```powershell
Write-Host "`nChecking services..." -ForegroundColor Cyan

# Backend
try {
    $backend = Invoke-RestMethod -Uri "http://localhost:4000/health" -TimeoutSec 2
    Write-Host "✓ Backend: OK" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend: Not responding" -ForegroundColor Red
}

# Frontend
try {
    $frontend = Invoke-WebRequest -Uri "http://localhost:3000" -UseBasicParsing -TimeoutSec 2
    Write-Host "✓ Frontend: OK (Status $($frontend.StatusCode))" -ForegroundColor Green
} catch {
    Write-Host "✗ Frontend: Not responding" -ForegroundColor Red
}

# MCP Server
try {
    $mcp = Invoke-RestMethod -Uri "http://localhost:4001/health" -TimeoutSec 2
    Write-Host "✓ MCP Server: OK" -ForegroundColor Green
    Write-Host "  Available tools: $($mcp.tools -join ', ')" -ForegroundColor Gray
} catch {
    Write-Host "✗ MCP Server: Not responding" -ForegroundColor Red
}
```

---

## Useful PowerShell Helper Functions

```powershell
# Add these to your PowerShell profile or script

# Create a new project quickly
function New-VibeProject {
    param(
        [string]$Name,
        [string]$Description,
        [string]$Frontend = "React",
        [string]$Backend = "Express",
        [string]$Database = "SQLite"
    )
    
    $body = @{
        name = $Name
        description = $Description
        project_type = "other"
        tech_stack = @{
            frontend = $Frontend
            backend = $Backend
            database = $Database
        }
    } | ConvertTo-Json
    
    $project = Invoke-RestMethod `
        -Uri "http://localhost:4000/api/projects" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"
    
    Write-Host "Created project: $($project.name) ($($project.id))" -ForegroundColor Green
    return $project
}

# Add a task quickly
function New-VibeTask {
    param(
        [string]$ProjectId,
        [string]$Title,
        [string]$Description,
        [string]$Status = "READY",
        [string]$Agent = "@backend"
    )
    
    $body = @{
        project_id = $ProjectId
        title = $Title
        description = $Description
        status = $Status
        assigned_to = $Agent
    } | ConvertTo-Json
    
    $task = Invoke-RestMethod `
        -Uri "http://localhost:4000/api/tasks" `
        -Method POST `
        -Body $body `
        -ContentType "application/json"
    
    Write-Host "Created task: $($task.title) ($($task.id))" -ForegroundColor Green
    return $task
}

# Get project tasks
function Get-VibeTasks {
    param([string]$ProjectId)
    
    $tasks = Invoke-RestMethod -Uri "http://localhost:4000/api/tasks/byProject/$ProjectId"
    $tasks | Format-Table id, title, status, assigned_to
}

# Usage example:
# $project = New-VibeProject -Name "My App" -Description "Cool app"
# New-VibeTask -ProjectId $project.id -Title "Build API" -Agent "@backend"
# Get-VibeTasks -ProjectId $project.id
```

---

## Next Steps

1. **Read the full guide**: `HOW-TO-USE-GUIDE.md`
2. **Check the troubleshooting guide**: `TROUBLESHOOTING.md`
3. **Explore the dashboard**: http://localhost:3000
4. **Test the API**: Use Postman or Thunder Client
5. **Connect Cursor**: Set up MCP integration

---

**Pro Tip:** Keep this file open as a reference while working with the system!

