/**
 * Database configuration and initialization
 * Handles SQLite database connection and schema setup
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const logger = require('../utils/logger');

const DB_FILE = path.join(__dirname, '../../vibecoding.db');

let db = null;

/**
 * Initialize database connection
 * @returns {Promise<sqlite3.Database>}
 */
function connect() {
  return new Promise((resolve, reject) => {
    if (db) {
      return resolve(db);
    }

    db = new sqlite3.Database(DB_FILE, (err) => {
      if (err) {
        logger.error('Failed to connect to database', { error: err.message, file: DB_FILE });
        return reject(err);
      }
      logger.info('Connected to SQLite database', { file: DB_FILE });
      resolve(db);
    });

    // Enable foreign keys
    db.run('PRAGMA foreign_keys = ON', (err) => {
      if (err) {
        logger.warn('Failed to enable foreign keys', { error: err.message });
      }
    });
  });
}

/**
 * Initialize database schema
 * Creates all required tables if they don't exist
 */
function initializeSchema() {
  return new Promise((resolve, reject) => {
    if (!db) {
      return reject(new Error('Database not connected'));
    }

    logger.info('Initializing database schema...');

    db.serialize(() => {
      // 1. Projects Table
      db.run(
        `CREATE TABLE IF NOT EXISTS projects (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          description TEXT,
          type TEXT,
          tech_stack TEXT
        )`,
        (err) => {
          if (err) {
            logger.error('Error creating projects table', { error: err.message });
            return reject(err);
          }
          logger.debug('Projects table ready');
        }
      );

      // 2. Tasks Table
      db.run(
        `CREATE TABLE IF NOT EXISTS tasks (
          id TEXT PRIMARY KEY,
          project_id TEXT NOT NULL,
          title TEXT NOT NULL,
          description TEXT,
          status TEXT NOT NULL DEFAULT 'READY',
          assigned_to TEXT,
          allowed_paths TEXT,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )`,
        (err) => {
          if (err) {
            logger.error('Error creating tasks table', { error: err.message });
            return reject(err);
          }
          logger.debug('Tasks table ready');
        }
      );

      // 3. Knowledge Files Table
      db.run(
        `CREATE TABLE IF NOT EXISTS knowledge_files (
          id TEXT PRIMARY KEY,
          project_id TEXT NOT NULL,
          file_type TEXT NOT NULL,
          content TEXT,
          version INTEGER DEFAULT 1,
          UNIQUE(project_id, file_type),
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )`,
        (err) => {
          if (err) {
            logger.error('Error creating knowledge_files table', { error: err.message });
            return reject(err);
          }
          logger.debug('Knowledge files table ready');
        }
      );

      // 4. Workflow State Table
      db.run(
        `CREATE TABLE IF NOT EXISTS workflow_state (
          id TEXT PRIMARY KEY,
          project_id TEXT NOT NULL UNIQUE,
          current_phase TEXT DEFAULT 'BLUEPRINT',
          active_tasks TEXT,
          blockers TEXT,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )`,
        (err) => {
          if (err) {
            logger.error('Error creating workflow_state table', { error: err.message });
            return reject(err);
          }
          logger.debug('Workflow state table ready');
        }
      );

      // 5. Knowledge Docs Table
      // Stores technical directives, research papers, and project documentation
      // Separate from knowledge_files (which stores AGENTS_CONFIG, MCP_CONFIG)
      db.run(
        `CREATE TABLE IF NOT EXISTS knowledge_docs (
          id TEXT PRIMARY KEY,
          project_id TEXT NOT NULL,
          title TEXT NOT NULL,
          content_md TEXT,
          tags TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )`,
        (err) => {
          if (err) {
            logger.error('Error creating knowledge_docs table', { error: err.message });
            return reject(err);
          }
          logger.debug('Knowledge docs table ready');
        }
      );

      // 6. Orchestration Sessions Table
      // This stores the "state" of our AI analysis workflow
      // Junior Dev Note: We use JSON columns for flexibility - no need to change schema when adding new fields!
      db.run(
        `CREATE TABLE IF NOT EXISTS orchestration_sessions (
          id TEXT PRIMARY KEY,
          project_id TEXT,
          status TEXT DEFAULT 'pending',
          github_url TEXT,
          repo_metadata TEXT,
          analysis_json TEXT,
          qa_history TEXT,
          final_plan TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        )`,
        (err) => {
          if (err) {
            logger.error('Error creating orchestration_sessions table', { error: err.message });
            return reject(err);
          }
          logger.debug('Orchestration sessions table ready');
          logger.info('Database schema initialized successfully');
          resolve();
        }
      );
    });
  });
}

/**
 * Get database instance
 * @returns {sqlite3.Database}
 */
function getDatabase() {
  if (!db) {
    throw new Error('Database not initialized. Call connect() first.');
  }
  return db;
}

/**
 * Close database connection
 */
function close() {
  return new Promise((resolve, reject) => {
    if (!db) {
      return resolve();
    }

    db.close((err) => {
      if (err) {
        logger.error('Error closing database', { error: err.message });
        return reject(err);
      }
      logger.info('Database connection closed');
      db = null;
      resolve();
    });
  });
}

module.exports = {
  connect,
  initializeSchema,
  getDatabase,
  close,
};

