/**
 * Tasks API Routes
 * Handles all task-related CRUD operations
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../config/database');
const logger = require('../utils/logger');
const { validateRequiredFields, validateId, validateEnum, sanitizeBody } = require('../middleware/validation');

const router = express.Router();

const VALID_STATUSES = ['READY', 'IN_PROGRESS', 'DONE', 'BLOCKED'];

/**
 * POST /api/tasks
 * Create a new task for a project
 */
router.post(
  '/',
  sanitizeBody,
  validateRequiredFields(['project_id', 'title']),
  validateEnum('status', VALID_STATUSES),
  async (req, res, next) => {
    try {
      const { project_id, title, description, status, assigned_to, allowed_paths } = req.body;
      const db = getDatabase();

      // Verify project exists
      db.get(`SELECT id FROM projects WHERE id = ?`, [project_id], (err, project) => {
        if (err) {
          logger.error('Error checking project existence', { error: err.message, projectId: project_id });
          return next(err);
        }

        if (!project) {
          return res.status(404).json({ error: 'Project not found' });
        }

        const shortId = `T-${uuidv4().split('-')[0]}`;
        const newTask = {
          id: shortId,
          project_id,
          title: title.trim(),
          description: description ? description.trim() : '',
          status: status || 'READY',
          assigned_to: assigned_to ? assigned_to.trim() : null,
          allowed_paths: JSON.stringify(allowed_paths || []),
        };

        const sql = `INSERT INTO tasks (id, project_id, title, description, status, assigned_to, allowed_paths)
                     VALUES (?, ?, ?, ?, ?, ?, ?)`;

        db.run(sql, Object.values(newTask), function (err) {
          if (err) {
            logger.error('Error creating task', { error: err.message, task: newTask });
            return next(err);
          }

          logger.info('Task created', { taskId: newTask.id, projectId: project_id });
          res.status(201).json({
            ...newTask,
            allowed_paths: JSON.parse(newTask.allowed_paths),
          });
        });
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/tasks/byProject/:projectId
 * Get all tasks for a specific project
 */
router.get('/byProject/:projectId', validateId('projectId'), async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const db = getDatabase();
    const sql = `SELECT * FROM tasks WHERE project_id = ? ORDER BY 
                CASE status 
                  WHEN 'READY' THEN 1
                  WHEN 'IN_PROGRESS' THEN 2
                  WHEN 'BLOCKED' THEN 3
                  WHEN 'DONE' THEN 4
                END, title`;

    db.all(sql, [projectId], (err, rows) => {
      if (err) {
        logger.error('Error fetching tasks', { error: err.message, projectId });
        return next(err);
      }

      const tasks = rows.map((row) => ({
        ...row,
        allowed_paths: JSON.parse(row.allowed_paths || '[]'),
      }));

      logger.debug('Tasks fetched', { count: tasks.length, projectId });
      res.json(tasks);
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/tasks/:id
 * Update a task
 */
router.put(
  '/:id',
  validateId('id'),
  sanitizeBody,
  validateEnum('status', VALID_STATUSES),
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, description, status, assigned_to, allowed_paths } = req.body;
      const db = getDatabase();

      // Fetch current task
      db.get(`SELECT * FROM tasks WHERE id = ?`, [id], (err, row) => {
        if (err) {
          logger.error('Error fetching task', { error: err.message, taskId: id });
          return next(err);
        }

        if (!row) {
          return res.status(404).json({ error: 'Task not found' });
        }

        // Merge old data with new data
        const updatedTask = {
          title: title !== undefined ? title.trim() : row.title,
          description: description !== undefined ? description.trim() : row.description,
          status: status !== undefined ? status : row.status,
          assigned_to: assigned_to !== undefined ? (assigned_to ? assigned_to.trim() : null) : row.assigned_to,
          allowed_paths: allowed_paths !== undefined ? JSON.stringify(allowed_paths) : row.allowed_paths,
        };

        const sql = `UPDATE tasks 
                     SET title = ?, description = ?, status = ?, assigned_to = ?, allowed_paths = ?
                     WHERE id = ?`;

        db.run(
          sql,
          [updatedTask.title, updatedTask.description, updatedTask.status, updatedTask.assigned_to, updatedTask.allowed_paths, id],
          function (err) {
            if (err) {
              logger.error('Error updating task', { error: err.message, taskId: id });
              return next(err);
            }

            logger.info('Task updated', { taskId: id, status: updatedTask.status });
            res.json({
              id,
              ...updatedTask,
              allowed_paths: JSON.parse(updatedTask.allowed_paths),
            });
          }
        );
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/tasks/:id
 * Delete a task
 */
router.delete('/:id', validateId('id'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const sql = `DELETE FROM tasks WHERE id = ?`;

    db.run(sql, [id], function (err) {
      if (err) {
        logger.error('Error deleting task', { error: err.message, taskId: id });
        return next(err);
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      logger.info('Task deleted', { taskId: id });
      res.status(200).json({ message: 'Task deleted successfully' });
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

