/**
 * Vibecoding MCP Server
 * Main entry point for the MCP bridge server
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const logger = require('./utils/logger');

// Import tool implementations
const analyzeRequest = require('./tools/analyzeRequest');
const generateContextPack = require('./tools/generateContextPack');
const spawnSubOrchestrator = require('./tools/spawnSubOrchestrator');
const updateTaskStatus = require('./tools/updateTaskStatus');

// Constants
const MCP_PORT = process.env.MCP_PORT || 4001;

// Initialize Express app
const app = express();
app.use(cors());
app.use(express.json());

// ============================================================================
// MCP TOOL DEFINITIONS
// ============================================================================
// This is the "menu" of tools we send to Cursor.
// Cursor will read this and know what functions its AI can call.

const mcpTools = {
  'analyze-request': {
    description:
      'Analyzes a user request (e.g., "add dark mode"), breaks it down into tasks, and creates them in the backend.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The ID of the project.',
        },
        request: {
          type: 'string',
          description: "The user's full natural language request.",
        },
      },
      required: ['projectId', 'request'],
    },
  },

  'generate-context-pack': {
    description:
      'Fetches all project knowledge and a specific task, then assembles a small, focused "Context Pack" for an agent to work on.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The ID of the project.',
        },
        taskId: {
          type: 'string',
          description: 'The ID of the task the agent will work on.',
        },
        agentType: {
          type: 'string',
          description: 'The type of agent (e.g., "@frontend") to tailor the context.',
        },
      },
      required: ['projectId', 'taskId'],
    },
  },

  'spawn-sub-orchestrator': {
    description:
      'Fetches all knowledge for a specific project and generates a unique, pre-loaded system prompt for a new "Sub-Orchestrator" instance.',
    inputSchema: {
      type: 'object',
      properties: {
        projectId: {
          type: 'string',
          description: 'The ID of the project to orchestrate.',
        },
      },
      required: ['projectId'],
    },
  },

  'update-task-status': {
    description:
      "Updates a task's status (e.g., 'READY', 'IN_PROGRESS', 'DONE'). Used for handover.",
    inputSchema: {
      type: 'object',
      properties: {
        taskId: {
          type: 'string',
          description: 'The ID of the task to update.',
        },
        newStatus: {
          type: 'string',
          enum: ['READY', 'IN_PROGRESS', 'DONE', 'BLOCKED'],
          description: 'The new status.',
        },
        projectId: {
          type: 'string',
          description: 'Optional project ID for validation.',
        },
      },
      required: ['taskId', 'newStatus'],
    },
  },
};

// ============================================================================
// MCP TOOL IMPLEMENTATIONS REGISTRY
// ============================================================================

const toolImplementations = {
  'analyze-request': analyzeRequest,
  'generate-context-pack': generateContextPack,
  'spawn-sub-orchestrator': spawnSubOrchestrator,
  'update-task-status': updateTaskStatus,
};

// ============================================================================
// MCP ENDPOINTS
// ============================================================================

/**
 * POST /mcp/tools
 * Returns the list of available tools to Cursor
 */
app.post('/mcp/tools', (req, res) => {
  logger.info('Cursor requested tool list');
  res.json({
    tools: mcpTools,
  });
});

/**
 * POST /mcp/call_tool
 * The main action endpoint. Cursor calls this when an AI agent wants to use a tool.
 */
app.post('/mcp/call_tool', async (req, res) => {
  const { name, input } = req.body;

  logger.info('Tool called', { tool: name, input: JSON.stringify(input).substring(0, 200) });

  // Find the tool's implementation
  const toolFunction = toolImplementations[name];

  if (!toolFunction) {
    logger.error('Tool not found', { tool: name });
    return res.status(404).json({
      error: `Tool "${name}" not found. Available tools: ${Object.keys(mcpTools).join(', ')}`,
    });
  }

  try {
    // Execute the tool's logic
    const result = await toolFunction(input);

    logger.info('Tool executed successfully', { tool: name });
    res.json(result);
  } catch (error) {
    logger.error('Error executing tool', {
      tool: name,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });

    res.status(500).json({
      error: `Error executing tool ${name}: ${error.message}`,
      ...(process.env.NODE_ENV === 'development' && { stack: error.stack }),
    });
  }
});

/**
 * GET /health
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'vibecoding-mcp-server',
    tools: Object.keys(mcpTools),
  });
});

// ============================================================================
// SERVER STARTUP
// ============================================================================

app.listen(MCP_PORT, () => {
  logger.info('Vibecoding MCP Server is running', {
    port: MCP_PORT,
    environment: process.env.NODE_ENV || 'development',
    url: `http://localhost:${MCP_PORT}`,
    backendUrl: process.env.BACKEND_API_URL || 'http://localhost:4000/api',
    tools: Object.keys(mcpTools).join(', '),
  });
  logger.info('Ready to connect with Cursor.');
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully...');
  process.exit(0);
});

module.exports = app;

