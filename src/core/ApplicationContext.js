/**
 * @fileoverview Application Context for PromptBoost
 * Provides centralized dependency injection and service management.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

/**
 * Centralized application context for dependency injection and service management.
 * Implements the Service Locator pattern with lazy initialization and lifecycle management.
 * 
 * @class ApplicationContext
 * @since 2.0.0
 */
class ApplicationContext {
  static instance = null;

  /**
   * Gets singleton instance of ApplicationContext
   * 
   * @static
   * @method getInstance
   * @returns {ApplicationContext} Singleton instance
   */
  static getInstance() {
    if (!this.instance) {
      this.instance = new ApplicationContext();
    }
    return this.instance;
  }

  /**
   * Creates ApplicationContext instance
   * 
   * @constructor
   */
  constructor() {
    if (ApplicationContext.instance) {
      return ApplicationContext.instance;
    }

    this.services = new Map();
    this.factories = new Map();
    this.singletons = new Map();
    this.isInitialized = false;
    this.eventListeners = new Map();

    ApplicationContext.instance = this;
  }

  /**
   * Initializes the application context and all registered services
   * 
   * @method initialize
   * @returns {Promise<void>}
   * @async
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      // Register core services
      this.registerCoreServices();

      // Initialize services in dependency order
      await this.initializeServices();

      this.isInitialized = true;
      this.emit('initialized');
    } catch (error) {
      console.error('Failed to initialize ApplicationContext:', error);
      throw error;
    }
  }

  /**
   * Registers core services with the context
   * 
   * @method registerCoreServices
   * @private
   */
  registerCoreServices() {
    // Register utility services
    this.registerSingleton('logger', () => new Logger('ApplicationContext'));
    this.registerSingleton('errorHandler', () => ErrorHandler);
    this.registerSingleton('configValidator', () => ConfigValidator);
    this.registerSingleton('apiHelper', () => ApiHelper);

    // Register business services
    this.registerSingleton('templateManager', () => TemplateManager.getInstance());
    this.registerSingleton('configurationManager', () => ConfigurationManager.getInstance());

    // Register provider system
    this.registerSingleton('providerRegistry', () => ProviderRegistry.getInstance());
  }

  /**
   * Registers a singleton service with a factory function
   * 
   * @method registerSingleton
   * @param {string} name - Service name
   * @param {Function} factory - Factory function to create the service
   */
  registerSingleton(name, factory) {
    this.factories.set(name, { factory, singleton: true });
  }

  /**
   * Registers a transient service with a factory function
   * 
   * @method registerTransient
   * @param {string} name - Service name
   * @param {Function} factory - Factory function to create the service
   */
  registerTransient(name, factory) {
    this.factories.set(name, { factory, singleton: false });
  }

  /**
   * Gets a service instance by name
   * 
   * @method getService
   * @param {string} name - Service name
   * @returns {*} Service instance
   * @throws {Error} When service is not registered
   */
  getService(name) {
    const factoryInfo = this.factories.get(name);
    if (!factoryInfo) {
      throw new Error(`Service '${name}' is not registered`);
    }

    if (factoryInfo.singleton) {
      if (!this.singletons.has(name)) {
        const instance = factoryInfo.factory();
        this.singletons.set(name, instance);
      }
      return this.singletons.get(name);
    } else {
      return factoryInfo.factory();
    }
  }

  /**
   * Checks if a service is registered
   * 
   * @method hasService
   * @param {string} name - Service name
   * @returns {boolean} True if service is registered
   */
  hasService(name) {
    return this.factories.has(name);
  }

  /**
   * Initializes all registered services
   * 
   * @method initializeServices
   * @returns {Promise<void>}
   * @private
   * @async
   */
  async initializeServices() {
    const initPromises = [];

    // Initialize services that have an initialize method
    for (const [name] of this.factories) {
      try {
        const service = this.getService(name);
        if (service && typeof service.initialize === 'function') {
          initPromises.push(service.initialize());
        }
      } catch (error) {
        console.warn(`Failed to initialize service '${name}':`, error);
      }
    }

    await Promise.all(initPromises);
  }

  /**
   * Adds an event listener
   * 
   * @method on
   * @param {string} event - Event name
   * @param {Function} listener - Event listener function
   */
  on(event, listener) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(listener);
  }

  /**
   * Removes an event listener
   * 
   * @method off
   * @param {string} event - Event name
   * @param {Function} listener - Event listener function
   */
  off(event, listener) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emits an event to all listeners
   * 
   * @method emit
   * @param {string} event - Event name
   * @param {...*} args - Event arguments
   */
  emit(event, ...args) {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(...args);
        } catch (error) {
          console.error(`Error in event listener for '${event}':`, error);
        }
      });
    }
  }

  /**
   * Disposes of the application context and all services
   * 
   * @method dispose
   * @returns {Promise<void>}
   * @async
   */
  async dispose() {
    // Dispose of services that have a dispose method
    for (const [name, instance] of this.singletons) {
      try {
        if (instance && typeof instance.dispose === 'function') {
          await instance.dispose();
        }
      } catch (error) {
        console.warn(`Failed to dispose service '${name}':`, error);
      }
    }

    this.services.clear();
    this.factories.clear();
    this.singletons.clear();
    this.eventListeners.clear();
    this.isInitialized = false;

    this.emit('disposed');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApplicationContext;
}
