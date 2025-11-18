# Vibecoding Backend API

The central API server for the Vibecoding Project Manager system. This is Layer 1 of the system architecture.

## Features

- RESTful API for managing projects, tasks, knowledge files, and workflow states
- SQLite database for local-first, portable data storage
- Modular architecture with separated concerns
- Global error handling and request validation
- Structured logging

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file (or use the provided one):
```
PORT=4000
NODE_ENV=development
```

3. Start the server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:4000` and automatically create the SQLite database file (`vibecoding.db`) on first run.

## API Endpoints

### Projects
- `POST /api/projects` - Create a new project
- `GET /api/projects` - Get all projects
- `GET /api/projects/:id` - Get a single project
- `PUT /api/projects/:id` - Update a project
- `DELETE /api/projects/:id` - Delete a project

### Tasks
- `POST /api/tasks` - Create a new task
- `GET /api/tasks/byProject/:projectId` - Get all tasks for a project
- `PUT /api/tasks/:id` - Update a task
- `DELETE /api/tasks/:id` - Delete a task

### Knowledge Files
- `GET /api/knowledge/byProject/:projectId` - Get all knowledge files for a project
- `PUT /api/knowledge` - Create or update a knowledge file

### Workflow
- `GET /api/workflow/:projectId` - Get workflow state for a project
- `PUT /api/workflow/:projectId` - Update workflow state

### Health
- `GET /health` - Health check endpoint

## Project Structure

```
vibecoding-backend/
├── src/
│   ├── config/          # Database configuration
│   ├── routes/          # API route handlers
│   ├── middleware/      # Express middleware
│   ├── utils/           # Utility functions
│   └── server.js        # Main entry point
├── .env                 # Environment variables
└── package.json
```

## Database Schema

The database automatically initializes with the following tables:
- `projects` - Project master data
- `tasks` - Task items linked to projects
- `knowledge_files` - External memory files (4 types per project)
- `workflow_state` - Current state of each project

