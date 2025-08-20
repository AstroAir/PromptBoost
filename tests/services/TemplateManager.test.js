/**
 * @fileoverview Test suite for TemplateManager service
 * Tests the centralized template management functionality including
 * CRUD operations, versioning, testing, and analytics.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

// Mock dependencies
global.chrome = {
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn()
    },
    local: {
      get: jest.fn(),
      set: jest.fn()
    }
  }
};

// Mock utilities
global.Logger = jest.fn().mockImplementation(() => ({
  info: jest.fn(),
  debug: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  startTiming: jest.fn(),
  endTiming: jest.fn()
}));

global.ErrorHandler = {
  handle: jest.fn(),
  createError: jest.fn((message, _category, _metadata) => new Error(message))
};

global.ConfigValidator = {
  validateTemplate: jest.fn().mockReturnValue({
    isValid: true,
    errors: [],
    warnings: [],
    sanitized: {
      name: 'Test Template',
      template: 'Test content with {text}',
      description: 'Test description'
    }
  })
};

global.TemplateVersioning = jest.fn().mockImplementation(() => ({
  createVersion: jest.fn(),
  getVersionHistory: jest.fn(),
  rollbackToVersion: jest.fn(),
  compareVersions: jest.fn(),
  getVersionStatistics: jest.fn()
}));

global.TemplateTester = jest.fn().mockImplementation(() => ({
  runTests: jest.fn()
}));

// Import the module under test
const { TemplateManager } = require('../../services/TemplateManager.js');

describe('TemplateManager', () => {
  let templateManager;

  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();

    // Reset singleton instance
    TemplateManager.instance = null;

    // Create fresh instance
    templateManager = TemplateManager.getInstance();

    // Mock storage responses
    chrome.storage.sync.get.mockResolvedValue({ templates: {} });
    chrome.storage.sync.set.mockResolvedValue();
    chrome.storage.local.get.mockResolvedValue({ templateMigrationVersion: 2 });
    chrome.storage.local.set.mockResolvedValue();
  });

  describe('Singleton Pattern', () => {
    test('should return same instance on multiple calls', () => {
      const instance1 = TemplateManager.getInstance();
      const instance2 = TemplateManager.getInstance();

      expect(instance1).toBe(instance2);
    });

    test('should initialize only once', async () => {
      await templateManager.initialize();
      await templateManager.initialize(); // Second call

      expect(templateManager.isInitialized).toBe(true);
    });
  });

  describe('Initialization', () => {
    test('should initialize successfully', async () => {
      await templateManager.initialize();

      expect(templateManager.isInitialized).toBe(true);
      expect(chrome.storage.sync.get).toHaveBeenCalledWith(['templates']);
    });

    test('should load default templates', async () => {
      await templateManager.initialize();

      const templates = templateManager.getAllTemplates();
      expect(templates.length).toBeGreaterThan(0);

      // Check for default templates
      const generalTemplate = templates.find(t => t.id === 'general');
      expect(generalTemplate).toBeDefined();
      expect(generalTemplate.isDefault).toBe(true);
    });

    test('should handle initialization errors', async () => {
      chrome.storage.sync.get.mockRejectedValue(new Error('Storage error'));

      await expect(templateManager.initialize()).rejects.toThrow('Storage error');
      expect(ErrorHandler.handle).toHaveBeenCalled();
    });
  });

  describe('Template CRUD Operations', () => {
    beforeEach(async () => {
      await templateManager.initialize();
    });

    describe('createTemplate', () => {
      test('should create new template successfully', async () => {
        const templateData = {
          name: 'Test Template',
          description: 'Test description',
          template: 'Test content with {text}',
          category: 'test'
        };

        const result = await templateManager.createTemplate(templateData);

        expect(result).toBeDefined();
        expect(result.id).toBeDefined();
        expect(result.name).toBe('Test Template');
        expect(result.isCustom).toBe(true);
        expect(result.version).toBe(1);
        expect(result.versions).toHaveLength(1);
        expect(chrome.storage.sync.set).toHaveBeenCalled();
      });

      test('should validate template before creation', async () => {
        const invalidTemplate = {
          name: '',
          template: 'No placeholder'
        };

        ConfigValidator.validateTemplate.mockReturnValue({
          isValid: false,
          errors: ['Template name is required', 'Template must include {text} placeholder'],
          warnings: []
        });

        await expect(templateManager.createTemplate(invalidTemplate))
          .rejects.toThrow('Template validation failed');
      });

      test('should generate unique ID if not provided', async () => {
        const templateData = {
          name: 'Test Template',
          template: 'Test content with {text}'
        };

        const result = await templateManager.createTemplate(templateData);

        expect(result.id).toMatch(/^custom_\d+$/);
      });
    });

    describe('updateTemplate', () => {
      test('should update existing template', async () => {
        // Create template first
        const templateData = {
          name: 'Original Template',
          template: 'Original content with {text}'
        };
        const created = await templateManager.createTemplate(templateData);

        // Update template
        const updates = {
          name: 'Updated Template',
          template: 'Updated content with {text}',
          changelog: 'Updated for testing'
        };

        const result = await templateManager.updateTemplate(created.id, updates);

        expect(result.name).toBe('Updated Template');
        expect(result.version).toBe(2);
        expect(result.versions).toHaveLength(2);
        expect(result.updatedAt).toBeGreaterThan(created.createdAt);
      });

      test('should not update non-existent template', async () => {
        await expect(templateManager.updateTemplate('non-existent', {}))
          .rejects.toThrow('Template not found: non-existent');
      });

      test('should not update default template without permission', async () => {
        const defaultTemplate = templateManager.getTemplate('general');

        await expect(templateManager.updateTemplate('general', { name: 'Modified' }))
          .rejects.toThrow('Cannot update default template');
      });
    });

    describe('deleteTemplate', () => {
      test('should delete custom template', async () => {
        // Create template first
        const templateData = {
          name: 'To Delete',
          template: 'Content with {text}'
        };
        const created = await templateManager.createTemplate(templateData);

        const result = await templateManager.deleteTemplate(created.id);

        expect(result).toBe(true);
        expect(templateManager.getTemplate(created.id)).toBeNull();
        expect(chrome.storage.sync.set).toHaveBeenCalled();
      });

      test('should not delete default template', async () => {
        await expect(templateManager.deleteTemplate('general'))
          .rejects.toThrow('Cannot delete default template');
      });

      test('should not delete non-existent template', async () => {
        await expect(templateManager.deleteTemplate('non-existent'))
          .rejects.toThrow('Template not found: non-existent');
      });
    });

    describe('getTemplate', () => {
      test('should retrieve existing template', async () => {
        const template = templateManager.getTemplate('general');

        expect(template).toBeDefined();
        expect(template.id).toBe('general');
        expect(template.isDefault).toBe(true);
      });

      test('should return null for non-existent template', () => {
        const template = templateManager.getTemplate('non-existent');

        expect(template).toBeNull();
      });
    });

    describe('getAllTemplates', () => {
      test('should return all templates', async () => {
        const templates = templateManager.getAllTemplates();

        expect(Array.isArray(templates)).toBe(true);
        expect(templates.length).toBeGreaterThan(0);
      });

      test('should filter by category', async () => {
        const toneTemplates = templateManager.getAllTemplates({ category: 'tone' });

        toneTemplates.forEach(template => {
          expect(template.category).toBe('tone');
        });
      });

      test('should filter by custom flag', async () => {
        const customTemplates = templateManager.getAllTemplates({ isCustom: true });

        customTemplates.forEach(template => {
          expect(template.isCustom).toBe(true);
        });
      });

      test('should search templates', async () => {
        const searchResults = templateManager.getAllTemplates({ search: 'professional' });

        expect(searchResults.length).toBeGreaterThan(0);
        searchResults.forEach(template => {
          const searchText = `${template.name} ${template.description} ${template.template}`.toLowerCase();
          expect(searchText).toContain('professional');
        });
      });
    });
  });

  describe('Template Versioning', () => {
    beforeEach(async () => {
      await templateManager.initialize();
    });

    test('should get version history', () => {
      const templateId = 'general';
      const mockHistory = [
        { version: 1, content: 'Original', createdAt: Date.now() - 1000 },
        { version: 2, content: 'Updated', createdAt: Date.now() }
      ];

      templateManager.versioning.getVersionHistory.mockReturnValue(mockHistory);

      const history = templateManager.getTemplateVersionHistory(templateId);

      expect(history).toEqual(mockHistory);
      expect(templateManager.versioning.getVersionHistory).toHaveBeenCalledWith(
        expect.objectContaining({ id: templateId }),
        {}
      );
    });

    test('should rollback template', async () => {
      const templateId = 'general';
      const versionId = 1;
      const changelog = 'Rollback to stable version';

      const mockRolledBack = {
        id: templateId,
        template: 'Original content',
        version: 3,
        updatedAt: Date.now()
      };

      templateManager.versioning.rollbackToVersion.mockReturnValue(mockRolledBack);

      const result = await templateManager.rollbackTemplate(templateId, versionId, changelog);

      expect(result).toEqual(mockRolledBack);
      expect(templateManager.versioning.rollbackToVersion).toHaveBeenCalledWith(
        expect.objectContaining({ id: templateId }),
        versionId,
        changelog
      );
      expect(chrome.storage.sync.set).toHaveBeenCalled();
    });

    test('should compare versions', () => {
      const templateId = 'general';
      const mockComparison = {
        contentChanged: true,
        lengthDiff: 10,
        wordCountDiff: 2,
        timeDiff: 1000
      };

      templateManager.versioning.compareVersions.mockReturnValue(mockComparison);

      const result = templateManager.compareTemplateVersions(templateId, 1, 2);

      expect(result).toEqual(mockComparison);
    });
  });

  describe('Template Testing', () => {
    beforeEach(async () => {
      await templateManager.initialize();
    });

    test('should test template', async () => {
      const templateId = 'general';
      const testOptions = {
        testTypes: ['validation', 'structure'],
        provider: 'openai'
      };

      const mockResults = {
        overallScore: 85,
        passed: true,
        tests: [
          { testName: 'Validation', passed: true, score: 90 },
          { testName: 'Structure', passed: true, score: 80 }
        ]
      };

      templateManager.tester.runTests.mockResolvedValue(mockResults);

      const result = await templateManager.testTemplate(templateId, testOptions);

      expect(result).toEqual(mockResults);
      expect(templateManager.tester.runTests).toHaveBeenCalledWith(
        expect.objectContaining({ id: templateId }),
        testOptions
      );

      // Check that test results are stored in metadata
      const template = templateManager.getTemplate(templateId);
      expect(template.metadata.lastTestResults).toBeDefined();
      expect(template.metadata.lastTestResults.score).toBe(85);
    });

    test('should handle test errors', async () => {
      const templateId = 'general';
      const testError = new Error('Test failed');

      templateManager.tester.runTests.mockRejectedValue(testError);

      await expect(templateManager.testTemplate(templateId))
        .rejects.toThrow('Test failed');
      expect(ErrorHandler.handle).toHaveBeenCalledWith(testError, 'TemplateManager.testTemplate');
    });
  });

  describe('Template Analytics', () => {
    beforeEach(async () => {
      await templateManager.initialize();
    });

    test('should record template usage', async () => {
      const templateId = 'general';
      const metrics = {
        responseTime: 1500,
        success: true
      };

      await templateManager.recordTemplateUsage(templateId, metrics);

      const template = templateManager.getTemplate(templateId);
      expect(template.metadata.usage).toBe(1);
      expect(template.metadata.lastUsed).toBeDefined();
      expect(template.metadata.performance.averageResponseTime).toBe(1500);
      expect(template.metadata.performance.successRate).toBe(100);
    });

    test('should get template statistics', () => {
      const templateId = 'general';
      const mockVersionStats = {
        totalVersions: 2,
        averageContentLength: 150,
        creators: ['user']
      };

      templateManager.versioning.getVersionStatistics.mockReturnValue(mockVersionStats);

      const stats = templateManager.getTemplateStatistics(templateId);

      expect(stats.template.id).toBe(templateId);
      expect(stats.versions).toEqual(mockVersionStats);
      expect(stats.usage).toBeDefined();
    });
  });

  describe('Event System', () => {
    beforeEach(async () => {
      await templateManager.initialize();
    });

    test('should emit events on template operations', async () => {
      const eventListener = jest.fn();
      templateManager.on('templateCreated', eventListener);

      const templateData = {
        name: 'Event Test',
        template: 'Content with {text}'
      };

      await templateManager.createTemplate(templateData);

      expect(eventListener).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Event Test'
        })
      );
    });

    test('should handle event listener errors gracefully', async () => {
      const faultyListener = jest.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });

      templateManager.on('templateCreated', faultyListener);

      const templateData = {
        name: 'Event Test',
        template: 'Content with {text}'
      };

      // Should not throw despite listener error
      await expect(templateManager.createTemplate(templateData)).resolves.toBeDefined();
    });
  });

  describe('Migration', () => {
    test('should migrate templates from v1 to v2', async () => {
      // Mock old template format
      const oldTemplates = {
        'old-template': {
          id: 'old-template',
          name: 'Old Template',
          template: 'Old content',
          createdAt: Date.now()
        }
      };

      chrome.storage.sync.get.mockResolvedValue({ templates: oldTemplates });
      chrome.storage.local.get.mockResolvedValue({ templateMigrationVersion: 1 });

      await templateManager.initialize();

      // Check that migration was performed
      const template = templateManager.getTemplate('old-template');
      expect(template.versions).toBeDefined();
      expect(template.metadata).toBeDefined();
      expect(chrome.storage.local.set).toHaveBeenCalledWith({ templateMigrationVersion: 2 });
    });
  });
});
