/**
 * Global error handling middleware
 * Catches all errors and returns consistent error responses
 */

const logger = require('../utils/logger');

/**
 * Global error handler middleware
 * Should be used as the last middleware in Express app
 */
function errorHandler(err, req, res, next) {
  logger.error('Request error', {
    method: req.method,
    path: req.path,
    error: err.message,
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
  });

  // Default error
  let statusCode = err.statusCode || err.status || 500;
  let message = err.message || 'Internal server error';

  // SQLite specific errors
  if (err.code === 'SQLITE_CONSTRAINT') {
    statusCode = 400;
    if (err.message.includes('UNIQUE')) {
      message = 'Duplicate entry. This record already exists.';
    } else if (err.message.includes('FOREIGN KEY')) {
      message = 'Invalid reference. Related record does not exist.';
    } else {
      message = 'Database constraint violation.';
    }
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
  }

  // JSON parsing errors
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    statusCode = 400;
    message = 'Invalid JSON in request body';
  }

  res.status(statusCode).json({
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

/**
 * 404 Not Found handler
 */
function notFoundHandler(req, res) {
  res.status(404).json({
    error: `Route ${req.method} ${req.path} not found`,
  });
}

module.exports = {
  errorHandler,
  notFoundHandler,
};

