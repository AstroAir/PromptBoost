/**
 * @fileoverview Event Bus for PromptBoost
 * Provides centralized event management for component communication.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

/**
 * Event types used throughout the application
 * @enum {string}
 */
const EventTypes = {
  // Configuration events
  CONFIGURATION_UPDATED: 'configuration.updated',
  CONFIGURATION_LOADED: 'configuration.loaded',
  CONFIGURATION_RESET: 'configuration.reset',

  // Template events
  TEMPLATE_CREATED: 'template.created',
  TEMPLATE_UPDATED: 'template.updated',
  TEMPLATE_DELETED: 'template.deleted',
  TEMPLATE_TESTED: 'template.tested',

  // Provider events
  PROVIDER_REGISTERED: 'provider.registered',
  PROVIDER_AUTHENTICATED: 'provider.authenticated',
  PROVIDER_ERROR: 'provider.error',

  // Optimization events
  OPTIMIZATION_STARTED: 'optimization.started',
  OPTIMIZATION_COMPLETED: 'optimization.completed',
  OPTIMIZATION_FAILED: 'optimization.failed',

  // UI events
  UI_THEME_CHANGED: 'ui.theme.changed',
  UI_LANGUAGE_CHANGED: 'ui.language.changed',
  UI_NOTIFICATION: 'ui.notification',

  // System events
  EXTENSION_ENABLED: 'extension.enabled',
  EXTENSION_DISABLED: 'extension.disabled',
  EXTENSION_INSTALLED: 'extension.installed',
  EXTENSION_UPDATED: 'extension.updated'
};

/**
 * Centralized event bus for application-wide event management.
 * Provides type-safe event handling with support for namespaces and wildcards.
 * 
 * @class EventBus
 * @since 2.0.0
 */
class EventBus {
  static instance = null;

  /**
   * Gets singleton instance of EventBus
   * 
   * @static
   * @method getInstance
   * @returns {EventBus} Singleton instance
   */
  static getInstance() {
    if (!this.instance) {
      this.instance = new EventBus();
    }
    return this.instance;
  }

  /**
   * Creates EventBus instance
   * 
   * @constructor
   */
  constructor() {
    if (EventBus.instance) {
      return EventBus.instance;
    }

    this.listeners = new Map();
    this.onceListeners = new Map();
    this.namespaces = new Map();
    this.eventHistory = [];
    this.maxHistorySize = 100;

    EventBus.instance = this;
  }

  /**
   * Adds an event listener
   * 
   * @method on
   * @param {string} event - Event name or pattern
   * @param {Function} listener - Event listener function
   * @param {Object} [options={}] - Listener options
   * @param {string} [options.namespace] - Namespace for the listener
   * @param {number} [options.priority=0] - Listener priority (higher = earlier)
   * @returns {Function} Unsubscribe function
   */
  on(event, listener, options = {}) {
    if (typeof listener !== 'function') {
      throw new Error('Listener must be a function');
    }

    const { namespace, priority = 0 } = options;
    const listenerInfo = {
      listener,
      namespace,
      priority,
      id: this.generateListenerId()
    };

    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    const eventListeners = this.listeners.get(event);
    eventListeners.push(listenerInfo);
    
    // Sort by priority (higher priority first)
    eventListeners.sort((a, b) => b.priority - a.priority);

    // Track namespace
    if (namespace) {
      if (!this.namespaces.has(namespace)) {
        this.namespaces.set(namespace, new Set());
      }
      this.namespaces.get(namespace).add({ event, id: listenerInfo.id });
    }

    // Return unsubscribe function
    return () => this.off(event, listener);
  }

  /**
   * Adds a one-time event listener
   * 
   * @method once
   * @param {string} event - Event name
   * @param {Function} listener - Event listener function
   * @param {Object} [options={}] - Listener options
   * @returns {Promise} Promise that resolves when event is emitted
   */
  once(event, listener, options = {}) {
    return new Promise((resolve) => {
      const onceListener = (...args) => {
        this.off(event, onceListener);
        if (listener) {
          listener(...args);
        }
        resolve(args);
      };

      this.on(event, onceListener, options);
    });
  }

  /**
   * Removes an event listener
   * 
   * @method off
   * @param {string} event - Event name
   * @param {Function} [listener] - Specific listener to remove (optional)
   */
  off(event, listener) {
    const eventListeners = this.listeners.get(event);
    if (!eventListeners) return;

    if (listener) {
      const index = eventListeners.findIndex(info => info.listener === listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    } else {
      // Remove all listeners for this event
      this.listeners.delete(event);
    }

    // Clean up empty listener arrays
    if (eventListeners && eventListeners.length === 0) {
      this.listeners.delete(event);
    }
  }

  /**
   * Removes all listeners for a namespace
   * 
   * @method offNamespace
   * @param {string} namespace - Namespace to remove
   */
  offNamespace(namespace) {
    const namespaceListeners = this.namespaces.get(namespace);
    if (!namespaceListeners) return;

    for (const { event, id } of namespaceListeners) {
      const eventListeners = this.listeners.get(event);
      if (eventListeners) {
        const index = eventListeners.findIndex(info => info.id === id);
        if (index > -1) {
          eventListeners.splice(index, 1);
        }
      }
    }

    this.namespaces.delete(namespace);
  }

  /**
   * Emits an event to all listeners
   * 
   * @method emit
   * @param {string} event - Event name
   * @param {*} data - Event data
   * @param {Object} [options={}] - Emit options
   * @param {boolean} [options.async=false] - Whether to emit asynchronously
   * @returns {Promise<Array>} Array of listener results (if async)
   */
  async emit(event, data, options = {}) {
    const { async = false } = options;
    const eventListeners = this.listeners.get(event) || [];
    const results = [];

    // Add to event history
    this.addToHistory(event, data);

    // Handle wildcard listeners
    const wildcardListeners = this.getWildcardListeners(event);
    const allListeners = [...eventListeners, ...wildcardListeners];

    if (async) {
      // Execute listeners asynchronously
      const promises = allListeners.map(async (listenerInfo) => {
        try {
          return await listenerInfo.listener(data, event);
        } catch (error) {
          console.error(`Error in event listener for '${event}':`, error);
          return { error };
        }
      });

      return await Promise.all(promises);
    } else {
      // Execute listeners synchronously
      for (const listenerInfo of allListeners) {
        try {
          const result = listenerInfo.listener(data, event);
          results.push(result);
        } catch (error) {
          console.error(`Error in event listener for '${event}':`, error);
          results.push({ error });
        }
      }
    }

    return results;
  }

  /**
   * Gets listeners that match wildcard patterns
   * 
   * @method getWildcardListeners
   * @param {string} event - Event name
   * @returns {Array} Matching wildcard listeners
   * @private
   */
  getWildcardListeners(event) {
    const wildcardListeners = [];

    for (const [pattern, listeners] of this.listeners) {
      if (pattern.includes('*') && this.matchesPattern(event, pattern)) {
        wildcardListeners.push(...listeners);
      }
    }

    return wildcardListeners;
  }

  /**
   * Checks if an event matches a wildcard pattern
   * 
   * @method matchesPattern
   * @param {string} event - Event name
   * @param {string} pattern - Wildcard pattern
   * @returns {boolean} True if event matches pattern
   * @private
   */
  matchesPattern(event, pattern) {
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\./g, '\\.') + '$'
    );
    return regex.test(event);
  }

  /**
   * Adds event to history
   * 
   * @method addToHistory
   * @param {string} event - Event name
   * @param {*} data - Event data
   * @private
   */
  addToHistory(event, data) {
    this.eventHistory.push({
      event,
      data,
      timestamp: Date.now()
    });

    // Limit history size
    if (this.eventHistory.length > this.maxHistorySize) {
      this.eventHistory.shift();
    }
  }

  /**
   * Gets event history
   * 
   * @method getHistory
   * @param {string} [eventFilter] - Optional event filter
   * @returns {Array} Event history
   */
  getHistory(eventFilter) {
    if (eventFilter) {
      return this.eventHistory.filter(entry => entry.event === eventFilter);
    }
    return [...this.eventHistory];
  }

  /**
   * Generates unique listener ID
   * 
   * @method generateListenerId
   * @returns {string} Unique ID
   * @private
   */
  generateListenerId() {
    return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Gets all registered events
   * 
   * @method getEvents
   * @returns {Array<string>} Array of event names
   */
  getEvents() {
    return Array.from(this.listeners.keys());
  }

  /**
   * Clears all listeners and history
   * 
   * @method clear
   */
  clear() {
    this.listeners.clear();
    this.onceListeners.clear();
    this.namespaces.clear();
    this.eventHistory = [];
  }
}

// Export event types and bus
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { EventBus, EventTypes };
}
