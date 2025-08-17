/**
 * @fileoverview Centralized Template Management Service for PromptBoost
 * Provides comprehensive template management including CRUD operations,
 * versioning, validation, testing, and performance tracking.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

/**
 * Template version structure
 * @typedef {Object} TemplateVersion
 * @property {string} id - Version ID
 * @property {number} version - Version number
 * @property {string} content - Template content
 * @property {string} changelog - Version changelog
 * @property {number} createdAt - Creation timestamp
 * @property {string} createdBy - Creator identifier
 */

/**
 * Template structure
 * @typedef {Object} Template
 * @property {string} id - Template ID
 * @property {string} name - Template name
 * @property {string} description - Template description
 * @property {string} category - Template category
 * @property {string} template - Current template content
 * @property {number} version - Current version number
 * @property {Array<TemplateVersion>} versions - Version history
 * @property {boolean} isDefault - Whether template is default
 * @property {boolean} isCustom - Whether template is custom
 * @property {Object} metadata - Additional metadata
 * @property {number} createdAt - Creation timestamp
 * @property {number} updatedAt - Last update timestamp
 */

/**
 * Centralized template management service
 * @class TemplateManager
 */
class TemplateManager {
  static instance = null;

  /**
   * Gets singleton instance of TemplateManager
   * 
   * @static
   * @method getInstance
   * @returns {TemplateManager} Singleton instance
   */
  static getInstance() {
    if (!this.instance) {
      this.instance = new TemplateManager();
    }
    return this.instance;
  }

  /**
   * Creates TemplateManager instance
   * 
   * @constructor
   */
  constructor() {
    if (TemplateManager.instance) {
      return TemplateManager.instance;
    }

    this.logger = new Logger('TemplateManager');
    this.templates = new Map();
    this.defaultTemplates = new Map();
    this.eventListeners = new Map();
    this.isInitialized = false;

    // Initialize versioning and testing systems
    this.versioning = new TemplateVersioning();
    this.tester = new TemplateTester();

    // Initialize default templates
    this.initializeDefaultTemplates();
  }

  /**
   * Initializes the template manager
   * 
   * @method initialize
   * @returns {Promise<void>}
   */
  async initialize() {
    if (this.isInitialized) return;

    try {
      this.logger.startTiming('initialize');

      await this.loadTemplatesFromStorage();
      await this.migrateTemplatesIfNeeded();

      this.isInitialized = true;
      this.emit('initialized');

      this.logger.endTiming('initialize');
      this.logger.info('TemplateManager initialized successfully');
    } catch (error) {
      ErrorHandler.handle(error, 'TemplateManager.initialize');
      throw error;
    }
  }

  /**
   * Initializes default templates
   * 
   * @method initializeDefaultTemplates
   */
  initializeDefaultTemplates() {
    const defaults = {
      general: {
        id: 'general',
        name: 'General Improvement',
        description: 'Improve text while maintaining original meaning and tone',
        category: 'general',
        template: 'Please improve and optimize the following text while maintaining its original meaning and tone:\n\n{text}',
        version: 1,
        isDefault: true,
        isCustom: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      professional: {
        id: 'professional',
        name: 'Professional Tone',
        description: 'Make text more professional and formal',
        category: 'tone',
        template: 'Please rewrite the following text to make it more professional and formal:\n\n{text}',
        version: 1,
        isDefault: true,
        isCustom: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      casual: {
        id: 'casual',
        name: 'Casual Tone',
        description: 'Make text more casual and friendly',
        category: 'tone',
        template: 'Please rewrite the following text to make it more casual and friendly:\n\n{text}',
        version: 1,
        isDefault: true,
        isCustom: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      grammar: {
        id: 'grammar',
        name: 'Grammar Check',
        description: 'Fix grammar and spelling errors',
        category: 'correction',
        template: 'Please fix any grammar and spelling errors in the following text:\n\n{text}',
        version: 1,
        isDefault: true,
        isCustom: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      },
      summarize: {
        id: 'summarize',
        name: 'Summarize',
        description: 'Create a concise summary of the text',
        category: 'transformation',
        template: 'Please create a concise summary of the following text:\n\n{text}',
        version: 1,
        isDefault: true,
        isCustom: false,
        createdAt: Date.now(),
        updatedAt: Date.now()
      }
    };

    Object.values(defaults).forEach(template => {
      this.defaultTemplates.set(template.id, template);
    });
  }

  /**
   * Loads templates from storage
   * 
   * @method loadTemplatesFromStorage
   * @returns {Promise<void>}
   */
  async loadTemplatesFromStorage() {
    try {
      const result = await chrome.storage.sync.get(['templates']);
      const storedTemplates = result.templates || {};

      // Load default templates first
      this.defaultTemplates.forEach(template => {
        this.templates.set(template.id, { ...template });
      });

      // Load custom templates, overriding defaults if they exist
      Object.values(storedTemplates).forEach(template => {
        this.templates.set(template.id, template);
      });

      this.logger.info(`Loaded ${this.templates.size} templates`);
    } catch (error) {
      ErrorHandler.handle(error, 'TemplateManager.loadTemplatesFromStorage');
      throw error;
    }
  }

  /**
   * Saves templates to storage
   * 
   * @method saveTemplatesToStorage
   * @returns {Promise<void>}
   */
  async saveTemplatesToStorage() {
    try {
      const customTemplates = {};

      this.templates.forEach(template => {
        if (template.isCustom) {
          customTemplates[template.id] = template;
        }
      });

      await chrome.storage.sync.set({ templates: customTemplates });
      this.logger.debug(`Saved ${Object.keys(customTemplates).length} custom templates`);
    } catch (error) {
      ErrorHandler.handle(error, 'TemplateManager.saveTemplatesToStorage');
      throw error;
    }
  }

  /**
   * Creates a new template
   * 
   * @method createTemplate
   * @param {Object} templateData - Template data
   * @returns {Promise<Template>} Created template
   */
  async createTemplate(templateData) {
    try {
      // Validate template data
      const validation = ConfigValidator.validateTemplate(templateData);
      if (!validation.isValid) {
        throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
      }

      const template = {
        id: templateData.id || `custom_${Date.now()}`,
        name: validation.sanitized.name,
        description: validation.sanitized.description || '',
        category: validation.sanitized.category || 'custom',
        template: validation.sanitized.template,
        version: 1,
        versions: [{
          id: `v1_${Date.now()}`,
          version: 1,
          content: validation.sanitized.template,
          changelog: 'Initial version',
          createdAt: Date.now(),
          createdBy: 'user'
        }],
        isDefault: false,
        isCustom: true,
        metadata: {
          usage: 0,
          lastUsed: null,
          performance: {
            averageResponseTime: 0,
            successRate: 100
          }
        },
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      this.templates.set(template.id, template);
      await this.saveTemplatesToStorage();

      this.emit('templateCreated', template);
      this.logger.info(`Created template: ${template.name}`);

      return template;
    } catch (error) {
      ErrorHandler.handle(error, 'TemplateManager.createTemplate');
      throw error;
    }
  }

  /**
   * Updates an existing template
   * 
   * @method updateTemplate
   * @param {string} templateId - Template ID
   * @param {Object} updates - Template updates
   * @returns {Promise<Template>} Updated template
   */
  async updateTemplate(templateId, updates) {
    try {
      const existingTemplate = this.templates.get(templateId);
      if (!existingTemplate) {
        throw new Error(`Template not found: ${templateId}`);
      }

      if (existingTemplate.isDefault && !updates.allowDefaultUpdate) {
        throw new Error('Cannot update default template');
      }

      // Validate updates
      const validation = ConfigValidator.validateTemplate({ ...existingTemplate, ...updates });
      if (!validation.isValid) {
        throw new Error(`Template validation failed: ${validation.errors.join(', ')}`);
      }

      // Create new version if template content changed
      let newVersion = existingTemplate.version;
      const versions = [...(existingTemplate.versions || [])];

      if (updates.template && updates.template !== existingTemplate.template) {
        newVersion = existingTemplate.version + 1;
        versions.push({
          id: `v${newVersion}_${Date.now()}`,
          version: newVersion,
          content: validation.sanitized.template,
          changelog: updates.changelog || 'Template updated',
          createdAt: Date.now(),
          createdBy: 'user'
        });
      }

      const updatedTemplate = {
        ...existingTemplate,
        ...validation.sanitized,
        version: newVersion,
        versions,
        updatedAt: Date.now()
      };

      this.templates.set(templateId, updatedTemplate);
      await this.saveTemplatesToStorage();

      this.emit('templateUpdated', updatedTemplate);
      this.logger.info(`Updated template: ${updatedTemplate.name}`);

      return updatedTemplate;
    } catch (error) {
      ErrorHandler.handle(error, 'TemplateManager.updateTemplate');
      throw error;
    }
  }

  /**
   * Deletes a template
   * 
   * @method deleteTemplate
   * @param {string} templateId - Template ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteTemplate(templateId) {
    try {
      const template = this.templates.get(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      if (template.isDefault) {
        throw new Error('Cannot delete default template');
      }

      this.templates.delete(templateId);
      await this.saveTemplatesToStorage();

      this.emit('templateDeleted', { id: templateId, template });
      this.logger.info(`Deleted template: ${template.name}`);

      return true;
    } catch (error) {
      ErrorHandler.handle(error, 'TemplateManager.deleteTemplate');
      throw error;
    }
  }

  /**
   * Gets a template by ID
   * 
   * @method getTemplate
   * @param {string} templateId - Template ID
   * @returns {Template|null} Template or null if not found
   */
  getTemplate(templateId) {
    return this.templates.get(templateId) || null;
  }

  /**
   * Gets all templates
   * 
   * @method getAllTemplates
   * @param {Object} [filters={}] - Filter options
   * @returns {Array<Template>} Array of templates
   */
  getAllTemplates(filters = {}) {
    let templates = Array.from(this.templates.values());

    if (filters.category) {
      templates = templates.filter(t => t.category === filters.category);
    }

    if (filters.isCustom !== undefined) {
      templates = templates.filter(t => t.isCustom === filters.isCustom);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      templates = templates.filter(t =>
        t.name.toLowerCase().includes(searchTerm) ||
        t.description.toLowerCase().includes(searchTerm) ||
        t.template.toLowerCase().includes(searchTerm)
      );
    }

    // Sort by usage, then by name
    templates.sort((a, b) => {
      const usageA = a.metadata?.usage || 0;
      const usageB = b.metadata?.usage || 0;

      if (usageA !== usageB) {
        return usageB - usageA; // Most used first
      }

      return a.name.localeCompare(b.name);
    });

    return templates;
  }

  /**
   * Migrates templates if needed
   * 
   * @method migrateTemplatesIfNeeded
   * @returns {Promise<void>}
   */
  async migrateTemplatesIfNeeded() {
    // Check if migration is needed
    const migrationVersion = await this.getMigrationVersion();
    const currentVersion = 2; // Current template schema version

    if (migrationVersion >= currentVersion) {
      return; // No migration needed
    }

    this.logger.info(`Migrating templates from version ${migrationVersion} to ${currentVersion}`);

    // Perform migration
    this.templates.forEach(template => {
      if (!template.versions) {
        template.versions = [{
          id: `v1_${Date.now()}`,
          version: 1,
          content: template.template,
          changelog: 'Initial version',
          createdAt: template.createdAt || Date.now(),
          createdBy: 'migration'
        }];
      }

      if (!template.metadata) {
        template.metadata = {
          usage: 0,
          lastUsed: null,
          performance: {
            averageResponseTime: 0,
            successRate: 100
          }
        };
      }
    });

    await this.saveTemplatesToStorage();
    await this.setMigrationVersion(currentVersion);

    this.logger.info('Template migration completed');
  }

  /**
   * Gets migration version
   * 
   * @method getMigrationVersion
   * @returns {Promise<number>} Migration version
   */
  async getMigrationVersion() {
    try {
      const result = await chrome.storage.local.get(['templateMigrationVersion']);
      return result.templateMigrationVersion || 1;
    } catch (error) {
      return 1;
    }
  }

  /**
   * Sets migration version
   * 
   * @method setMigrationVersion
   * @param {number} version - Migration version
   * @returns {Promise<void>}
   */
  async setMigrationVersion(version) {
    try {
      await chrome.storage.local.set({ templateMigrationVersion: version });
    } catch (error) {
      this.logger.warn('Failed to set migration version:', error);
    }
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

  /**
   * Tests a template with the testing framework
   *
   * @method testTemplate
   * @param {string} templateId - Template ID to test
   * @param {Object} [options={}] - Test options
   * @returns {Promise<Object>} Test results
   */
  async testTemplate(templateId, options = {}) {
    try {
      const template = this.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      this.logger.info(`Testing template: ${template.name}`);
      const results = await this.tester.runTests(template, options);

      // Update template metadata with test results
      if (!template.metadata) template.metadata = {};
      template.metadata.lastTestResults = {
        score: results.overallScore,
        passed: results.passed,
        testDate: Date.now()
      };

      this.emit('templateTested', { template, results });
      return results;
    } catch (error) {
      ErrorHandler.handle(error, 'TemplateManager.testTemplate');
      throw error;
    }
  }

  /**
   * Gets version history for a template
   *
   * @method getTemplateVersionHistory
   * @param {string} templateId - Template ID
   * @param {Object} [options={}] - Query options
   * @returns {Array<TemplateVersion>} Version history
   */
  getTemplateVersionHistory(templateId, options = {}) {
    try {
      const template = this.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      return this.versioning.getVersionHistory(template, options);
    } catch (error) {
      ErrorHandler.handle(error, 'TemplateManager.getTemplateVersionHistory');
      return [];
    }
  }

  /**
   * Rolls back template to a specific version
   *
   * @method rollbackTemplate
   * @param {string} templateId - Template ID
   * @param {number|string} versionIdentifier - Version to rollback to
   * @param {string} [changelog] - Rollback changelog
   * @returns {Promise<Template>} Updated template
   */
  async rollbackTemplate(templateId, versionIdentifier, changelog = '') {
    try {
      const template = this.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      const updatedTemplate = this.versioning.rollbackToVersion(template, versionIdentifier, changelog);

      // Update in storage
      this.templates.set(templateId, updatedTemplate);
      await this.saveTemplatesToStorage();

      this.emit('templateRolledBack', { template: updatedTemplate, versionIdentifier });
      this.logger.info(`Rolled back template ${template.name} to version ${versionIdentifier}`);

      return updatedTemplate;
    } catch (error) {
      ErrorHandler.handle(error, 'TemplateManager.rollbackTemplate');
      throw error;
    }
  }

  /**
   * Compares two template versions
   *
   * @method compareTemplateVersions
   * @param {string} templateId - Template ID
   * @param {number|string} version1 - First version identifier
   * @param {number|string} version2 - Second version identifier
   * @returns {Object} Comparison result
   */
  compareTemplateVersions(templateId, version1, version2) {
    try {
      const template = this.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      const v1 = this.versioning.getVersion(template, version1);
      const v2 = this.versioning.getVersion(template, version2);

      if (!v1 || !v2) {
        throw new Error('One or both versions not found');
      }

      return this.versioning.compareVersions(v1, v2);
    } catch (error) {
      ErrorHandler.handle(error, 'TemplateManager.compareTemplateVersions');
      return { error: error.message };
    }
  }

  /**
   * Gets template statistics including version and usage data
   *
   * @method getTemplateStatistics
   * @param {string} templateId - Template ID
   * @returns {Object} Template statistics
   */
  getTemplateStatistics(templateId) {
    try {
      const template = this.getTemplate(templateId);
      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      const versionStats = this.versioning.getVersionStatistics(template);
      const usageStats = {
        totalUsage: template.metadata?.usage || 0,
        lastUsed: template.metadata?.lastUsed,
        averageResponseTime: template.metadata?.performance?.averageResponseTime || 0,
        successRate: template.metadata?.performance?.successRate || 100,
        lastTestScore: template.metadata?.lastTestResults?.score || null,
        lastTestDate: template.metadata?.lastTestResults?.testDate || null
      };

      return {
        template: {
          id: template.id,
          name: template.name,
          category: template.category,
          isDefault: template.isDefault,
          isCustom: template.isCustom,
          createdAt: template.createdAt,
          updatedAt: template.updatedAt
        },
        versions: versionStats,
        usage: usageStats
      };
    } catch (error) {
      ErrorHandler.handle(error, 'TemplateManager.getTemplateStatistics');
      return { error: error.message };
    }
  }

  /**
   * Records template usage for analytics
   *
   * @method recordTemplateUsage
   * @param {string} templateId - Template ID
   * @param {Object} [metrics={}] - Usage metrics
   * @returns {Promise<void>}
   */
  async recordTemplateUsage(templateId, metrics = {}) {
    try {
      const template = this.getTemplate(templateId);
      if (!template) {
        return; // Silently ignore missing templates
      }

      if (!template.metadata) template.metadata = {};
      if (!template.metadata.performance) template.metadata.performance = {};

      // Update usage count
      template.metadata.usage = (template.metadata.usage || 0) + 1;
      template.metadata.lastUsed = Date.now();

      // Update performance metrics if provided
      if (metrics.responseTime) {
        const currentAvg = template.metadata.performance.averageResponseTime || 0;
        const currentCount = template.metadata.usage - 1;
        template.metadata.performance.averageResponseTime =
          (currentAvg * currentCount + metrics.responseTime) / template.metadata.usage;
      }

      if (metrics.success !== undefined) {
        const currentRate = template.metadata.performance.successRate || 100;
        const currentCount = template.metadata.usage - 1;
        const successValue = metrics.success ? 100 : 0;
        template.metadata.performance.successRate =
          (currentRate * currentCount + successValue) / template.metadata.usage;
      }

      // Save updated template
      this.templates.set(templateId, template);
      await this.saveTemplatesToStorage();

      this.logger.debug(`Recorded usage for template: ${template.name}`);
    } catch (error) {
      this.logger.warn('Failed to record template usage:', error);
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TemplateManager };
} else if (typeof window !== 'undefined') {
  window.TemplateManager = TemplateManager;
}
