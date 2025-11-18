/**
 * Application constants
 */

export const TASK_STATUSES = {
  READY: 'READY',
  IN_PROGRESS: 'IN_PROGRESS',
  DONE: 'DONE',
  BLOCKED: 'BLOCKED',
};

export const STATUS_LABELS = {
  [TASK_STATUSES.READY]: 'Ready',
  [TASK_STATUSES.IN_PROGRESS]: 'In Progress',
  [TASK_STATUSES.DONE]: 'Done',
  [TASK_STATUSES.BLOCKED]: 'Blocked',
};

export const STATUS_COLORS = {
  [TASK_STATUSES.READY]: 'bg-blue-600',
  [TASK_STATUSES.IN_PROGRESS]: 'bg-yellow-600',
  [TASK_STATUSES.DONE]: 'bg-green-600',
  [TASK_STATUSES.BLOCKED]: 'bg-red-600',
};

export const AGENT_COLORS = {
  '@frontend': 'bg-blue-500 text-blue-100',
  '@backend': 'bg-green-500 text-green-100',
  '@qa': 'bg-yellow-500 text-yellow-100',
  '@devops': 'bg-purple-500 text-purple-100',
  '@orchestrator': 'bg-indigo-500 text-indigo-100',
};

export const API_RETRY_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // milliseconds
};

