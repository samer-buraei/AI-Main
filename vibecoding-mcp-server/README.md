# Vibecoding MCP Server

The Model Context Protocol (MCP) bridge that connects Cursor IDE to the Vibecoding Backend. This is Layer 3 of the system architecture.

## Features

- MCP-compatible tool registry
- Context pack generation for AI agents
- Request analysis and task creation
- Sub-orchestrator spawning
- Task status management

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create a `.env` file:
```
MCP_PORT=4001
BACKEND_API_URL=http://localhost:4000/api
```

3. Make sure the Backend API (Layer 1) is running on port 4000.

4. Start the MCP server:
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:4001`.

## Connecting to Cursor

1. Open Cursor IDE
2. Go to Settings > Tools & MCP
3. Under "MCP Servers," click "Add MCP Server"
4. Enter the URL: `http://localhost:4001`
5. Click Save

## Available Tools

The MCP server exposes the following tools to Cursor:

1. **analyze-request**: Analyzes user requests and creates tasks
2. **generate-context-pack**: Generates focused context packs for agents
3. **spawn-sub-orchestrator**: Creates project-specific orchestrator prompts
4. **update-task-status**: Updates task status for handovers

## Project Structure

```
vibecoding-mcp-server/
├── src/
│   ├── tools/              # Individual tool implementations
│   ├── services/           # Backend API client
│   ├── utils/              # Utility functions
│   └── mcp-server.js       # Main entry point
└── package.json
```

