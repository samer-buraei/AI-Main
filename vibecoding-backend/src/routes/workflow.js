/**
 * Workflow API Routes
 * Handles project workflow state management
 */

const express = require('express');
const { getDatabase } = require('../config/database');
const logger = require('../utils/logger');
const { validateId, sanitizeBody } = require('../middleware/validation');

const router = express.Router();

/**
 * GET /api/workflow/:projectId
 * Get the workflow state for a project
 */
router.get('/:projectId', validateId('projectId'), async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const db = getDatabase();
    const sql = `SELECT * FROM workflow_state WHERE project_id = ?`;

    db.get(sql, [projectId], (err, row) => {
      if (err) {
        logger.error('Error fetching workflow state', { error: err.message, projectId });
        return next(err);
      }

      if (!row) {
        return res.status(404).json({ error: 'Workflow state not found for this project' });
      }

      // Parse JSON strings back into objects
      const workflowState = {
        ...row,
        active_tasks: JSON.parse(row.active_tasks || '[]'),
      };

      logger.debug('Workflow state fetched', { projectId });
      res.json(workflowState);
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/workflow/:projectId
 * Update the workflow state for a project
 */
router.put('/:projectId', validateId('projectId'), sanitizeBody, async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const { current_phase, active_tasks, blockers } = req.body;
    const db = getDatabase();

    // Fetch current state
    db.get(`SELECT * FROM workflow_state WHERE project_id = ?`, [projectId], (err, row) => {
      if (err) {
        logger.error('Error fetching workflow state', { error: err.message, projectId });
        return next(err);
      }

      if (!row) {
        return res.status(404).json({ error: 'Workflow state not found' });
      }

      // Merge old data with new data
      const updatedState = {
        current_phase: current_phase !== undefined ? current_phase.trim() : row.current_phase,
        active_tasks: active_tasks !== undefined ? JSON.stringify(active_tasks) : row.active_tasks,
        blockers: blockers !== undefined ? blockers.trim() : row.blockers,
      };

      const sql = `UPDATE workflow_state
                   SET current_phase = ?, active_tasks = ?, blockers = ?
                   WHERE project_id = ?`;

      db.run(sql, [updatedState.current_phase, updatedState.active_tasks, updatedState.blockers, projectId], function (err) {
        if (err) {
          logger.error('Error updating workflow state', { error: err.message, projectId });
          return next(err);
        }

        logger.info('Workflow state updated', { projectId, phase: updatedState.current_phase });
        res.json({
          ...updatedState,
          active_tasks: JSON.parse(updatedState.active_tasks),
        });
      });
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

