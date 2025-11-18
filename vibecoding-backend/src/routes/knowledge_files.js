/**
 * Knowledge Files API Routes
 * Handles the 4 key knowledge files (external memory) for each project
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../config/database');
const logger = require('../utils/logger');
const { validateRequiredFields, validateId, validateEnum, sanitizeBody } = require('../middleware/validation');

const router = express.Router();

const FILE_TYPES = ['PROJECT_MAP', 'COMPONENT_SUMMARIES', 'CHANGE_PATTERNS', 'FILE_DEPENDENCIES'];

/**
 * GET /api/knowledge/byProject/:projectId
 * Get all knowledge files for a project
 */
router.get('/byProject/:projectId', validateId('projectId'), async (req, res, next) => {
  try {
    const { projectId } = req.params;
    const db = getDatabase();
    const sql = `SELECT file_type, content FROM knowledge_files WHERE project_id = ?`;

    db.all(sql, [projectId], (err, rows) => {
      if (err) {
        logger.error('Error fetching knowledge files', { error: err.message, projectId });
        return next(err);
      }

      // Create a simple object with all file types
      const knowledgeBase = {};
      for (const fileType of FILE_TYPES) {
        const found = rows.find((r) => r.file_type === fileType);
        knowledgeBase[fileType] = found ? found.content : '';
      }

      logger.debug('Knowledge files fetched', { projectId, fileCount: rows.length });
      res.json(knowledgeBase);
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/knowledge
 * Create or update a knowledge file (UPSERT)
 */
router.put(
  '/',
  sanitizeBody,
  validateRequiredFields(['project_id', 'file_type', 'content']),
  validateEnum('file_type', FILE_TYPES),
  async (req, res, next) => {
    try {
      const { project_id, file_type, content } = req.body;
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

        // UPSERT: Insert or update
        const sql = `
          INSERT INTO knowledge_files (id, project_id, file_type, content, version)
          VALUES (?, ?, ?, ?, 1)
          ON CONFLICT(project_id, file_type) DO UPDATE SET
            content = excluded.content,
            version = version + 1
        `;

        db.run(sql, [uuidv4(), project_id, file_type, content], function (err) {
          if (err) {
            logger.error('Error upserting knowledge file', {
              error: err.message,
              projectId: project_id,
              fileType: file_type,
            });
            return next(err);
          }

          logger.info('Knowledge file updated', {
            projectId: project_id,
            fileType: file_type,
            isNew: this.changes === 1,
          });

          res.status(200).json({
            message: `${file_type} updated successfully`,
            project_id,
            file_type,
          });
        });
      });
    } catch (error) {
      next(error);
    }
  }
);

module.exports = router;

