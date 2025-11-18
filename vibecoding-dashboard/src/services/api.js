/**
 * API Service
 * Centralized API client with error handling and retry logic
 */

import axios from 'axios';
import { API_RETRY_CONFIG } from '../utils/constants';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:4000/api';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 seconds
});

/**
 * Retry logic for failed requests
 */
async function retryRequest(requestFn, retries = API_RETRY_CONFIG.maxRetries) {
  try {
    return await requestFn();
  } catch (error) {
    if (retries > 0 && shouldRetry(error)) {
      await new Promise((resolve) => setTimeout(resolve, API_RETRY_CONFIG.retryDelay));
      return retryRequest(requestFn, retries - 1);
    }
    throw error;
  }
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
 * Handle API errors consistently
 */
function handleError(error) {
  if (error.response) {
    // Server responded with error status
    const message = error.response.data?.error || error.response.statusText || 'An error occurred';
    return { error: message, status: error.response.status };
  } else if (error.request) {
    // Request made but no response
    return { error: 'Network error. Please check your connection.', status: 0 };
  } else {
    // Error in request setup
    return { error: error.message || 'An unexpected error occurred', status: 0 };
  }
}

// Request interceptor for logging
apiClient.interceptors.request.use(
  (config) => {
    console.debug('API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Response Error:', error);
    return Promise.reject(error);
  }
);

// ============================================================================
// PROJECTS API
// ============================================================================

export const getProjects = async () => {
  try {
    const response = await retryRequest(() => apiClient.get('/projects'));
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: handleError(error) };
  }
};

export const getProjectById = async (id) => {
  try {
    const response = await retryRequest(() => apiClient.get(`/projects/${id}`));
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: handleError(error) };
  }
};

export const createProject = async (projectData) => {
  try {
    const response = await retryRequest(() => apiClient.post('/projects', projectData));
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: handleError(error) };
  }
};

export const updateProject = async (id, projectData) => {
  try {
    const response = await retryRequest(() => apiClient.put(`/projects/${id}`, projectData));
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: handleError(error) };
  }
};

export const deleteProject = async (id) => {
  try {
    await retryRequest(() => apiClient.delete(`/projects/${id}`));
    return { error: null };
  } catch (error) {
    return { error: handleError(error) };
  }
};

// ============================================================================
// TASKS API
// ============================================================================

export const getTasksByProject = async (projectId) => {
  try {
    const response = await retryRequest(() => apiClient.get(`/tasks/byProject/${projectId}`));
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: handleError(error) };
  }
};

export const createTask = async (taskData) => {
  try {
    const response = await retryRequest(() => apiClient.post('/tasks', taskData));
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: handleError(error) };
  }
};

export const updateTask = async (taskId, taskUpdates) => {
  try {
    const response = await retryRequest(() => apiClient.put(`/tasks/${taskId}`, taskUpdates));
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: handleError(error) };
  }
};

export const deleteTask = async (taskId) => {
  try {
    await retryRequest(() => apiClient.delete(`/tasks/${taskId}`));
    return { error: null };
  } catch (error) {
    return { error: handleError(error) };
  }
};

// ============================================================================
// KNOWLEDGE FILES API
// ============================================================================

export const getKnowledgeFiles = async (projectId) => {
  try {
    const response = await retryRequest(() => apiClient.get(`/knowledge/byProject/${projectId}`));
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: handleError(error) };
  }
};

export const updateKnowledgeFile = async (projectId, fileType, content) => {
  try {
    const response = await retryRequest(() =>
      apiClient.put('/knowledge', {
        project_id: projectId,
        file_type: fileType,
        content: content,
      })
    );
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: handleError(error) };
  }
};

// ============================================================================
// WORKFLOW API
// ============================================================================

export const getWorkflow = async (projectId) => {
  try {
    const response = await retryRequest(() => apiClient.get(`/workflow/${projectId}`));
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: handleError(error) };
  }
};

export const updateWorkflow = async (projectId, workflowData) => {
  try {
    const response = await retryRequest(() => apiClient.put(`/workflow/${projectId}`, workflowData));
    return { data: response.data, error: null };
  } catch (error) {
    return { data: null, error: handleError(error) };
  }
};

// Export default object for convenience
const api = {
  // Projects
  getProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  // Tasks
  getTasksByProject,
  createTask,
  updateTask,
  deleteTask,
  // Knowledge
  getKnowledgeFiles,
  updateKnowledgeFile,
  // Workflow
  getWorkflow,
  updateWorkflow,
};

export default api;

