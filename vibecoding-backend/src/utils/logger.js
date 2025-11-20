/**
 * Logger Utility
 * Centralized logging for the backend
 */

const fs = require('fs');
const path = require('path');

// Ensure logs directory exists
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const errorLogPath = path.join(logDir, 'error.log');
const combinedLogPath = path.join(logDir, 'combined.log');

function formatMessage(level, message, meta = {}) {
  const timestamp = new Date().toISOString();
  return JSON.stringify({
    timestamp,
    level,
    message,
    ...meta
  });
}

function writeToFile(filePath, content) {
  fs.appendFile(filePath, content + '\n', (err) => {
    if (err) console.error('Failed to write to log file:', err);
  });
}

const logger = {
  info: (message, meta) => {
    const msg = formatMessage('INFO', message, meta);
    console.log(msg); // Keep console for dev
    writeToFile(combinedLogPath, msg);
  },
  
  error: (message, meta) => {
    const msg = formatMessage('ERROR', message, meta);
    console.error(msg); // Keep console for dev
    writeToFile(errorLogPath, msg);
    writeToFile(combinedLogPath, msg);
  },
  
  warn: (message, meta) => {
    const msg = formatMessage('WARN', message, meta);
    console.warn(msg);
    writeToFile(combinedLogPath, msg);
  },
  
  debug: (message, meta) => {
    if (process.env.NODE_ENV === 'development') {
      const msg = formatMessage('DEBUG', message, meta);
      console.debug(msg);
      // Optional: Write debug to file? Maybe too noisy.
    }
  }
};

module.exports = logger;
