/**
 * Request validation middleware
 * Provides validation helpers for common request patterns
 */

const logger = require('../utils/logger');

/**
 * Validate required fields in request body
 * @param {string[]} requiredFields - Array of required field names
 */
function validateRequiredFields(requiredFields) {
  return (req, res, next) => {
    const missingFields = requiredFields.filter((field) => !(field in req.body));

    if (missingFields.length > 0) {
      logger.warn('Validation failed: missing required fields', {
        path: req.path,
        missingFields,
      });
      return res.status(400).json({
        error: `Missing required fields: ${missingFields.join(', ')}`,
      });
    }

    next();
  };
}

/**
 * Validate that a field is a valid UUID or ID format
 * @param {string} fieldName - Name of the field to validate
 */
function validateId(fieldName = 'id') {
  return (req, res, next) => {
    const id = req.params[fieldName] || req.body[fieldName];

    if (!id || typeof id !== 'string' || id.trim().length === 0) {
      return res.status(400).json({
        error: `Invalid ${fieldName}: must be a non-empty string`,
      });
    }

    next();
  };
}

/**
 * Validate enum values
 * @param {string} fieldName - Name of the field to validate
 * @param {string[]} allowedValues - Array of allowed values
 */
function validateEnum(fieldName, allowedValues) {
  return (req, res, next) => {
    const value = req.body[fieldName];

    if (value !== undefined && !allowedValues.includes(value)) {
      return res.status(400).json({
        error: `Invalid ${fieldName}: must be one of ${allowedValues.join(', ')}`,
      });
    }

    next();
  };
}

/**
 * Sanitize string input (basic XSS prevention)
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeString(input) {
  if (typeof input !== 'string') {
    return input;
  }
  // Remove potentially dangerous characters
  return input.trim().replace(/[<>]/g, '');
}

/**
 * Sanitize request body strings
 */
function sanitizeBody(req, res, next) {
  if (req.body && typeof req.body === 'object') {
    Object.keys(req.body).forEach((key) => {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key]);
      }
    });
  }
  next();
}

module.exports = {
  validateRequiredFields,
  validateId,
  validateEnum,
  sanitizeString,
  sanitizeBody,
};

