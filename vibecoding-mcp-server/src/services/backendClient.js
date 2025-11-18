/**
 * Backend API Client
 * Wrapper for communicating with the Vibecoding Backend API
 */

const axios = require('axios');
const logger = require('../utils/logger');

const BACKEND_API_URL = process.env.BACKEND_API_URL || 'http://localhost:4000/api';

// Create axios instance
const backendApi = axios.create({
  baseURL: BACKEND_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 seconds for potentially long operations
});

/**
 * Retry logic for failed requests
 */
async function retryRequest(requestFn, maxRetries = 3) {
  let lastError;
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await requestFn();
    } catch (error) {
      lastError = error;
      if (i < maxRetries - 1 && shouldRetry(error)) {
        const delay = Math.pow(2, i) * 1000; // Exponential backoff
        logger.debug(`Retrying request (attempt ${i + 2}/${maxRetries})`, { delay });
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }
  throw lastError;
}

/**
 * Determine if an error should trigger a retry
 */
function shouldRetry(error) {
  if (!error.response) {
    // Network error - retry
    return true;
  }
  // Retry on 5xx errors, but not on 4xx errors
  return error.response.status >= 500;
}

/**
 * Handle API errors
 */
function handleError(error, context = '') {
  if (error.response) {
    const message = error.response.data?.error || error.response.statusText || 'API error';
    logger.error(`Backend API error${context ? ` (${context})` : ''}`, {
      status: error.response.status,
      message,
    });
    throw new Error(message);
  } else if (error.request) {
    logger.error(`Backend API request failed${context ? ` (${context})` : ''}`, {
      message: 'No response from backend',
    });
    throw new Error('Backend API is not responding. Is the backend server running?');
  } else {
    logger.error(`Backend API error${context ? ` (${context})` : ''}`, {
      message: error.message,
    });
    throw error;
  }
}

// Request interceptor
backendApi.interceptors.request.use(
  (config) => {
    logger.debug('Backend API request', { method: config.method, url: config.url });
    return config;
  },
  (error) => {
    logger.error('Backend API request setup error', { error: error.message });
    return Promise.reject(error);
  }
);

// Response interceptor
backendApi.interceptors.response.use(
  (response) => {
    logger.debug('Backend API response', { status: response.status, url: response.config.url });
    return response;
  },
  (error) => {
    logger.error('Backend API response error', {
      status: error.response?.status,
      message: error.message,
    });
    return Promise.reject(error);
  }
);

/**
 * Backend API client methods
 */
const backendClient = {
  /**
   * Get a project by ID
   */
  async getProject(projectId) {
    try {
      const response = await retryRequest(() => backendApi.get(`/projects/${projectId}`));
      return response.data;
    } catch (error) {
      handleError(error, `getProject(${projectId})`);
    }
  },

  /**
   * Get all tasks for a project
   */
  async getTasksByProject(projectId) {
    try {
      const response = await retryRequest(() => backendApi.get(`/tasks/byProject/${projectId}`));
      return response.data;
    } catch (error) {
      handleError(error, `getTasksByProject(${projectId})`);
    }
  },

  /**
   * Get a specific task (by finding it in the project's tasks)
   */
  async getTask(projectId, taskId) {
    try {
      const tasks = await this.getTasksByProject(projectId);
      const task = tasks.find((t) => t.id === taskId);
      if (!task) {
        throw new Error(`Task ${taskId} not found in project ${projectId}`);
      }
      return task;
    } catch (error) {
      handleError(error, `getTask(${projectId}, ${taskId})`);
    }
  },

  /**
   * Create a new task
   */
  async createTask(taskData) {
    try {
      const response = await retryRequest(() => backendApi.post('/tasks', taskData));
      return response.data;
    } catch (error) {
      handleError(error, 'createTask');
    }
  },

  /**
   * Update a task
   */
  async updateTask(taskId, updates) {
    try {
      const response = await retryRequest(() => backendApi.put(`/tasks/${taskId}`, updates));
      return response.data;
    } catch (error) {
      handleError(error, `updateTask(${taskId})`);
    }
  },

  /**
   * Get all knowledge files for a project
   */
  async getKnowledgeFiles(projectId) {
    try {
      const response = await retryRequest(() => backendApi.get(`/knowledge/byProject/${projectId}`));
      return response.data;
    } catch (error) {
      handleError(error, `getKnowledgeFiles(${projectId})`);
    }
  },

  /**
   * Update a knowledge file
   */
  async updateKnowledgeFile(projectId, fileType, content) {
    try {
      const response = await retryRequest(() =>
        backendApi.put('/knowledge', {
          project_id: projectId,
          file_type: fileType,
          content: content,
        })
      );
      return response.data;
    } catch (error) {
      handleError(error, `updateKnowledgeFile(${projectId}, ${fileType})`);
    }
  },

  /**
   * Get workflow state for a project
   */
  async getWorkflow(projectId) {
    try {
      const response = await retryRequest(() => backendApi.get(`/workflow/${projectId}`));
      return response.data;
    } catch (error) {
      handleError(error, `getWorkflow(${projectId})`);
    }
  },

  /**
   * Update workflow state
   */
  async updateWorkflow(projectId, workflowData) {
    try {
      const response = await retryRequest(() => backendApi.put(`/workflow/${projectId}`, workflowData));
      return response.data;
    } catch (error) {
      handleError(error, `updateWorkflow(${projectId})`);
    }
  },
};

module.exports = backendClient;

