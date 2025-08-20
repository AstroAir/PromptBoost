/**
 * @fileoverview Centralized Configuration Management Service for PromptBoost
 * Provides comprehensive settings management including per-page configuration,
 * validation, migration, and synchronization across extension components.
 *
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

// Note: Configuration constants and schema are loaded via importScripts in background.js

/**
 * Configuration structure
 * @typedef {Object} Configuration
 * @property {boolean} enabled - Whether extension is enabled
 * @property {string} provider - Selected AI provider
 * @property {string} apiKey - API key for the provider
 * @property {string} apiEndpoint - API endpoint URL
 * @property {string} model - Selected model
 * @property {string} promptTemplate - Default prompt template
 * @property {string} keyboardShortcut - Keyboard shortcut
 * @property {boolean} quickTemplateSelection - Quick template selection enabled
 * @property {string} selectedTemplate - Currently selected template
 * @property {number} timeWindow - Time window for triple spacebar
 * @property {Object} advanced - Advanced settings
 * @property {Object} perPage - Per-page configurations
 */

/**
 * Centralized configuration management service
 * @class ConfigurationManager
 */
class ConfigurationManager {
  static instance = null;

  /**
   * Gets singleton instance of ConfigurationManager
   * 
   * @static
   * @method getInstance
   * @returns {ConfigurationManager} Singleton instance
   */
  static getInstance() {
    if (!this.instance) {
      this.instance = new ConfigurationManager();
    }
    return this.instance;
  }

  /**
   * Creates ConfigurationManager instance
   * 
   * @constructor
   */
  constructor() {
    if (ConfigurationManager.instance) {
      return ConfigurationManager.instance;
    }

    this.logger = new Logger('ConfigurationManager');
    this.eventListeners = new Map();
    this.isInitialized = false;
    this.currentConfig = null;
    this.perPageConfigs = new Map();

    // Get event bus if available
    if (typeof EventBus !== 'undefined') {
      this.eventBus = EventBus.getInstance();
    }

    // Use centralized default configuration
    this.defaultConfig = getDefaultConfig();
  }

  /**
   * Initializes the configuration manager
   * 
   * @method initialize
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      this.logger.startTiming('initialize');

      await this.loadConfiguration();
      await this.migrateConfigurationIfNeeded();

      this.isInitialized = true;
      this.emit('initialized');

      this.logger.endTiming('initialize');
      this.logger.info('ConfigurationManager initialized successfully');
    } catch (error) {
      ErrorHandler.handle(error, 'ConfigurationManager.initialize');
      throw error;
    }
  }

  /**
   * Loads configuration from storage
   * 
   * @method loadConfiguration
   * @returns {Promise<void>}
   */
  async loadConfiguration() {
    try {
      const result = await chrome.storage.sync.get([
        STORAGE_KEYS.SETTINGS,
        STORAGE_KEYS.PER_PAGE_SETTINGS,
        STORAGE_KEYS.CONFIG_VERSION
      ]);

      // Load main configuration
      this.currentConfig = {
        ...this.defaultConfig,
        ...result[STORAGE_KEYS.SETTINGS]
      };

      // Load per-page configurations
      if (result[STORAGE_KEYS.PER_PAGE_SETTINGS]) {
        Object.entries(result[STORAGE_KEYS.PER_PAGE_SETTINGS]).forEach(([domain, config]) => {
          this.perPageConfigs.set(domain, config);
        });
      }

      this.logger.info(`Loaded configuration for ${this.perPageConfigs.size} domains`);
    } catch (error) {
      ErrorHandler.handle(error, 'ConfigurationManager.loadConfiguration');
      // Use default configuration on error
      this.currentConfig = { ...this.defaultConfig };
    }
  }

  /**
   * Saves configuration to storage
   * 
   * @method saveConfiguration
   * @returns {Promise<void>}
   */
  async saveConfiguration() {
    try {
      const perPageSettings = {};
      this.perPageConfigs.forEach((config, domain) => {
        perPageSettings[domain] = config;
      });

      await chrome.storage.sync.set({
        [STORAGE_KEYS.SETTINGS]: this.currentConfig,
        [STORAGE_KEYS.PER_PAGE_SETTINGS]: perPageSettings,
        [STORAGE_KEYS.CONFIG_VERSION]: CONFIG_VERSION
      });

      this.emit('configurationSaved', this.currentConfig);
      if (this.eventBus) {
        this.eventBus.emit('configuration.saved', this.currentConfig);
      }
      this.logger.debug('Configuration saved successfully');
    } catch (error) {
      ErrorHandler.handle(error, 'ConfigurationManager.saveConfiguration');
      throw error;
    }
  }

  /**
   * Gets current configuration
   * 
   * @method getConfiguration
   * @param {string} [domain] - Domain for per-page configuration
   * @returns {Configuration} Current configuration
   */
  getConfiguration(domain = null) {
    if (domain && this.perPageConfigs.has(domain)) {
      // Merge global config with per-page config
      return {
        ...this.currentConfig,
        ...this.perPageConfigs.get(domain)
      };
    }

    return { ...this.currentConfig };
  }

  /**
   * Updates configuration
   * 
   * @method updateConfiguration
   * @param {Object} updates - Configuration updates
   * @param {string} [domain] - Domain for per-page configuration
   * @returns {Promise<Configuration>} Updated configuration
   */
  async updateConfiguration(updates, domain = null) {
    try {
      // Validate updates
      const validation = this.validateConfiguration(updates);
      if (!validation.isValid) {
        throw new Error(`Configuration validation failed: ${validation.errors.join(', ')}`);
      }

      if (domain) {
        // Update per-page configuration
        const existingPageConfig = this.perPageConfigs.get(domain) || {};
        const updatedPageConfig = {
          ...existingPageConfig,
          ...validation.sanitized,
          updatedAt: Date.now()
        };

        this.perPageConfigs.set(domain, updatedPageConfig);
        this.logger.info(`Updated per-page configuration for domain: ${domain}`);
      } else {
        // Update global configuration
        this.currentConfig = {
          ...this.currentConfig,
          ...validation.sanitized,
          updatedAt: Date.now()
        };
        this.logger.info('Updated global configuration');
      }

      await this.saveConfiguration();

      const finalConfig = this.getConfiguration(domain);
      this.emit('configurationUpdated', { config: finalConfig, domain });
      if (this.eventBus) {
        this.eventBus.emit('configuration.updated', { config: finalConfig, domain });
      }

      return finalConfig;
    } catch (error) {
      ErrorHandler.handle(error, 'ConfigurationManager.updateConfiguration');
      throw error;
    }
  }

  /**
   * Resets configuration to defaults
   * 
   * @method resetConfiguration
   * @param {string} [domain] - Domain for per-page configuration
   * @returns {Promise<Configuration>} Reset configuration
   */
  async resetConfiguration(domain = null) {
    try {
      if (domain) {
        this.perPageConfigs.delete(domain);
        this.logger.info(`Reset per-page configuration for domain: ${domain}`);
      } else {
        this.currentConfig = { ...this.defaultConfig };
        this.logger.info('Reset global configuration to defaults');
      }

      await this.saveConfiguration();

      const finalConfig = this.getConfiguration(domain);
      this.emit('configurationReset', { config: finalConfig, domain });

      return finalConfig;
    } catch (error) {
      ErrorHandler.handle(error, 'ConfigurationManager.resetConfiguration');
      throw error;
    }
  }

  /**
   * Validates configuration object
   * 
   * @method validateConfiguration
   * @param {Object} config - Configuration to validate
   * @returns {Object} Validation result
   */
  validateConfiguration(config) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitized: {}
    };

    // Validate provider configuration if present
    if (config.provider || config.apiKey || config.apiEndpoint || config.model) {
      const providerConfig = {
        provider: config.provider || this.currentConfig.provider,
        apiKey: config.apiKey || this.currentConfig.apiKey,
        apiEndpoint: config.apiEndpoint || this.currentConfig.apiEndpoint,
        model: config.model || this.currentConfig.model
      };

      const providerValidation = ConfigValidator.validateProviderConfig(providerConfig);
      result.errors.push(...providerValidation.errors);
      result.warnings.push(...providerValidation.warnings);

      if (!providerValidation.isValid) {
        result.isValid = false;
      } else {
        Object.assign(result.sanitized, providerValidation.sanitized);
      }
    }

    // Validate template if present
    if (config.promptTemplate) {
      const templateValidation = ConfigValidator.validateTemplate({
        name: 'Custom Template',
        template: config.promptTemplate
      });

      if (!templateValidation.isValid) {
        result.errors.push(...templateValidation.errors);
        result.isValid = false;
      } else {
        result.sanitized.promptTemplate = templateValidation.sanitized.template;
      }
    }

    // Validate numeric settings
    const numericSettings = {
      timeWindow: { min: 100, max: 5000, default: 1000 },
      requestTimeout: { min: 5, max: 300, default: 30 },
      retryAttempts: { min: 0, max: 10, default: 3 },
      maxHistoryItems: { min: 10, max: 1000, default: 100 },
      notificationDuration: { min: 1, max: 30, default: 4 },
      maxTokens: { min: 1, max: 8000, default: 1000 },
      temperature: { min: 0, max: 2, default: 0.7 }
    };

    Object.entries(numericSettings).forEach(([key, constraints]) => {
      if (config[key] !== undefined || (config.advanced && config.advanced[key] !== undefined)) {
        const value = config[key] !== undefined ? config[key] : config.advanced[key];
        const numValue = Number(value);

        if (isNaN(numValue)) {
          result.errors.push(`${key} must be a number`);
          result.isValid = false;
        } else if (numValue < constraints.min || numValue > constraints.max) {
          result.errors.push(`${key} must be between ${constraints.min} and ${constraints.max}`);
          result.isValid = false;
        } else {
          if (config[key] !== undefined) {
            result.sanitized[key] = numValue;
          } else {
            if (!result.sanitized.advanced) result.sanitized.advanced = {};
            result.sanitized.advanced[key] = numValue;
          }
        }
      }
    });

    // Copy other valid settings
    const validSettings = [
      'enabled', 'provider', 'selectedTemplate', 'keyboardShortcut',
      'quickTemplateSelection'
    ];

    validSettings.forEach(key => {
      if (config[key] !== undefined) {
        result.sanitized[key] = config[key];
      }
    });

    return result;
  }

  /**
   * Migrates configuration if needed
   * 
   * @method migrateConfigurationIfNeeded
   * @returns {Promise<void>}
   */
  async migrateConfigurationIfNeeded() {
    try {
      const result = await chrome.storage.sync.get(['configVersion']);
      const currentVersion = result.configVersion || 1;
      const targetVersion = 2;

      if (currentVersion >= targetVersion) {
        return; // No migration needed
      }

      this.logger.info(`Migrating configuration from version ${currentVersion} to ${targetVersion}`);

      // Perform migration based on version
      if (currentVersion === 1) {
        // Migrate from v1 to v2
        if (!this.currentConfig.advanced) {
          this.currentConfig.advanced = { ...this.defaultConfig.advanced };
        }

        // Move some settings to advanced section
        const advancedSettings = ['enableLogging', 'autoSaveHistory', 'maxHistoryItems',
          'requestTimeout', 'retryAttempts', 'showNotifications',
          'notificationDuration'];

        advancedSettings.forEach(setting => {
          if (this.currentConfig[setting] !== undefined) {
            this.currentConfig.advanced[setting] = this.currentConfig[setting];
            delete this.currentConfig[setting];
          }
        });
      }

      await this.saveConfiguration();
      this.logger.info('Configuration migration completed');
    } catch (error) {
      this.logger.warn('Configuration migration failed:', error);
    }
  }

  /**
   * Gets all per-page configurations
   * 
   * @method getPerPageConfigurations
   * @returns {Map<string, Object>} Per-page configurations
   */
  getPerPageConfigurations() {
    return new Map(this.perPageConfigs);
  }

  /**
   * Deletes per-page configuration
   * 
   * @method deletePerPageConfiguration
   * @param {string} domain - Domain to delete configuration for
   * @returns {Promise<boolean>} Success status
   */
  async deletePerPageConfiguration(domain) {
    try {
      if (this.perPageConfigs.has(domain)) {
        this.perPageConfigs.delete(domain);
        await this.saveConfiguration();

        this.emit('perPageConfigurationDeleted', { domain });
        this.logger.info(`Deleted per-page configuration for domain: ${domain}`);
        return true;
      }
      return false;
    } catch (error) {
      ErrorHandler.handle(error, 'ConfigurationManager.deletePerPageConfiguration');
      throw error;
    }
  }

  /**
   * Exports configuration
   * 
   * @method exportConfiguration
   * @returns {Object} Exportable configuration
   */
  exportConfiguration() {
    const exportData = {
      version: 2,
      timestamp: Date.now(),
      globalConfig: { ...this.currentConfig },
      perPageConfigs: {}
    };

    this.perPageConfigs.forEach((config, domain) => {
      exportData.perPageConfigs[domain] = config;
    });

    // Remove sensitive data
    if (exportData.globalConfig.apiKey) {
      exportData.globalConfig.apiKey = '[REDACTED]';
    }

    Object.values(exportData.perPageConfigs).forEach(config => {
      if (config.apiKey) {
        config.apiKey = '[REDACTED]';
      }
    });

    return exportData;
  }

  /**
   * Adds event listener
   * 
   * @method on
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  on(event, callback) {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event).push(callback);
  }

  /**
   * Removes event listener
   * 
   * @method off
   * @param {string} event - Event name
   * @param {Function} callback - Event callback
   */
  off(event, callback) {
    if (this.eventListeners.has(event)) {
      const listeners = this.eventListeners.get(event);
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Emits event to listeners
   * 
   * @method emit
   * @param {string} event - Event name
   * @param {any} data - Event data
   */
  emit(event, data) {
    if (this.eventListeners.has(event)) {
      this.eventListeners.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          this.logger.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ConfigurationManager };
} else if (typeof window !== 'undefined') {
  window.ConfigurationManager = ConfigurationManager;
}
