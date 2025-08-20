/**
 * @fileoverview Lifecycle Manager for PromptBoost Extension
 * Handles extension installation, updates, and lifecycle events.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

/**
 * Manages extension lifecycle events including installation, updates, and startup.
 * Handles default settings initialization and migration between versions.
 * 
 * @class LifecycleManager
 * @since 2.0.0
 */
class LifecycleManager {
  /**
   * Creates an instance of LifecycleManager.
   * 
   * @constructor
   * @param {Object} dependencies - Injected dependencies
   * @param {Logger} dependencies.logger - Logger instance
   * @param {ConfigurationManager} dependencies.configManager - Configuration manager instance
   * @param {TemplateManager} dependencies.templateManager - Template manager instance
   * @param {EventBus} dependencies.eventBus - Event bus instance
   */
  constructor(dependencies) {
    this.logger = dependencies.logger;
    this.configManager = dependencies.configManager;
    this.templateManager = dependencies.templateManager;
    this.eventBus = dependencies.eventBus;

    this.setupLifecycleListeners();
  }

  /**
   * Sets up extension lifecycle event listeners.
   * 
   * @method setupLifecycleListeners
   * @private
   */
  setupLifecycleListeners() {
    // Handle extension installation and updates
    chrome.runtime.onInstalled.addListener((details) => {
      this.handleInstalled(details);
    });

    // Handle extension startup
    chrome.runtime.onStartup.addListener(() => {
      this.handleStartup();
    });

    // Handle extension suspension (if applicable)
    if (chrome.runtime.onSuspend) {
      chrome.runtime.onSuspend.addListener(() => {
        this.handleSuspend();
      });
    }
  }

  /**
   * Handles extension installation and update events.
   * 
   * @method handleInstalled
   * @param {Object} details - Installation details
   * @param {string} details.reason - Reason for installation (install, update, chrome_update)
   * @param {string} details.previousVersion - Previous version (for updates)
   */
  async handleInstalled(details) {
    try {
      this.logger.info('Extension installed/updated', details);

      switch (details.reason) {
        case 'install':
          await this.handleFirstInstall();
          break;
        case 'update':
          await this.handleUpdate(details.previousVersion);
          break;
        case 'chrome_update':
          await this.handleChromeUpdate();
          break;
        default:
          this.logger.warn('Unknown installation reason:', details.reason);
      }

      // Emit lifecycle event
      this.eventBus.emit('extension.installed', details);

    } catch (error) {
      this.logger.error('Error handling installation:', error);
      ErrorHandler.handle(error, 'LifecycleManager.handleInstalled');
    }
  }

  /**
   * Handles first-time extension installation.
   * 
   * @method handleFirstInstall
   * @private
   */
  async handleFirstInstall() {
    this.logger.info('Performing first-time installation setup');

    try {
      // Initialize configuration manager with default settings
      await this.configManager.initialize();
      
      // Set default templates
      const defaultTemplates = this.getDefaultTemplates();
      await chrome.storage.sync.set({
        [STORAGE_KEYS.TEMPLATES]: defaultTemplates
      });

      // Set installation timestamp
      await chrome.storage.local.set({
        installationDate: Date.now(),
        version: chrome.runtime.getManifest().version
      });

      // Open options page for initial setup
      chrome.runtime.openOptionsPage();
      
      this.logger.info('First-time installation completed successfully');

    } catch (error) {
      this.logger.error('First-time installation failed:', error);
      throw error;
    }
  }

  /**
   * Handles extension updates.
   * 
   * @method handleUpdate
   * @param {string} previousVersion - Previous extension version
   * @private
   */
  async handleUpdate(previousVersion) {
    const currentVersion = chrome.runtime.getManifest().version;
    this.logger.info(`Updating from version ${previousVersion} to ${currentVersion}`);

    try {
      // Perform version-specific migrations
      await this.performMigrations(previousVersion, currentVersion);

      // Update version in storage
      await chrome.storage.local.set({
        version: currentVersion,
        lastUpdateDate: Date.now()
      });

      this.logger.info('Extension update completed successfully');

    } catch (error) {
      this.logger.error('Extension update failed:', error);
      throw error;
    }
  }

  /**
   * Handles Chrome browser updates.
   * 
   * @method handleChromeUpdate
   * @private
   */
  async handleChromeUpdate() {
    this.logger.info('Chrome browser was updated');

    try {
      // Verify extension compatibility
      await this.verifyCompatibility();

      // Refresh any cached data if needed
      await this.refreshCachedData();

    } catch (error) {
      this.logger.error('Chrome update handling failed:', error);
      throw error;
    }
  }

  /**
   * Handles extension startup.
   * 
   * @method handleStartup
   */
  async handleStartup() {
    try {
      this.logger.info('Extension starting up');

      // Initialize services
      await this.initializeServices();

      // Emit startup event
      this.eventBus.emit('extension.startup');

      this.logger.info('Extension startup completed');

    } catch (error) {
      this.logger.error('Extension startup failed:', error);
      ErrorHandler.handle(error, 'LifecycleManager.handleStartup');
    }
  }

  /**
   * Handles extension suspension.
   * 
   * @method handleSuspend
   */
  handleSuspend() {
    try {
      this.logger.info('Extension suspending');

      // Cleanup resources
      this.cleanup();

      // Emit suspend event
      this.eventBus.emit('extension.suspend');

    } catch (error) {
      this.logger.error('Extension suspend handling failed:', error);
    }
  }

  /**
   * Performs version-specific migrations.
   * 
   * @method performMigrations
   * @param {string} fromVersion - Previous version
   * @param {string} toVersion - Current version
   * @private
   */
  async performMigrations(fromVersion, toVersion) {
    this.logger.info(`Performing migrations from ${fromVersion} to ${toVersion}`);

    // Configuration migrations
    await this.configManager.migrateConfigurationIfNeeded();

    // Template migrations
    await this.templateManager.migrateTemplatesIfNeeded();

    // Version-specific migrations
    if (this.shouldMigrateTo('2.0.0', fromVersion, toVersion)) {
      await this.migrateTo2_0_0();
    }
  }

  /**
   * Checks if migration to a specific version is needed.
   * 
   * @method shouldMigrateTo
   * @param {string} targetVersion - Target version
   * @param {string} fromVersion - Previous version
   * @param {string} toVersion - Current version
   * @returns {boolean} True if migration is needed
   * @private
   */
  shouldMigrateTo(targetVersion, fromVersion, toVersion) {
    return this.compareVersions(fromVersion, targetVersion) < 0 && 
           this.compareVersions(toVersion, targetVersion) >= 0;
  }

  /**
   * Migrates to version 2.0.0.
   * 
   * @method migrateTo2_0_0
   * @private
   */
  async migrateTo2_0_0() {
    this.logger.info('Migrating to version 2.0.0');

    // Migrate old storage keys to new format
    const oldData = await chrome.storage.sync.get(['settings', 'templates']);
    
    if (oldData.settings) {
      // Migrate settings to new configuration format
      await this.configManager.migrateOldSettings(oldData.settings);
    }

    if (oldData.templates) {
      // Migrate templates to new format
      await this.templateManager.migrateOldTemplates(oldData.templates);
    }
  }

  /**
   * Compares two version strings.
   * 
   * @method compareVersions
   * @param {string} version1 - First version
   * @param {string} version2 - Second version
   * @returns {number} -1 if version1 < version2, 0 if equal, 1 if version1 > version2
   * @private
   */
  compareVersions(version1, version2) {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);
    
    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1Part = v1Parts[i] || 0;
      const v2Part = v2Parts[i] || 0;
      
      if (v1Part < v2Part) return -1;
      if (v1Part > v2Part) return 1;
    }
    
    return 0;
  }

  /**
   * Initializes all services.
   * 
   * @method initializeServices
   * @private
   */
  async initializeServices() {
    await this.configManager.initialize();
    await this.templateManager.initialize();
  }

  /**
   * Verifies extension compatibility with current Chrome version.
   * 
   * @method verifyCompatibility
   * @private
   */
  async verifyCompatibility() {
    // Check manifest version compatibility
    const manifest = chrome.runtime.getManifest();
    if (manifest.manifest_version < 3) {
      this.logger.warn('Extension using older manifest version');
    }
  }

  /**
   * Refreshes cached data.
   * 
   * @method refreshCachedData
   * @private
   */
  async refreshCachedData() {
    // Clear any cached provider data
    await chrome.storage.local.remove([STORAGE_KEYS.PROVIDER_CACHE]);
  }

  /**
   * Cleans up resources before suspension.
   * 
   * @method cleanup
   * @private
   */
  cleanup() {
    // Clear any timers or intervals
    // Close any open connections
    // Save any pending data
  }

  /**
   * Gets default templates for first-time installation.
   * 
   * @method getDefaultTemplates
   * @returns {Object} Default templates object
   * @private
   */
  getDefaultTemplates() {
    return {
      'general': {
        id: 'general',
        name: 'General Improvement',
        category: TEMPLATE_CATEGORIES.GENERAL,
        description: 'Improve text while maintaining meaning and tone',
        template: 'Please improve and optimize the following text while maintaining its original meaning and tone:\n\n{text}',
        isBuiltIn: true,
        isActive: true,
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      'professional': {
        id: 'professional',
        name: 'Professional Writing',
        category: TEMPLATE_CATEGORIES.BUSINESS,
        description: 'Make text more professional and business-appropriate',
        template: 'Please rewrite the following text to make it more professional and suitable for business communication:\n\n{text}',
        isBuiltIn: true,
        isActive: true,
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      'concise': {
        id: 'concise',
        name: 'Make Concise',
        category: TEMPLATE_CATEGORIES.GENERAL,
        description: 'Make text more concise while preserving key information',
        template: 'Please make the following text more concise while preserving all key information:\n\n{text}',
        isBuiltIn: true,
        isActive: true,
        version: '1.0.0',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
    };
  }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LifecycleManager;
} else {
  window.LifecycleManager = LifecycleManager;
}
