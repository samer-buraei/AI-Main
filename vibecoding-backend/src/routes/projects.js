/**
 * Projects API Routes
 * Handles all project-related CRUD operations
 */

const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { getDatabase } = require('../config/database');
const logger = require('../utils/logger');
const { validateRequiredFields, validateId, sanitizeBody } = require('../middleware/validation');

const router = express.Router();

/**
 * POST /api/projects
 * Create a new project
 */
router.post(
  '/',
  sanitizeBody,
  validateRequiredFields(['name']),
  async (req, res, next) => {
    try {
      const { name, description, type, tech_stack, custom_agents, custom_mcps } = req.body;
      const db = getDatabase();

      const newProject = {
        id: uuidv4(),
        name: name.trim(),
        description: description ? description.trim() : null,
        type: type ? type.trim() : null,
        tech_stack: tech_stack ? JSON.stringify(tech_stack) : JSON.stringify({}),
      };

      const sql = `INSERT INTO projects (id, name, description, type, tech_stack)
                   VALUES (?, ?, ?, ?, ?)`;

      db.run(
        sql,
        [newProject.id, newProject.name, newProject.description, newProject.type, newProject.tech_stack],
        function (err) {
          if (err) {
            logger.error('Error creating project', { error: err.message, project: newProject });
            return next(err);
          }

          logger.info('Project created', { projectId: newProject.id, name: newProject.name });

          // Create default workflow state for the new project
          const workflowId = uuidv4();
          const workflowSql = `INSERT INTO workflow_state (id, project_id, current_phase) VALUES (?, ?, 'BLUEPRINT')`;

          db.run(workflowSql, [workflowId, newProject.id], (err) => {
            if (err) {
              logger.error('Error creating initial workflow state', {
                error: err.message,
                projectId: newProject.id,
              });
              // Don't fail the request, but log the error
            } else {
              logger.debug('Workflow state created', { projectId: newProject.id });
            }
          });

          // NEW: Save Custom Agents to AGENTS_CONFIG knowledge file
          if (custom_agents && custom_agents.length > 0) {
            const agentsContent = custom_agents.map(agent => 
              `## ${agent.role}\n**Description:** ${agent.description || 'No description'}\n**Instructions:** ${agent.instructions || 'Standard agent instructions'}`
            ).join('\n\n---\n\n');

            const agentsConfigId = uuidv4();
            const agentsConfigSql = `
              INSERT INTO knowledge_files (id, project_id, file_type, content, version)
              VALUES (?, ?, 'AGENTS_CONFIG', ?, 1)
            `;

            db.run(agentsConfigSql, [agentsConfigId, newProject.id, agentsContent], (err) => {
              if (err) {
                logger.error('Error saving custom agents', {
                  error: err.message,
                  projectId: newProject.id,
                });
                // Don't fail the request, but log the error
              } else {
                logger.info('Custom agents saved', { 
                  projectId: newProject.id, 
                  count: custom_agents.length 
                });
              }
            });
          }

          // NEW: Save Custom MCPs to MCP_CONFIG knowledge file (optional)
          if (custom_mcps && custom_mcps.length > 0) {
            const mcpsContent = custom_mcps.map(mcp => 
              `## ${mcp.name}\n**Description:** ${mcp.description || 'No description'}\n**Package:** ${mcp.package || 'N/A'}`
            ).join('\n\n---\n\n');

            const mcpConfigId = uuidv4();
            const mcpConfigSql = `
              INSERT INTO knowledge_files (id, project_id, file_type, content, version)
              VALUES (?, ?, 'MCP_CONFIG', ?, 1)
            `;

            db.run(mcpConfigSql, [mcpConfigId, newProject.id, mcpsContent], (err) => {
              if (err) {
                logger.error('Error saving custom MCPs', {
                  error: err.message,
                  projectId: newProject.id,
                });
                // Don't fail the request, but log the error
              } else {
                logger.info('Custom MCPs saved', { 
                  projectId: newProject.id, 
                  count: custom_mcps.length 
                });
              }
            });
          }

          res.status(201).json({
            ...newProject,
            tech_stack: JSON.parse(newProject.tech_stack),
          });
        }
      );
    } catch (error) {
      next(error);
    }
  }
);

/**
 * GET /api/projects
 * Get all projects
 */
router.get('/', async (req, res, next) => {
  try {
    const db = getDatabase();
    const sql = `SELECT * FROM projects ORDER BY name`;

    db.all(sql, [], (err, rows) => {
      if (err) {
        logger.error('Error fetching projects', { error: err.message });
        return next(err);
      }

      const projects = rows.map((row) => ({
        ...row,
        tech_stack: JSON.parse(row.tech_stack || '{}'),
      }));

      logger.debug('Projects fetched', { count: projects.length });
      res.json(projects);
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/projects/:id
 * Get a single project by ID
 */
router.get('/:id', validateId('id'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const sql = `SELECT * FROM projects WHERE id = ?`;

    db.get(sql, [id], (err, row) => {
      if (err) {
        logger.error('Error fetching project', { error: err.message, projectId: id });
        return next(err);
      }

      if (!row) {
        return res.status(404).json({ error: 'Project not found' });
      }

      res.json({
        ...row,
        tech_stack: JSON.parse(row.tech_stack || '{}'),
      });
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/projects/:id
 * Update a project
 */
router.put(
  '/:id',
  validateId('id'),
  sanitizeBody,
  async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name, description, type, tech_stack } = req.body;
      const db = getDatabase();

      // First, check if project exists
      db.get(`SELECT * FROM projects WHERE id = ?`, [id], (err, existingProject) => {
        if (err) {
          logger.error('Error checking project existence', { error: err.message, projectId: id });
          return next(err);
        }

        if (!existingProject) {
          return res.status(404).json({ error: 'Project not found' });
        }

        // Merge existing data with updates
        const updatedProject = {
          name: name !== undefined ? name.trim() : existingProject.name,
          description: description !== undefined ? description.trim() : existingProject.description,
          type: type !== undefined ? type.trim() : existingProject.type,
          tech_stack: tech_stack !== undefined ? JSON.stringify(tech_stack) : existingProject.tech_stack,
        };

        const sql = `UPDATE projects 
                     SET name = ?, description = ?, type = ?, tech_stack = ?
                     WHERE id = ?`;

        db.run(
          sql,
          [updatedProject.name, updatedProject.description, updatedProject.type, updatedProject.tech_stack, id],
          function (err) {
            if (err) {
              logger.error('Error updating project', { error: err.message, projectId: id });
              return next(err);
            }

            logger.info('Project updated', { projectId: id });
            res.json({
              id,
              ...updatedProject,
              tech_stack: JSON.parse(updatedProject.tech_stack),
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
 * DELETE /api/projects/:id
 * Delete a project (cascades to tasks, knowledge files, and workflow state)
 */
router.delete('/:id', validateId('id'), async (req, res, next) => {
  try {
    const { id } = req.params;
    const db = getDatabase();
    const sql = `DELETE FROM projects WHERE id = ?`;

    db.run(sql, [id], function (err) {
      if (err) {
        logger.error('Error deleting project', { error: err.message, projectId: id });
        return next(err);
      }

      if (this.changes === 0) {
        return res.status(404).json({ error: 'Project not found' });
      }

      logger.info('Project deleted', { projectId: id });
      res.status(200).json({ message: 'Project and all associated data deleted successfully' });
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;

