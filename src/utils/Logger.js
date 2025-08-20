/**
 * @fileoverview Unified Logging System for PromptBoost
 * Provides consistent logging across the extension with configurable levels,
 * performance tracking, and development/production modes.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

/**
 * Log levels in order of severity
 * @enum {number}
 */
const LogLevel = {
  DEBUG: 0,
  INFO: 1,
  WARN: 2,
  ERROR: 3,
  NONE: 4
};

/**
 * Log level names for display
 * @enum {string}
 */
const LogLevelNames = {
  [LogLevel.DEBUG]: 'DEBUG',
  [LogLevel.INFO]: 'INFO',
  [LogLevel.WARN]: 'WARN',
  [LogLevel.ERROR]: 'ERROR'
};

/**
 * Unified logging system with configurable levels and formatting
 * @class Logger
 */
class Logger {
  /**
   * Creates a logger instance for a specific module
   * 
   * @constructor
   * @param {string} module - Module name for log identification
   * @param {Object} [options={}] - Logger configuration
   * @param {number} [options.level] - Minimum log level to output
   * @param {boolean} [options.timestamp=true] - Include timestamps
   * @param {boolean} [options.performance=false] - Enable performance logging
   */
  constructor(module, options = {}) {
    this.module = module;
    this.options = {
      level: options.level ?? this.getDefaultLogLevel(),
      timestamp: options.timestamp !== false,
      performance: options.performance === true,
      ...options
    };

    this.performanceMarks = new Map();
  }

  /**
   * Gets default log level based on environment
   * 
   * @method getDefaultLogLevel
   * @returns {number} Default log level
   */
  getDefaultLogLevel() {
    // Check if in development mode
    if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getManifest) {
      const manifest = chrome.runtime.getManifest();
      if (manifest.version.includes('dev') || manifest.version.includes('beta')) {
        return LogLevel.DEBUG;
      }
    }

    // Production mode - only show warnings and errors
    return LogLevel.WARN;
  }

  /**
   * Logs debug message
   * 
   * @method debug
   * @param {string} message - Log message
   * @param {...any} args - Additional arguments
   */
  debug(message, ...args) {
    this.log(LogLevel.DEBUG, message, ...args);
  }

  /**
   * Logs info message
   * 
   * @method info
   * @param {string} message - Log message
   * @param {...any} args - Additional arguments
   */
  info(message, ...args) {
    this.log(LogLevel.INFO, message, ...args);
  }

  /**
   * Logs warning message
   * 
   * @method warn
   * @param {string} message - Log message
   * @param {...any} args - Additional arguments
   */
  warn(message, ...args) {
    this.log(LogLevel.WARN, message, ...args);
  }

  /**
   * Logs error message
   * 
   * @method error
   * @param {string} message - Log message
   * @param {...any} args - Additional arguments
   */
  error(message, ...args) {
    this.log(LogLevel.ERROR, message, ...args);
  }

  /**
   * Core logging method
   *
   * @method log
   * @param {number} level - Log level
   * @param {string} message - Log message
   * @param {...any} args - Additional arguments
   */
  log(level, message, ...args) {
    if (level < this.options.level) {
      return;
    }

    const formattedMessage = this.formatMessage(level, message);
    const consoleMethod = this.getConsoleMethod(level);

    // Log to console
    consoleMethod(formattedMessage, ...args);

    // Send to LogCollector if available
    this.sendToLogCollector(level, message, args);
  }

  /**
   * Sends log entry to LogCollector for centralized collection
   *
   * @method sendToLogCollector
   * @param {number} level - Log level
   * @param {string} message - Log message
   * @param {Array} args - Additional arguments
   */
  sendToLogCollector(level, message, args) {
    try {
      // Get LogCollector instance if available
      const LogCollector = typeof window !== 'undefined' && window.LogCollector
        ? window.LogCollector
        : null;

      if (LogCollector) {
        const collector = LogCollector.getInstance();
        collector.addLogEntry({
          level: LogLevelNames[level],
          module: this.module,
          message: message,
          args: args
        });
      }
    } catch (error) {
      // Silently fail to avoid infinite logging loops
    }
  }

  /**
   * Formats log message with timestamp and module info
   * 
   * @method formatMessage
   * @param {number} level - Log level
   * @param {string} message - Original message
   * @returns {string} Formatted message
   */
  formatMessage(level, message) {
    const parts = [];

    if (this.options.timestamp) {
      parts.push(`[${new Date().toISOString()}]`);
    }

    parts.push(`[${LogLevelNames[level]}]`);
    parts.push(`[${this.module}]`);
    parts.push(message);

    return parts.join(' ');
  }

  /**
   * Gets appropriate console method for log level
   * 
   * @method getConsoleMethod
   * @param {number} level - Log level
   * @returns {Function} Console method
   */
  getConsoleMethod(level) {
    switch (level) {
      case LogLevel.DEBUG:
        return console.debug || console.log;
      case LogLevel.INFO:
        return console.info || console.log;
      case LogLevel.WARN:
        return console.warn;
      case LogLevel.ERROR:
        return console.error;
      default:
        return console.log;
    }
  }

  /**
   * Starts performance timing
   * 
   * @method startTiming
   * @param {string} operation - Operation name
   */
  startTiming(operation) {
    if (!this.options.performance) return;

    const mark = `${this.module}_${operation}_start`;
    this.performanceMarks.set(operation, {
      start: performance.now(),
      mark
    });

    if (performance.mark) {
      performance.mark(mark);
    }

    this.debug(`Started timing: ${operation}`);
  }

  /**
   * Ends performance timing and logs duration
   * 
   * @method endTiming
   * @param {string} operation - Operation name
   * @returns {number} Duration in milliseconds
   */
  endTiming(operation) {
    if (!this.options.performance) return 0;

    const timing = this.performanceMarks.get(operation);
    if (!timing) {
      this.warn(`No timing started for operation: ${operation}`);
      return 0;
    }

    const duration = performance.now() - timing.start;
    this.performanceMarks.delete(operation);

    if (performance.mark && performance.measure) {
      const endMark = `${this.module}_${operation}_end`;
      performance.mark(endMark);
      performance.measure(`${this.module}_${operation}`, timing.mark, endMark);
    }

    this.info(`${operation} completed in ${duration.toFixed(2)}ms`);
    return duration;
  }

  /**
   * Logs API call details
   * 
   * @method logApiCall
   * @param {string} method - HTTP method
   * @param {string} url - API URL
   * @param {Object} [options={}] - Additional options
   */
  logApiCall(method, url, options = {}) {
    const sanitizedUrl = this.sanitizeUrl(url);
    this.debug(`API Call: ${method} ${sanitizedUrl}`, {
      headers: options.headers ? Object.keys(options.headers) : [],
      hasBody: !!options.body
    });
  }

  /**
   * Logs API response details
   * 
   * @method logApiResponse
   * @param {string} method - HTTP method
   * @param {string} url - API URL
   * @param {number} status - Response status
   * @param {number} duration - Request duration
   */
  logApiResponse(method, url, status, duration) {
    const sanitizedUrl = this.sanitizeUrl(url);
    const level = status >= 400 ? LogLevel.ERROR : LogLevel.DEBUG;
    this.log(level, `API Response: ${method} ${sanitizedUrl} - ${status} (${duration}ms)`);
  }

  /**
   * Sanitizes URL for logging (removes sensitive data)
   * 
   * @method sanitizeUrl
   * @param {string} url - Original URL
   * @returns {string} Sanitized URL
   */
  sanitizeUrl(url) {
    try {
      const urlObj = new URL(url);
      // Remove query parameters that might contain sensitive data
      const sensitiveParams = ['key', 'token', 'auth', 'password', 'secret'];
      sensitiveParams.forEach(param => {
        if (urlObj.searchParams.has(param)) {
          urlObj.searchParams.set(param, '[REDACTED]');
        }
      });
      return urlObj.toString();
    } catch {
      return url.replace(/[?&](key|token|auth|password|secret)=[^&]*/gi, '$1=[REDACTED]');
    }
  }

  /**
   * Sets log level for this logger instance
   * 
   * @method setLevel
   * @param {number} level - New log level
   */
  setLevel(level) {
    this.options.level = level;
    this.info(`Log level changed to ${LogLevelNames[level]}`);
  }

  /**
   * Enables or disables performance logging
   * 
   * @method setPerformanceLogging
   * @param {boolean} enabled - Whether to enable performance logging
   */
  setPerformanceLogging(enabled) {
    this.options.performance = enabled;
    this.info(`Performance logging ${enabled ? 'enabled' : 'disabled'}`);
  }
}

/**
 * Global logger configuration
 * @class LoggerConfig
 */
class LoggerConfig {
  static globalLevel = null;
  static loggers = new Map();

  /**
   * Sets global log level for all loggers
   * 
   * @static
   * @method setGlobalLevel
   * @param {number} level - Global log level
   */
  static setGlobalLevel(level) {
    this.globalLevel = level;
    this.loggers.forEach(logger => logger.setLevel(level));
  }

  /**
   * Registers a logger instance
   * 
   * @static
   * @method registerLogger
   * @param {Logger} logger - Logger instance
   */
  static registerLogger(logger) {
    this.loggers.set(logger.module, logger);
    if (this.globalLevel !== null) {
      logger.setLevel(this.globalLevel);
    }
  }

  /**
   * Gets logger for module (creates if doesn't exist)
   * 
   * @static
   * @method getLogger
   * @param {string} module - Module name
   * @param {Object} [options] - Logger options
   * @returns {Logger} Logger instance
   */
  static getLogger(module, options = {}) {
    if (!this.loggers.has(module)) {
      const logger = new Logger(module, options);
      this.registerLogger(logger);
    }
    return this.loggers.get(module);
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { Logger, LoggerConfig, LogLevel };
} else if (typeof window !== 'undefined') {
  window.Logger = Logger;
  window.LoggerConfig = LoggerConfig;
  window.LogLevel = LogLevel;
}
