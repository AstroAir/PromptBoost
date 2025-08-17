/**
 * @fileoverview Centralized Error Handling System for PromptBoost
 * Provides consistent error handling, logging, and user-friendly error messages
 * across the entire extension.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

/**
 * Error severity levels
 * @enum {string}
 */
const ErrorSeverity = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Error categories for better organization
 * @enum {string}
 */
const ErrorCategory = {
  API: 'api',
  VALIDATION: 'validation',
  STORAGE: 'storage',
  NETWORK: 'network',
  AUTHENTICATION: 'authentication',
  TEMPLATE: 'template',
  PROVIDER: 'provider',
  CONFIGURATION: 'configuration',
  UNKNOWN: 'unknown'
};

/**
 * Centralized error handling system
 * @class ErrorHandler
 */
class ErrorHandler {
  /**
   * Handles an error with consistent logging and user notification
   * 
   * @static
   * @method handle
   * @param {Error|string} error - The error to handle
   * @param {string} context - Context where the error occurred
   * @param {Object} [options={}] - Additional options
   * @param {string} [options.category] - Error category
   * @param {string} [options.severity] - Error severity
   * @param {boolean} [options.notify=true] - Whether to notify user
   * @param {Object} [options.metadata] - Additional error metadata
   * @returns {Object} Processed error information
   */
  static handle(error, context, options = {}) {
    const processedError = this.processError(error, context, options);

    // Log the error
    this.logError(processedError);

    // Notify user if requested
    if (options.notify !== false) {
      this.notifyUser(processedError);
    }

    // Report for analytics (if enabled)
    this.reportError(processedError);

    return processedError;
  }

  /**
   * Processes raw error into structured format
   * 
   * @static
   * @method processError
   * @param {Error|string} error - Raw error
   * @param {string} context - Error context
   * @param {Object} options - Processing options
   * @returns {Object} Processed error
   */
  static processError(error, context, options = {}) {
    const timestamp = new Date().toISOString();
    const errorObj = error instanceof Error ? error : new Error(String(error));

    return {
      id: this.generateErrorId(),
      timestamp,
      context,
      message: errorObj.message,
      stack: errorObj.stack,
      category: options.category || this.categorizeError(errorObj),
      severity: options.severity || this.determineSeverity(errorObj),
      userMessage: this.getUserFriendlyMessage(errorObj, options.category),
      metadata: {
        userAgent: navigator.userAgent,
        url: window.location?.href,
        ...options.metadata
      }
    };
  }

  /**
   * Categorizes error based on message and context
   * 
   * @static
   * @method categorizeError
   * @param {Error} error - Error to categorize
   * @returns {string} Error category
   */
  static categorizeError(error) {
    const message = error.message.toLowerCase();

    if (message.includes('api') || message.includes('fetch') || message.includes('http')) {
      return ErrorCategory.API;
    }
    if (message.includes('auth') || message.includes('key') || message.includes('token')) {
      return ErrorCategory.AUTHENTICATION;
    }
    if (message.includes('storage') || message.includes('chrome.storage')) {
      return ErrorCategory.STORAGE;
    }
    if (message.includes('network') || message.includes('connection')) {
      return ErrorCategory.NETWORK;
    }
    if (message.includes('template') || message.includes('validation')) {
      return ErrorCategory.TEMPLATE;
    }
    if (message.includes('provider')) {
      return ErrorCategory.PROVIDER;
    }
    if (message.includes('config') || message.includes('setting')) {
      return ErrorCategory.CONFIGURATION;
    }

    return ErrorCategory.UNKNOWN;
  }

  /**
   * Determines error severity
   * 
   * @static
   * @method determineSeverity
   * @param {Error} error - Error to analyze
   * @returns {string} Error severity
   */
  static determineSeverity(error) {
    const message = error.message.toLowerCase();

    if (message.includes('critical') || message.includes('fatal')) {
      return ErrorSeverity.CRITICAL;
    }
    if (message.includes('auth') || message.includes('permission')) {
      return ErrorSeverity.HIGH;
    }
    if (message.includes('api') || message.includes('network')) {
      return ErrorSeverity.MEDIUM;
    }

    return ErrorSeverity.LOW;
  }

  /**
   * Gets user-friendly error message
   * 
   * @static
   * @method getUserFriendlyMessage
   * @param {Error} error - Original error
   * @param {string} category - Error category
   * @returns {string} User-friendly message
   */
  static getUserFriendlyMessage(error, category) {
    const categoryMessages = {
      [ErrorCategory.API]: 'There was a problem connecting to the AI service. Please check your internet connection and try again.',
      [ErrorCategory.AUTHENTICATION]: 'Authentication failed. Please check your API key and try again.',
      [ErrorCategory.STORAGE]: 'There was a problem saving your settings. Please try again.',
      [ErrorCategory.NETWORK]: 'Network connection error. Please check your internet connection.',
      [ErrorCategory.TEMPLATE]: 'There was a problem with the template. Please check the template format.',
      [ErrorCategory.PROVIDER]: 'AI provider error. Please try a different provider or check your settings.',
      [ErrorCategory.CONFIGURATION]: 'Configuration error. Please check your settings.',
      [ErrorCategory.UNKNOWN]: 'An unexpected error occurred. Please try again.'
    };

    return categoryMessages[category] || categoryMessages[ErrorCategory.UNKNOWN];
  }

  /**
   * Logs error to console with appropriate level
   * 
   * @static
   * @method logError
   * @param {Object} processedError - Processed error object
   */
  static logError(processedError) {
    const logMessage = `[${processedError.context}] ${processedError.message}`;

    switch (processedError.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        console.error(logMessage, processedError);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn(logMessage, processedError);
        break;
      default:
        console.log(logMessage, processedError);
    }
  }

  /**
   * Notifies user of error
   * 
   * @static
   * @method notifyUser
   * @param {Object} processedError - Processed error object
   */
  static notifyUser(processedError) {
    // Only notify for medium and high severity errors
    if (processedError.severity === ErrorSeverity.LOW) {
      return;
    }

    // Use chrome notifications if available
    if (typeof chrome !== 'undefined' && chrome.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        title: 'PromptBoost Error',
        message: processedError.userMessage
      });
    }
  }

  /**
   * Reports error for analytics (placeholder for future implementation)
   * 
   * @static
   * @method reportError
   * @param {Object} processedError - Processed error object
   */
  static reportError(processedError) {
    // Placeholder for error reporting/analytics
    // Could send to analytics service in the future
    if (processedError.severity === ErrorSeverity.CRITICAL) {
      console.log('Critical error reported:', processedError.id);
    }
  }

  /**
   * Generates unique error ID
   * 
   * @static
   * @method generateErrorId
   * @returns {string} Unique error ID
   */
  static generateErrorId() {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Creates a standardized error object
   * 
   * @static
   * @method createError
   * @param {string} message - Error message
   * @param {string} category - Error category
   * @param {Object} [metadata] - Additional metadata
   * @returns {Error} Standardized error
   */
  static createError(message, category, metadata = {}) {
    const error = new Error(message);
    error.category = category;
    error.metadata = metadata;
    return error;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ErrorHandler, ErrorSeverity, ErrorCategory };
} else if (typeof window !== 'undefined') {
  window.ErrorHandler = ErrorHandler;
  window.ErrorSeverity = ErrorSeverity;
  window.ErrorCategory = ErrorCategory;
}
