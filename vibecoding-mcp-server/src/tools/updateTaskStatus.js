/**
 * Update Task Status Tool
 * Updates a task's status (used for handovers and progress tracking)
 */

const backendClient = require('../services/backendClient');
const logger = require('../utils/logger');

const VALID_STATUSES = ['READY', 'IN_PROGRESS', 'DONE', 'BLOCKED'];

/**
 * Update a task's status
 * @param {Object} input - Tool input
 * @param {string} input.taskId - The task ID
 * @param {string} input.newStatus - The new status
 * @param {string} [input.projectId] - Optional project ID for validation
 * @returns {Promise<Object>} Result with updated task
 */
async function updateTaskStatus(input) {
  const { taskId, newStatus, projectId } = input;

  if (!taskId || !newStatus) {
    throw new Error('taskId and newStatus are required');
  }

  if (!VALID_STATUSES.includes(newStatus)) {
    throw new Error(`Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}`);
  }

  logger.info('Updating task status', { taskId, newStatus });

  try {
    // If projectId is provided, validate the task belongs to the project
    if (projectId) {
      const tasks = await backendClient.getTasksByProject(projectId);
      const task = tasks.find((t) => t.id === taskId);
      if (!task) {
        throw new Error(`Task ${taskId} not found in project ${projectId}`);
      }
    }

    // Update the task
    const updatedTask = await backendClient.updateTask(taskId, { status: newStatus });

    logger.info('Task status updated', { taskId, oldStatus: 'unknown', newStatus });

    return {
      message: `Task ${taskId} status updated to ${newStatus}.`,
      updatedTask: {
        id: updatedTask.id,
        title: updatedTask.title,
        status: updatedTask.status,
        assigned_to: updatedTask.assigned_to,
      },
    };
  } catch (error) {
    logger.error('Error updating task status', { error: error.message, taskId });
    throw error;
  }
}

module.exports = updateTaskStatus;

