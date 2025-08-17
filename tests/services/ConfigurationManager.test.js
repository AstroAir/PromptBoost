/**
 * @fileoverview Test suite for ConfigurationManager service
 * Tests the centralized configuration management functionality including
 * settings management, per-page configuration, validation, and migration.
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
    }
  }
};

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
  createError: jest.fn((message, category, metadata) => new Error(message))
};

global.ConfigValidator = {
  validateProviderConfig: jest.fn().mockReturnValue({
    isValid: true,
    errors: [],
    warnings: [],
    sanitized: {}
  }),
  validateTemplate: jest.fn().mockReturnValue({
    isValid: true,
    errors: [],
    warnings: [],
    sanitized: { template: 'Valid template with {text}' }
  })
};

const { ConfigurationManager } = require('../../services/ConfigurationManager.js');

describe('ConfigurationManager', () => {
  let configManager;

  beforeEach(() => {
    jest.clearAllMocks();
    ConfigurationManager.instance = null;
    configManager = ConfigurationManager.getInstance();

    // Mock default storage responses
    chrome.storage.sync.get.mockResolvedValue({
      settings: {
        enabled: true,
        provider: 'openai',
        apiKey: 'sk-test',
        model: 'gpt-3.5-turbo'
      },
      perPageSettings: {},
      configVersion: 2
    });
    chrome.storage.sync.set.mockResolvedValue();
  });

  describe('Singleton Pattern', () => {
    test('should return same instance on multiple calls', () => {
      const instance1 = ConfigurationManager.getInstance();
      const instance2 = ConfigurationManager.getInstance();
      
      expect(instance1).toBe(instance2);
    });

    test('should initialize only once', async () => {
      await configManager.initialize();
      await configManager.initialize(); // Second call
      
      expect(configManager.isInitialized).toBe(true);
    });
  });

  describe('Initialization', () => {
    test('should initialize successfully', async () => {
      await configManager.initialize();
      
      expect(configManager.isInitialized).toBe(true);
      expect(chrome.storage.sync.get).toHaveBeenCalledWith([
        'settings',
        'perPageSettings',
        'configVersion'
      ]);
    });

    test('should use default configuration on storage error', async () => {
      chrome.storage.sync.get.mockRejectedValue(new Error('Storage error'));
      
      await configManager.initialize();
      
      const config = configManager.getConfiguration();
      expect(config.enabled).toBe(true); // Default value
      expect(config.provider).toBe('openai'); // Default value
    });

    test('should merge stored settings with defaults', async () => {
      chrome.storage.sync.get.mockResolvedValue({
        settings: {
          provider: 'anthropic',
          apiKey: 'sk-ant-test'
          // Missing other settings
        }
      });

      await configManager.initialize();
      
      const config = configManager.getConfiguration();
      expect(config.provider).toBe('anthropic'); // From storage
      expect(config.enabled).toBe(true); // From defaults
      expect(config.timeWindow).toBe(1000); // From defaults
    });
  });

  describe('Configuration Management', () => {
    beforeEach(async () => {
      await configManager.initialize();
    });

    describe('getConfiguration', () => {
      test('should return global configuration', () => {
        const config = configManager.getConfiguration();
        
        expect(config).toBeDefined();
        expect(config.enabled).toBe(true);
        expect(config.provider).toBe('openai');
      });

      test('should return per-page configuration when available', () => {
        // Set up per-page config
        configManager.perPageConfigs.set('example.com', {
          provider: 'anthropic',
          model: 'claude-3-sonnet'
        });

        const config = configManager.getConfiguration('example.com');
        
        expect(config.provider).toBe('anthropic'); // From per-page
        expect(config.model).toBe('claude-3-sonnet'); // From per-page
        expect(config.enabled).toBe(true); // From global
      });

      test('should return global config for unknown domain', () => {
        const config = configManager.getConfiguration('unknown.com');
        
        expect(config.provider).toBe('openai'); // From global
      });
    });

    describe('updateConfiguration', () => {
      test('should update global configuration', async () => {
        const updates = {
          provider: 'anthropic',
          model: 'claude-3-sonnet',
          temperature: 0.8
        };

        const result = await configManager.updateConfiguration(updates);

        expect(result.provider).toBe('anthropic');
        expect(result.model).toBe('claude-3-sonnet');
        expect(chrome.storage.sync.set).toHaveBeenCalled();
      });

      test('should update per-page configuration', async () => {
        const updates = {
          provider: 'cohere',
          model: 'command'
        };

        const result = await configManager.updateConfiguration(updates, 'example.com');

        expect(result.provider).toBe('cohere');
        expect(configManager.perPageConfigs.get('example.com')).toBeDefined();
        expect(chrome.storage.sync.set).toHaveBeenCalled();
      });

      test('should validate configuration before updating', async () => {
        ConfigValidator.validateProviderConfig.mockReturnValue({
          isValid: false,
          errors: ['Invalid API key'],
          warnings: []
        });

        const updates = { apiKey: 'invalid' };

        await expect(configManager.updateConfiguration(updates))
          .rejects.toThrow('Configuration validation failed: Invalid API key');
      });

      test('should emit configuration updated event', async () => {
        const eventListener = jest.fn();
        configManager.on('configurationUpdated', eventListener);

        const updates = { provider: 'anthropic' };
        await configManager.updateConfiguration(updates);

        expect(eventListener).toHaveBeenCalledWith({
          config: expect.objectContaining({ provider: 'anthropic' }),
          domain: null
        });
      });
    });

    describe('resetConfiguration', () => {
      test('should reset global configuration to defaults', async () => {
        // First update config
        await configManager.updateConfiguration({ provider: 'anthropic' });
        
        // Then reset
        const result = await configManager.resetConfiguration();

        expect(result.provider).toBe('openai'); // Default value
        expect(chrome.storage.sync.set).toHaveBeenCalled();
      });

      test('should reset per-page configuration', async () => {
        // Set per-page config
        await configManager.updateConfiguration({ provider: 'anthropic' }, 'example.com');
        
        // Reset per-page config
        const result = await configManager.resetConfiguration('example.com');

        expect(result.provider).toBe('openai'); // Global default
        expect(configManager.perPageConfigs.has('example.com')).toBe(false);
      });

      test('should emit configuration reset event', async () => {
        const eventListener = jest.fn();
        configManager.on('configurationReset', eventListener);

        await configManager.resetConfiguration();

        expect(eventListener).toHaveBeenCalledWith({
          config: expect.any(Object),
          domain: null
        });
      });
    });
  });

  describe('Configuration Validation', () => {
    beforeEach(async () => {
      await configManager.initialize();
    });

    test('should validate provider configuration', () => {
      const config = {
        provider: 'openai',
        apiKey: 'sk-test',
        model: 'gpt-3.5-turbo'
      };

      const result = configManager.validateConfiguration(config);

      expect(ConfigValidator.validateProviderConfig).toHaveBeenCalledWith({
        provider: 'openai',
        apiKey: 'sk-test',
        apiEndpoint: 'https://api.openai.com/v1/chat/completions', // From current config
        model: 'gpt-3.5-turbo'
      });
      expect(result.isValid).toBe(true);
    });

    test('should validate template configuration', () => {
      const config = {
        promptTemplate: 'Improve this text: {text}'
      };

      const result = configManager.validateConfiguration(config);

      expect(ConfigValidator.validateTemplate).toHaveBeenCalledWith({
        name: 'Custom Template',
        template: 'Improve this text: {text}'
      });
      expect(result.isValid).toBe(true);
    });

    test('should validate numeric parameters', () => {
      const config = {
        timeWindow: 500,
        advanced: {
          maxTokens: 2000,
          temperature: 1.5
        }
      };

      const result = configManager.validateConfiguration(config);

      expect(result.isValid).toBe(true);
      expect(result.sanitized.timeWindow).toBe(500);
      expect(result.sanitized.advanced.maxTokens).toBe(2000);
      expect(result.sanitized.advanced.temperature).toBe(1.5);
    });

    test('should reject invalid numeric parameters', () => {
      const config = {
        timeWindow: 50, // Too low
        advanced: {
          temperature: 3.0 // Too high
        }
      };

      const result = configManager.validateConfiguration(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('timeWindow must be between 100 and 5000');
      expect(result.errors).toContain('temperature must be between 0 and 2');
    });
  });

  describe('Per-Page Configuration', () => {
    beforeEach(async () => {
      await configManager.initialize();
    });

    test('should get all per-page configurations', () => {
      configManager.perPageConfigs.set('example.com', { provider: 'anthropic' });
      configManager.perPageConfigs.set('test.com', { provider: 'cohere' });

      const perPageConfigs = configManager.getPerPageConfigurations();

      expect(perPageConfigs.size).toBe(2);
      expect(perPageConfigs.get('example.com')).toEqual({ provider: 'anthropic' });
      expect(perPageConfigs.get('test.com')).toEqual({ provider: 'cohere' });
    });

    test('should delete per-page configuration', async () => {
      configManager.perPageConfigs.set('example.com', { provider: 'anthropic' });

      const result = await configManager.deletePerPageConfiguration('example.com');

      expect(result).toBe(true);
      expect(configManager.perPageConfigs.has('example.com')).toBe(false);
      expect(chrome.storage.sync.set).toHaveBeenCalled();
    });

    test('should return false when deleting non-existent per-page config', async () => {
      const result = await configManager.deletePerPageConfiguration('non-existent.com');

      expect(result).toBe(false);
    });
  });

  describe('Configuration Export', () => {
    beforeEach(async () => {
      await configManager.initialize();
    });

    test('should export configuration', () => {
      configManager.perPageConfigs.set('example.com', { 
        provider: 'anthropic',
        apiKey: 'sk-ant-secret'
      });

      const exported = configManager.exportConfiguration();

      expect(exported.version).toBe(2);
      expect(exported.timestamp).toBeDefined();
      expect(exported.globalConfig).toBeDefined();
      expect(exported.perPageConfigs['example.com']).toBeDefined();
      
      // Check that sensitive data is redacted
      expect(exported.globalConfig.apiKey).toBe('[REDACTED]');
      expect(exported.perPageConfigs['example.com'].apiKey).toBe('[REDACTED]');
    });
  });

  describe('Configuration Migration', () => {
    test('should migrate from v1 to v2', async () => {
      chrome.storage.sync.get.mockResolvedValue({
        settings: {
          enabled: true,
          provider: 'openai',
          // v1 settings mixed with advanced settings
          enableLogging: true,
          maxHistoryItems: 50,
          requestTimeout: 60
        },
        configVersion: 1
      });

      await configManager.initialize();

      // Check that advanced settings were moved
      const config = configManager.getConfiguration();
      expect(config.advanced.enableLogging).toBe(true);
      expect(config.advanced.maxHistoryItems).toBe(50);
      expect(config.advanced.requestTimeout).toBe(60);
      
      // Check that main settings remain
      expect(config.enabled).toBe(true);
      expect(config.provider).toBe('openai');
    });

    test('should handle migration errors gracefully', async () => {
      chrome.storage.sync.get.mockResolvedValue({
        settings: { enabled: true },
        configVersion: 1
      });

      // Mock storage error during migration
      chrome.storage.sync.set.mockRejectedValue(new Error('Storage error'));

      // Should not throw
      await expect(configManager.initialize()).resolves.not.toThrow();
    });
  });

  describe('Event System', () => {
    beforeEach(async () => {
      await configManager.initialize();
    });

    test('should add and remove event listeners', () => {
      const listener1 = jest.fn();
      const listener2 = jest.fn();

      configManager.on('test', listener1);
      configManager.on('test', listener2);
      configManager.off('test', listener1);

      configManager.emit('test', 'data');

      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledWith('data');
    });

    test('should handle listener errors gracefully', () => {
      const faultyListener = jest.fn().mockImplementation(() => {
        throw new Error('Listener error');
      });

      configManager.on('test', faultyListener);

      // Should not throw
      expect(() => configManager.emit('test', 'data')).not.toThrow();
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await configManager.initialize();
    });

    test('should handle storage errors during save', async () => {
      chrome.storage.sync.set.mockRejectedValue(new Error('Storage quota exceeded'));

      await expect(configManager.updateConfiguration({ provider: 'anthropic' }))
        .rejects.toThrow('Storage quota exceeded');
      expect(ErrorHandler.handle).toHaveBeenCalled();
    });

    test('should handle validation errors', async () => {
      ConfigValidator.validateProviderConfig.mockReturnValue({
        isValid: false,
        errors: ['Invalid configuration'],
        warnings: []
      });

      await expect(configManager.updateConfiguration({ provider: 'invalid' }))
        .rejects.toThrow('Configuration validation failed: Invalid configuration');
    });
  });
});
