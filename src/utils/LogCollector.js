/**
 * @fileoverview Centralized Log Collection System for PromptBoost
 * Collects logs from all parts of the extension for real-time display and debugging.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

/**
 * Log entry structure
 * @typedef {Object} LogEntry
 * @property {string} id - Unique log entry ID
 * @property {number} timestamp - Timestamp in milliseconds
 * @property {string} level - Log level (DEBUG, INFO, WARN, ERROR)
 * @property {string} module - Module that generated the log
 * @property {string} message - Log message
 * @property {Array} args - Additional arguments
 * @property {string} context - Extension context (background, content, options, etc.)
 */

/**
 * Centralized log collection and management system
 * @class LogCollector
 */
class LogCollector {
  static instance = null;
  
  /**
   * Gets singleton instance of LogCollector
   * 
   * @static
   * @method getInstance
   * @returns {LogCollector} Singleton instance
   */
  static getInstance() {
    if (!this.instance) {
      this.instance = new LogCollector();
    }
    return this.instance;
  }

  /**
   * Creates LogCollector instance
   * 
   * @constructor
   */
  constructor() {
    if (LogCollector.instance) {
      return LogCollector.instance;
    }

    this.logs = [];
    this.maxLogs = 1000; // Circular buffer size
    this.listeners = new Set();
    this.filters = {
      level: null,
      module: null,
      context: null,
      search: null
    };

    // Determine current context
    this.currentContext = this.detectContext();
    
    // Set up message passing for cross-context log collection
    this.setupMessagePassing();
  }

  /**
   * Detects the current extension context
   * 
   * @method detectContext
   * @returns {string} Context name
   */
  detectContext() {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      if (chrome.runtime.getBackgroundPage) {
        return 'background';
      } else if (window.location.protocol === 'chrome-extension:') {
        return 'options';
      } else {
        return 'content';
      }
    }
    return 'unknown';
  }

  /**
   * Sets up message passing between extension contexts
   * 
   * @method setupMessagePassing
   */
  setupMessagePassing() {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      // Listen for log messages from other contexts
      chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
        if (message.type === 'LOG_ENTRY') {
          this.addLogEntry(message.logEntry);
          sendResponse({ success: true });
        } else if (message.type === 'GET_LOGS') {
          sendResponse({ logs: this.getFilteredLogs() });
        }
      });
    }
  }

  /**
   * Adds a log entry to the collection
   * 
   * @method addLogEntry
   * @param {Object} logData - Log data
   */
  addLogEntry(logData) {
    const logEntry = {
      id: this.generateLogId(),
      timestamp: Date.now(),
      level: logData.level,
      module: logData.module,
      message: logData.message,
      args: logData.args || [],
      context: logData.context || this.currentContext,
      ...logData
    };

    // Add to circular buffer
    this.logs.push(logEntry);
    if (this.logs.length > this.maxLogs) {
      this.logs.shift(); // Remove oldest log
    }

    // Notify listeners
    this.notifyListeners('logAdded', logEntry);

    // Send to other contexts if this is the background script
    if (this.currentContext === 'background') {
      this.broadcastLogEntry(logEntry);
    } else {
      // Send to background script for broadcasting
      this.sendLogToBackground(logEntry);
    }
  }

  /**
   * Generates unique log ID
   * 
   * @method generateLogId
   * @returns {string} Unique ID
   */
  generateLogId() {
    return `log_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sends log entry to background script
   * 
   * @method sendLogToBackground
   * @param {LogEntry} logEntry - Log entry to send
   */
  sendLogToBackground(logEntry) {
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      try {
        chrome.runtime.sendMessage({
          type: 'LOG_ENTRY',
          logEntry: logEntry
        });
      } catch (error) {
        // Silently fail if extension context is invalid
      }
    }
  }

  /**
   * Broadcasts log entry to all contexts
   * 
   * @method broadcastLogEntry
   * @param {LogEntry} logEntry - Log entry to broadcast
   */
  broadcastLogEntry(_logEntry) {
    // This would be implemented in background script to send to all tabs
    // For now, just store locally
  }

  /**
   * Gets all logs with current filters applied
   * 
   * @method getFilteredLogs
   * @returns {Array<LogEntry>} Filtered logs
   */
  getFilteredLogs() {
    let filteredLogs = [...this.logs];

    // Apply level filter
    if (this.filters.level) {
      filteredLogs = filteredLogs.filter(log => log.level === this.filters.level);
    }

    // Apply module filter
    if (this.filters.module) {
      filteredLogs = filteredLogs.filter(log => 
        log.module.toLowerCase().includes(this.filters.module.toLowerCase())
      );
    }

    // Apply context filter
    if (this.filters.context) {
      filteredLogs = filteredLogs.filter(log => log.context === this.filters.context);
    }

    // Apply search filter
    if (this.filters.search) {
      const searchTerm = this.filters.search.toLowerCase();
      filteredLogs = filteredLogs.filter(log => 
        log.message.toLowerCase().includes(searchTerm) ||
        log.module.toLowerCase().includes(searchTerm)
      );
    }

    return filteredLogs;
  }

  /**
   * Sets filter for log display
   * 
   * @method setFilter
   * @param {string} filterType - Type of filter
   * @param {string|null} value - Filter value
   */
  setFilter(filterType, value) {
    this.filters[filterType] = value;
    this.notifyListeners('filtersChanged', this.filters);
  }

  /**
   * Clears all logs
   * 
   * @method clearLogs
   */
  clearLogs() {
    this.logs = [];
    this.notifyListeners('logsCleared');
  }

  /**
   * Exports logs as JSON
   * 
   * @method exportLogs
   * @returns {string} JSON string of logs
   */
  exportLogs() {
    return JSON.stringify(this.getFilteredLogs(), null, 2);
  }

  /**
   * Adds event listener for log events
   * 
   * @method addEventListener
   * @param {Function} listener - Event listener function
   */
  addEventListener(listener) {
    this.listeners.add(listener);
  }

  /**
   * Removes event listener
   * 
   * @method removeEventListener
   * @param {Function} listener - Event listener function
   */
  removeEventListener(listener) {
    this.listeners.delete(listener);
  }

  /**
   * Notifies all listeners of an event
   * 
   * @method notifyListeners
   * @param {string} eventType - Type of event
   * @param {any} data - Event data
   */
  notifyListeners(eventType, data) {
    this.listeners.forEach(listener => {
      try {
        listener(eventType, data);
      } catch (error) {
        console.error('Error in log listener:', error);
      }
    });
  }

  /**
   * Gets log statistics
   * 
   * @method getStats
   * @returns {Object} Log statistics
   */
  getStats() {
    const stats = {
      total: this.logs.length,
      byLevel: {},
      byModule: {},
      byContext: {}
    };

    this.logs.forEach(log => {
      // Count by level
      stats.byLevel[log.level] = (stats.byLevel[log.level] || 0) + 1;
      
      // Count by module
      stats.byModule[log.module] = (stats.byModule[log.module] || 0) + 1;
      
      // Count by context
      stats.byContext[log.context] = (stats.byContext[log.context] || 0) + 1;
    });

    return stats;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LogCollector };
} else if (typeof window !== 'undefined') {
  window.LogCollector = LogCollector;
}
