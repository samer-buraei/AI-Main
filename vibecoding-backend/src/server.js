/**
 * Vibecoding Backend API Server
 * Main entry point for the backend application
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connect, initializeSchema } = require('./config/database');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const logger = require('./utils/logger');

// Import route handlers
const projectRoutes = require('./routes/projects');
const taskRoutes = require('./routes/tasks');
const knowledgeRoutes = require('./routes/knowledge_files');
const workflowRoutes = require('./routes/workflow');
const orchestratorRoutes = require('./routes/orchestrator');

// Constants
const PORT = process.env.PORT || 4000;

// Initialize Express app
const app = express();

// Middleware
app.use(cors()); // Allow cross-origin requests
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'vibecoding-backend',
  });
});

// API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/knowledge', knowledgeRoutes);
app.use('/api/workflow', workflowRoutes);
app.use('/api/orchestrator', orchestratorRoutes);

// 404 Handler (must be after all routes)
app.use(notFoundHandler);

// Global Error Handler (must be last)
app.use(errorHandler);

/**
 * Initialize and start the server
 */
async function startServer() {
  try {
    // Connect to database
    await connect();

    // Initialize database schema
    await initializeSchema();

    // Start HTTP server
    app.listen(PORT, () => {
      logger.info(`Vibecoding Backend API is running`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        url: `http://localhost:${PORT}`,
      });
    });
  } catch (error) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  const { close } = require('./config/database');
  await close();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  const { close } = require('./config/database');
  await close();
  process.exit(0);
});

// Start the server
startServer();

module.exports = app;

