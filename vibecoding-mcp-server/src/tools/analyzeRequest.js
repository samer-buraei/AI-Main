/**
 * Analyze Request Tool
 * Analyzes a user request and creates tasks for agents
 */

const backendClient = require('../services/backendClient');
const logger = require('../utils/logger');

/**
 * Analyze a user request and create tasks
 * @param {Object} input - Tool input
 * @param {string} input.projectId - The project ID
 * @param {string} input.request - The user's natural language request
 * @returns {Promise<Object>} Result with created tasks
 */
async function analyzeRequest(input) {
  const { projectId, request } = input;

  if (!projectId || !request) {
    throw new Error('projectId and request are required');
  }

  logger.info('Analyzing request', { projectId, request: request.substring(0, 100) });

  try {
    // Fetch project knowledge to understand context
    const knowledgeBase = await backendClient.getKnowledgeFiles(projectId);
    const changePatterns = knowledgeBase.CHANGE_PATTERNS || '';

    // Simple keyword-based analysis (can be replaced with LLM in the future)
    const tasksToCreate = [];
    const requestLower = request.toLowerCase();

    // Analyze request and create appropriate tasks
    if (requestLower.includes('dark mode') || requestLower.includes('theme') || requestLower.includes('ui')) {
      tasksToCreate.push({
        title: 'Implement Dark Mode UI',
        description: `Implement dark mode/theme based on request: "${request}"`,
        assigned_to: '@frontend',
        allowed_paths: ['src/components/*', 'src/styles/*', 'src/theme/*'],
        status: 'READY',
      });
      tasksToCreate.push({
        title: 'Add Theme Toggle API',
        description: 'Create API endpoint to save user theme preference',
        assigned_to: '@backend',
        allowed_paths: ['src/api/*', 'src/routes/*'],
        status: 'READY',
      });
    } else if (requestLower.includes('api') || requestLower.includes('endpoint')) {
      tasksToCreate.push({
        title: 'Create API Endpoint',
        description: `Create new API endpoint based on request: "${request}"`,
        assigned_to: '@backend',
        allowed_paths: ['src/api/*', 'src/routes/*', 'src/controllers/*'],
        status: 'READY',
      });
    } else if (requestLower.includes('component') || requestLower.includes('ui') || requestLower.includes('page')) {
      tasksToCreate.push({
        title: 'Create UI Component',
        description: `Create new component/page based on request: "${request}"`,
        assigned_to: '@frontend',
        allowed_paths: ['src/components/*', 'src/pages/*'],
        status: 'READY',
      });
    } else {
      // Generic task
      tasksToCreate.push({
        title: 'Handle Request',
        description: `Handle general request: "${request}"`,
        assigned_to: '@backend',
        allowed_paths: ['src/*'],
        status: 'READY',
      });
    }

    // Create tasks in backend
    const createdTasks = [];
    for (const taskData of tasksToCreate) {
      try {
        const task = await backendClient.createTask({
          project_id: projectId,
          ...taskData,
        });
        createdTasks.push(task);
        logger.debug('Task created', { taskId: task.id, title: task.title });
      } catch (error) {
        logger.error('Failed to create task', { error: error.message, taskData });
      }
    }

    // Update workflow state
    try {
      const workflow = await backendClient.getWorkflow(projectId);
      await backendClient.updateWorkflow(projectId, {
        active_tasks: createdTasks.map((t) => t.id),
      });
    } catch (error) {
      logger.warn('Failed to update workflow state', { error: error.message });
    }

    logger.info('Request analyzed and tasks created', {
      projectId,
      taskCount: createdTasks.length,
    });

    return {
      message: `OK. I've analyzed the request and created ${createdTasks.length} task(s).`,
      tasks: createdTasks.map((t) => ({
        id: t.id,
        title: t.title,
        assigned_to: t.assigned_to,
        status: t.status,
      })),
    };
  } catch (error) {
    logger.error('Error analyzing request', { error: error.message, projectId });
    throw error;
  }
}

module.exports = analyzeRequest;

