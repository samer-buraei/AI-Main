/**
 * Custom React hook for managing projects
 */

import { useState, useEffect, useCallback } from 'react';
import * as api from '../services/api';

/**
 * Hook for fetching and managing projects
 */
export function useProjects() {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    const { data, error: apiError } = await api.getProjects();
    if (apiError) {
      setError(apiError);
      setProjects([]);
    } else {
      setProjects(data || []);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const createProject = useCallback(async (projectData) => {
    const { data, error: apiError } = await api.createProject(projectData);
    if (apiError) {
      throw new Error(apiError.error || 'Failed to create project');
    }
    setProjects((prev) => [...prev, data]);
    return data;
  }, []);

  const updateProject = useCallback(async (id, projectData) => {
    const { data, error: apiError } = await api.updateProject(id, projectData);
    if (apiError) {
      throw new Error(apiError.error || 'Failed to update project');
    }
    setProjects((prev) => prev.map((p) => (p.id === id ? data : p)));
    return data;
  }, []);

  const deleteProject = useCallback(async (id) => {
    const { error: apiError } = await api.deleteProject(id);
    if (apiError) {
      throw new Error(apiError.error || 'Failed to delete project');
    }
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }, []);

  return {
    projects,
    isLoading,
    error,
    loadProjects,
    createProject,
    updateProject,
    deleteProject,
  };
}

/**
 * Hook for fetching tasks for a specific project
 */
export function useTasks(projectId) {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadTasks = useCallback(async () => {
    if (!projectId) {
      setTasks([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    const { data, error: apiError } = await api.getTasksByProject(projectId);
    if (apiError) {
      setError(apiError);
      setTasks([]);
    } else {
      setTasks(data || []);
    }
    setIsLoading(false);
  }, [projectId]);

  useEffect(() => {
    loadTasks();
  }, [loadTasks]);

  const updateTask = useCallback(async (taskId, updates) => {
    // Optimistic update
    const previousTasks = [...tasks];
    setTasks((prev) =>
      prev.map((task) => (task.id === taskId ? { ...task, ...updates } : task))
    );

    try {
      const { data, error: apiError } = await api.updateTask(taskId, updates);
      if (apiError) {
        // Rollback on error
        setTasks(previousTasks);
        throw new Error(apiError.error || 'Failed to update task');
      }
      // Update with server response
      setTasks((prev) => prev.map((task) => (task.id === taskId ? data : task)));
      return data;
    } catch (err) {
      setTasks(previousTasks);
      throw err;
    }
  }, [tasks]);

  const createTask = useCallback(async (taskData) => {
    const { data, error: apiError } = await api.createTask(taskData);
    if (apiError) {
      throw new Error(apiError.error || 'Failed to create task');
    }
    setTasks((prev) => [...prev, data]);
    return data;
  }, []);

  const deleteTask = useCallback(async (taskId) => {
    const { error: apiError } = await api.deleteTask(taskId);
    if (apiError) {
      throw new Error(apiError.error || 'Failed to delete task');
    }
    setTasks((prev) => prev.filter((task) => task.id !== taskId));
  }, []);

  return {
    tasks,
    isLoading,
    error,
    loadTasks,
    updateTask,
    createTask,
    deleteTask,
  };
}

