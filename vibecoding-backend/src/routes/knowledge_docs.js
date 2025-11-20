/**
 * Knowledge Docs API Routes
 * Handles technical directives, research papers, and project documentation
 * Separate from knowledge_files (which stores AGENTS_CONFIG, MCP_CONFIG, etc.)
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../config/database');
const logger = require('../utils/logger');
const { validateRequiredFields, validateId, sanitizeBody } = require('../middleware/validation');

const router = express.Router();

/**
 * GET /api/knowledge-docs/byProject/:projectId
 * Get all knowledge docs for a project
 */
router.get('/byProject/:projectId', validateId('projectId'), async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const db = getDatabase();
    const sql = `SELECT * FROM knowledge_docs WHERE project_id = ? ORDER BY created_at DESC`;

    db.all(sql, [projectId], (err, rows) => {
      if (err) {
        logger.error('Error fetching knowledge docs', { error: err.message, projectId });
        return next(err);
      }

      logger.debug('Knowledge docs fetched', { projectId, count: rows.length });
      res.json(rows || []);
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/knowledge-docs
 * Create a new knowledge doc
 */
router.post(
  '/',
  sanitizeBody,
  validateRequiredFields(['project_id', 'title', 'content_md']),
  async (req, res, next) => {
    try {
      const { project_id, title, content_md, tags } = req.body;
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

        const docId = uuidv4();
        const sql = `
          INSERT INTO knowledge_docs (id, project_id, title, content_md, tags, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        `;

        db.run(sql, [docId, project_id, title, content_md || '', tags || ''], function (err) {
          if (err) {
            logger.error('Error creating knowledge doc', {
              error: err.message,
              projectId: project_id,
              title,
            });
            return next(err);
          }

          logger.info('Knowledge doc created', {
            docId,
            projectId: project_id,
            title,
          });

          res.status(201).json({
            id: docId,
            project_id,
            title,
            content_md,
            tags,
          });
        });
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * PUT /api/knowledge-docs/:id
 * Update a knowledge doc
 */
router.put(
  '/:id',
  validateId('id'),
  sanitizeBody,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, content_md, tags } = req.body;
      const db = getDatabase();

      // Check if doc exists
      db.get(`SELECT * FROM knowledge_docs WHERE id = ?`, [id], (err, existingDoc) => {
        if (err) {
          logger.error('Error checking doc existence', { error: err.message, docId: id });
          return next(err);
        }

        if (!existingDoc) {
          return res.status(404).json({ error: 'Knowledge doc not found' });
        }

        const updatedTitle = title !== undefined ? title : existingDoc.title;
        const updatedContent = content_md !== undefined ? content_md : existingDoc.content_md;
        const updatedTags = tags !== undefined ? tags : existingDoc.tags;

        const sql = `
          UPDATE knowledge_docs
          SET title = ?, content_md = ?, tags = ?, updated_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `;

        db.run(sql, [updatedTitle, updatedContent, updatedTags, id], function (err) {
          if (err) {
            logger.error('Error updating knowledge doc', { error: err.message, docId: id });
            return next(err);
          }

          logger.info('Knowledge doc updated', { docId: id });

          res.json({
            id,
            project_id: existingDoc.project_id,
            title: updatedTitle,
            content_md: updatedContent,
            tags: updatedTags,
          });
        });
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * DELETE /api/knowledge-docs/:id
 * Delete a knowledge doc
 */
router.delete('/:id', validateId('id'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const sql = `DELETE FROM knowledge_docs WHERE id = ?`;

    db.run(sql, [id], function (err) {
      if (err) {
        logger.error('Error deleting knowledge doc', { error: err.message, docId: id });
        return next(err);
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Knowledge doc not found' });
      }

      logger.info('Knowledge doc deleted', { docId: id });
      res.status(200).json({ message: 'Knowledge doc deleted successfully' });
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

