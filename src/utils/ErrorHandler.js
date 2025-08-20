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
   * Handles an error with consistent logging, user notification, and recovery attempts
   *
   * @static
   * @method handle
   * @param {Error|string} error - The error to handle
   * @param {string} context - Context where the error occurred
   * @param {Object} [options={}] - Additional options
   * @param {string} [options.category] - Error category
   * @param {string} [options.severity] - Error severity
   * @param {boolean} [options.notify=true] - Whether to notify user
   * @param {boolean} [options.attemptRecovery=true] - Whether to attempt automatic recovery
   * @param {Object} [options.metadata] - Additional error metadata
   * @returns {Promise<Object>} Processed error information
   */
  static async handle(error, context, options = {}) {
    const processedError = this.processError(error, context, options);

    // Log the error
    this.logError(processedError);

    // Attempt automatic recovery if enabled
    let recoveryAttempted = false;
    let recoverySuccessful = false;

    if (options.attemptRecovery !== false && processedError.severity !== ErrorSeverity.CRITICAL) {
      recoveryAttempted = true;
      recoverySuccessful = await this.attemptRecovery(processedError);

      if (recoverySuccessful) {
        this.logger.info(`Automatic recovery attempted for error ${processedError.id}`);
      }
    }

    // Update error statistics
    this.updateErrorStats(processedError, recoveryAttempted, recoverySuccessful);

    // Notify user if requested (and recovery wasn't successful)
    if (options.notify !== false && !recoverySuccessful) {
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
   * Notifies user of error with enhanced feedback mechanisms
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

    // Enhanced notification with action buttons for certain error types
    const notificationOptions = {
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: 'PromptBoost Error',
      message: processedError.userMessage
    };

    // Add action buttons for specific error categories
    if (processedError.category === ErrorCategory.AUTHENTICATION) {
      notificationOptions.buttons = [
        { title: 'Open Settings' },
        { title: 'Retry' }
      ];
    } else if (processedError.category === ErrorCategory.NETWORK) {
      notificationOptions.buttons = [
        { title: 'Retry' },
        { title: 'Check Connection' }
      ];
    }

    // Use chrome notifications if available
    if (typeof chrome !== 'undefined' && chrome.notifications) {
      chrome.notifications.create(processedError.id, notificationOptions, (_notificationId) => {
        if (chrome.runtime.lastError) {
          console.warn('Failed to create notification:', chrome.runtime.lastError);
          // Fallback to console notification
          this.fallbackNotification(processedError);
        }
      });

      // Handle notification button clicks
      chrome.notifications.onButtonClicked.addListener((notificationId, buttonIndex) => {
        if (notificationId === processedError.id) {
          this.handleNotificationAction(processedError, buttonIndex);
        }
      });
    } else {
      this.fallbackNotification(processedError);
    }
  }

  /**
   * Handles notification action button clicks
   *
   * @static
   * @method handleNotificationAction
   * @param {Object} processedError - Processed error object
   * @param {number} buttonIndex - Index of clicked button
   */
  static handleNotificationAction(processedError, buttonIndex) {
    switch (processedError.category) {
      case ErrorCategory.AUTHENTICATION:
        if (buttonIndex === 0) {
          // Open Settings
          chrome.runtime.openOptionsPage();
        } else if (buttonIndex === 1) {
          // Retry - emit retry event
          this.emitRetryEvent(processedError);
        }
        break;
      case ErrorCategory.NETWORK:
        if (buttonIndex === 0) {
          // Retry
          this.emitRetryEvent(processedError);
        } else if (buttonIndex === 1) {
          // Check Connection - open network diagnostics
          chrome.tabs.create({ url: 'chrome://settings/internet' });
        }
        break;
    }

    // Clear the notification
    chrome.notifications.clear(processedError.id);
  }

  /**
   * Emits retry event for error recovery
   *
   * @static
   * @method emitRetryEvent
   * @param {Object} processedError - Processed error object
   */
  static emitRetryEvent(processedError) {
    // Send message to background script to retry the failed operation
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({
        type: 'ERROR_RETRY',
        errorId: processedError.id,
        context: processedError.context,
        metadata: processedError.metadata
      });
    }
  }

  /**
   * Fallback notification when chrome.notifications is not available
   *
   * @static
   * @method fallbackNotification
   * @param {Object} processedError - Processed error object
   */
  static fallbackNotification(processedError) {
    // Use console for development or when notifications are not available
    console.error(`PromptBoost Error [${processedError.category}]:`, processedError.userMessage);

    // Could also use a custom in-page notification system here
    if (typeof window !== 'undefined' && window.postMessage) {
      window.postMessage({
        type: 'PROMPTBOOST_ERROR_NOTIFICATION',
        error: processedError
      }, '*');
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
   * Attempts to recover from an error automatically
   *
   * @static
   * @method attemptRecovery
   * @param {Object} processedError - Processed error object
   * @returns {Promise<boolean>} True if recovery was attempted
   */
  static async attemptRecovery(processedError) {
    try {
      switch (processedError.category) {
        case ErrorCategory.AUTHENTICATION:
          return await this.recoverAuthentication(processedError);
        case ErrorCategory.STORAGE:
          return await this.recoverStorage(processedError);
        case ErrorCategory.NETWORK:
          return await this.recoverNetwork(processedError);
        case ErrorCategory.CONFIGURATION:
          return await this.recoverConfiguration(processedError);
        default:
          return false;
      }
    } catch (recoveryError) {
      console.warn('Error recovery failed:', recoveryError);
      return false;
    }
  }

  /**
   * Attempts to recover from authentication errors
   *
   * @static
   * @method recoverAuthentication
   * @param {Object} processedError - Processed error object
   * @returns {Promise<boolean>} True if recovery was attempted
   */
  static async recoverAuthentication(processedError) {
    // For authentication errors, we can try to refresh tokens or prompt for re-authentication
    if (processedError.metadata?.provider) {
      // Send message to background script to attempt token refresh
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({
          type: 'REFRESH_AUTHENTICATION',
          provider: processedError.metadata.provider,
          errorId: processedError.id
        });
        return true;
      }
    }
    return false;
  }

  /**
   * Attempts to recover from storage errors
   *
   * @static
   * @method recoverStorage
   * @param {Object} processedError - Processed error object
   * @returns {Promise<boolean>} True if recovery was attempted
   */
  static async recoverStorage(processedError) {
    // For storage errors, we can try to clear corrupted data or use fallback storage
    if (typeof chrome !== 'undefined' && chrome.storage) {
      try {
        // Check storage quota
        const usage = await chrome.storage.sync.getBytesInUse();
        const quota = chrome.storage.sync.QUOTA_BYTES;

        if (usage > quota * 0.9) {
          // Storage is nearly full, attempt cleanup
          chrome.runtime.sendMessage({
            type: 'CLEANUP_STORAGE',
            errorId: processedError.id
          });
          return true;
        }
      } catch (e) {
        // Storage check failed, but we tried
      }
    }
    return false;
  }

  /**
   * Attempts to recover from network errors
   *
   * @static
   * @method recoverNetwork
   * @param {Object} processedError - Processed error object
   * @returns {Promise<boolean>} True if recovery was attempted
   */
  static async recoverNetwork(processedError) {
    // For network errors, we can check connectivity and suggest retry
    if (navigator.onLine === false) {
      // Browser is offline, wait for connection
      window.addEventListener('online', () => {
        this.emitRetryEvent(processedError);
      }, { once: true });
      return true;
    }

    // Try a simple connectivity test
    try {
      await fetch('https://www.google.com/favicon.ico', {
        method: 'HEAD',
        mode: 'no-cors',
        cache: 'no-cache'
      });
      // Connection seems OK, suggest retry
      setTimeout(() => this.emitRetryEvent(processedError), 2000);
      return true;
    } catch (e) {
      // Connection test failed
      return false;
    }
  }

  /**
   * Attempts to recover from configuration errors
   *
   * @static
   * @method recoverConfiguration
   * @param {Object} processedError - Processed error object
   * @returns {Promise<boolean>} True if recovery was attempted
   */
  static async recoverConfiguration(processedError) {
    // For configuration errors, we can try to reset to defaults
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      chrome.runtime.sendMessage({
        type: 'RESET_CONFIGURATION',
        errorId: processedError.id,
        context: processedError.context
      });
      return true;
    }
    return false;
  }

  /**
   * Gets error statistics for monitoring
   *
   * @static
   * @method getErrorStats
   * @returns {Object} Error statistics
   */
  static getErrorStats() {
    const stats = JSON.parse(localStorage.getItem('promptboost_error_stats') || '{}');
    return {
      totalErrors: stats.totalErrors || 0,
      errorsByCategory: stats.errorsByCategory || {},
      errorsBySeverity: stats.errorsBySeverity || {},
      lastError: stats.lastError || null,
      recoveryAttempts: stats.recoveryAttempts || 0,
      successfulRecoveries: stats.successfulRecoveries || 0
    };
  }

  /**
   * Updates error statistics
   *
   * @static
   * @method updateErrorStats
   * @param {Object} processedError - Processed error object
   * @param {boolean} recoveryAttempted - Whether recovery was attempted
   * @param {boolean} recoverySuccessful - Whether recovery was successful
   */
  static updateErrorStats(processedError, recoveryAttempted = false, recoverySuccessful = false) {
    const stats = this.getErrorStats();

    stats.totalErrors++;
    stats.errorsByCategory[processedError.category] = (stats.errorsByCategory[processedError.category] || 0) + 1;
    stats.errorsBySeverity[processedError.severity] = (stats.errorsBySeverity[processedError.severity] || 0) + 1;
    stats.lastError = {
      timestamp: processedError.timestamp,
      category: processedError.category,
      severity: processedError.severity
    };

    if (recoveryAttempted) {
      stats.recoveryAttempts++;
      if (recoverySuccessful) {
        stats.successfulRecoveries++;
      }
    }

    localStorage.setItem('promptboost_error_stats', JSON.stringify(stats));
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
