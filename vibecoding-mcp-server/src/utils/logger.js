/**
 * Centralized logging utility for MCP Server
 */

const logLevels = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3,
};

const currentLogLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'INFO' : 'DEBUG');

function formatMessage(level, message, data = null) {
  const timestamp = new Date().toISOString();
  const logEntry = {
    timestamp,
    level,
    message,
    ...(data && { data }),
  };
  return JSON.stringify(logEntry);
}

function error(message, data = null) {
  if (logLevels[currentLogLevel] >= logLevels.ERROR) {
    console.error(formatMessage('ERROR', message, data));
  }
}

function warn(message, data = null) {
  if (logLevels[currentLogLevel] >= logLevels.WARN) {
    console.warn(formatMessage('WARN', message, data));
  }
}

function info(message, data = null) {
  if (logLevels[currentLogLevel] >= logLevels.INFO) {
    console.log(formatMessage('INFO', message, data));
  }
}

function debug(message, data = null) {
  if (logLevels[currentLogLevel] >= logLevels.DEBUG) {
    console.log(formatMessage('DEBUG', message, data));
  }
}

module.exports = {
  error,
  warn,
  info,
  debug,
};

