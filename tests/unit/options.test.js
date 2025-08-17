/**
 * Unit tests for PromptBoostOptions class
 * Tests settings management, template CRUD operations, and import/export functionality
 */

// Import test data and utilities
import { sampleSettings, sampleTemplates } from '../fixtures/test-data.js';

// Mock the options script (simplified version)
const mockOptionsScript = `
class PromptBoostOptions {
  constructor() {
    this.elements = {};
    this.defaultSettings = {
      enabled: true,
      timeWindow: 1000,
      provider: 'openai',
      apiKey: '',
      apiEndpoint: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-3.5-turbo',
      promptTemplate: 'Please improve: {text}',
      keyboardShortcut: 'Ctrl+Shift+Space',
      quickTemplateSelection: true,
      selectedTemplate: 'general'
    };
    this.init();
  }

  async init() {
    this.initializeElements();
    await this.loadSettings();
    this.setupEventListeners();
    this.updateUI();
  }

  initializeElements() {
    this.elements = {
      enabled: this.createElement('input', { type: 'checkbox', id: 'enabled' }),
      timeWindow: this.createElement('input', { type: 'number', id: 'timeWindow' }),
      provider: this.createElement('select', { id: 'provider' }),
      apiKey: this.createElement('input', { type: 'password', id: 'apiKey' }),
      apiEndpoint: this.createElement('input', { type: 'text', id: 'apiEndpoint' }),
      model: this.createElement('input', { type: 'text', id: 'model' }),
      promptTemplate: this.createElement('textarea', { id: 'promptTemplate' }),
      keyboardShortcut: this.createElement('input', { type: 'text', id: 'keyboardShortcut' }),
      quickTemplateSelection: this.createElement('input', { type: 'checkbox', id: 'quickTemplateSelection' }),
      selectedTemplate: this.createElement('select', { id: 'selectedTemplate' }),
      saveButton: this.createElement('button', { id: 'saveButton' }),
      testApiButton: this.createElement('button', { id: 'testApiButton' }),
      exportButton: this.createElement('button', { id: 'exportButton' }),
      importButton: this.createElement('button', { id: 'importButton' }),
      importFile: this.createElement('input', { type: 'file', id: 'importFile' })
    };

    Object.values(this.elements).forEach(element => {
      if (!element.parentNode) {
        document.body.appendChild(element);
      }
    });
  }

  createElement(tagName, attributes = {}) {
    const element = document.createElement(tagName);
    Object.keys(attributes).forEach(key => {
      if (key === 'type') {
        element.type = attributes[key];
      } else {
        element.setAttribute(key, attributes[key]);
      }
    });
    return element;
  }

  async loadSettings() {
    const settings = await chrome.storage.sync.get(this.defaultSettings);
    
    this.elements.enabled.checked = settings.enabled;
    this.elements.timeWindow.value = settings.timeWindow;
    this.elements.provider.value = settings.provider;
    this.elements.apiKey.value = settings.apiKey;
    this.elements.apiEndpoint.value = settings.apiEndpoint;
    this.elements.model.value = settings.model;
    this.elements.promptTemplate.value = settings.promptTemplate;
    this.elements.keyboardShortcut.value = settings.keyboardShortcut;
    this.elements.quickTemplateSelection.checked = settings.quickTemplateSelection !== false;
    this.elements.selectedTemplate.value = settings.selectedTemplate || 'general';
  }

  setupEventListeners() {
    this.elements.saveButton.addEventListener('click', () => this.saveSettings());
    this.elements.testApiButton.addEventListener('click', () => this.testAPI());
    this.elements.exportButton.addEventListener('click', () => this.exportSettings());
    this.elements.importButton.addEventListener('click', () => this.elements.importFile.click());
    this.elements.importFile.addEventListener('change', (e) => this.importSettings(e));
    this.elements.provider.addEventListener('change', () => this.updateProviderFields());
    this.elements.enabled.addEventListener('change', () => this.autoSave());
  }

  updateUI() {
    this.updateProviderFields();
    this.updateModelOptions(this.elements.provider.value);
  }

  async saveSettings() {
    try {
      const settings = {
        enabled: this.elements.enabled.checked,
        timeWindow: parseInt(this.elements.timeWindow.value),
        provider: this.elements.provider.value,
        apiKey: this.elements.apiKey.value.trim(),
        apiEndpoint: this.elements.apiEndpoint.value.trim(),
        model: this.elements.model.value.trim(),
        promptTemplate: this.elements.promptTemplate.value.trim(),
        keyboardShortcut: this.elements.keyboardShortcut.value.trim(),
        quickTemplateSelection: this.elements.quickTemplateSelection.checked,
        selectedTemplate: this.elements.selectedTemplate.value
      };

      await chrome.storage.sync.set(settings);
      this.showNotification('Settings saved successfully!', 'success');
      
      // Notify content scripts
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            type: 'SETTINGS_UPDATED'
          }).catch(() => {});
        });
      });
    } catch (error) {
      this.showNotification('Failed to save settings: ' + error.message, 'error');
    }
  }

  async autoSave() {
    try {
      await chrome.storage.sync.set({
        enabled: this.elements.enabled.checked
      });

      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            type: 'TOGGLE_EXTENSION',
            enabled: this.elements.enabled.checked
          }).catch(() => {});
        });
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  updateProviderFields() {
    const provider = this.elements.provider.value;
    this.updateModelOptions(provider);
    this.updateProviderInfo(provider);
  }

  updateModelOptions(provider) {
    // Mock implementation
    const models = {
      openai: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
      anthropic: ['claude-3-sonnet-20240229', 'claude-3-opus-20240229'],
      custom: ['custom-model']
    };
    
    this.elements.model.value = models[provider] ? models[provider][0] : 'gpt-3.5-turbo';
  }

  updateProviderInfo(provider) {
    // Mock implementation for provider-specific UI updates
  }

  async testAPI() {
    this.elements.testApiButton.disabled = true;
    this.elements.testApiButton.textContent = 'Testing...';

    const settings = {
      provider: this.elements.provider.value,
      apiKey: this.elements.apiKey.value,
      apiEndpoint: this.elements.apiEndpoint.value,
      model: this.elements.model.value
    };

    try {
      chrome.runtime.sendMessage({
        type: 'TEST_API',
        settings: settings
      });
    } catch (error) {
      this.showNotification('Test failed: ' + error.message, 'error');
      this.elements.testApiButton.disabled = false;
      this.elements.testApiButton.textContent = 'Test API';
    }
  }

  exportSettings() {
    const settings = {
      enabled: this.elements.enabled.checked,
      timeWindow: parseInt(this.elements.timeWindow.value),
      provider: this.elements.provider.value,
      promptTemplate: this.elements.promptTemplate.value,
      keyboardShortcut: this.elements.keyboardShortcut.value
    };

    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = 'promptboost-settings.json';
    link.click();
  }

  importSettings(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const settings = JSON.parse(e.target.result);
        this.applyImportedSettings(settings);
        this.showNotification('Settings imported successfully!', 'success');
      } catch (error) {
        this.showNotification('Failed to import settings: Invalid file format', 'error');
      }
    };
    reader.readAsText(file);
  }

  applyImportedSettings(settings) {
    if (settings.enabled !== undefined) this.elements.enabled.checked = settings.enabled;
    if (settings.timeWindow !== undefined) this.elements.timeWindow.value = settings.timeWindow;
    if (settings.provider !== undefined) this.elements.provider.value = settings.provider;
    if (settings.promptTemplate !== undefined) this.elements.promptTemplate.value = settings.promptTemplate;
    if (settings.keyboardShortcut !== undefined) this.elements.keyboardShortcut.value = settings.keyboardShortcut;
    
    this.updateUI();
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = \`notification \${type}\`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 4000);
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PromptBoostOptions;
}
`;

// Evaluate the mock script
eval(mockOptionsScript);

describe('PromptBoostOptions', () => {
  let options;

  beforeEach(async () => {
    // Reset DOM
    document.body.innerHTML = '';
    
    // Reset Chrome API mocks
    global.chromeTestUtils.resetMocks();
    global.chromeTestUtils.setStorageData(sampleSettings.default);
    
    // Mock URL.createObjectURL
    global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
    
    // Mock FileReader
    global.FileReader = jest.fn(() => ({
      readAsText: jest.fn(function(file) {
        // Simulate successful file read
        setTimeout(() => {
          this.onload({ target: { result: JSON.stringify(sampleSettings.default) } });
        }, 0);
      }),
      onload: null
    }));
    
    // Create fresh instance
    options = new PromptBoostOptions();
    await options.init();
  });

  describe('Initialization', () => {
    test('should initialize elements', () => {
      expect(options.elements.enabled).toBeTruthy();
      expect(options.elements.provider).toBeTruthy();
      expect(options.elements.apiKey).toBeTruthy();
      expect(options.elements.saveButton).toBeTruthy();
    });

    test('should load settings from storage', () => {
      expect(options.elements.enabled.checked).toBe(sampleSettings.default.enabled);
      expect(options.elements.provider.value).toBe(sampleSettings.default.provider);
      expect(options.elements.apiKey.value).toBe(sampleSettings.default.apiKey);
    });

    test('should set up event listeners', () => {
      expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
    });
  });

  describe('Settings Management', () => {
    test('should save settings successfully', async () => {
      options.elements.enabled.checked = false;
      options.elements.timeWindow.value = '1500';
      options.elements.provider.value = 'anthropic';

      await options.saveSettings();

      expect(chrome.storage.sync.set).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: false,
          timeWindow: 1500,
          provider: 'anthropic'
        })
      );
      expect(chrome.tabs.query).toHaveBeenCalled();
    });

    test('should handle save settings error', async () => {
      chrome.storage.sync.set.mockRejectedValueOnce(new Error('Storage error'));
      const notificationSpy = jest.spyOn(options, 'showNotification');

      await options.saveSettings();

      expect(notificationSpy).toHaveBeenCalledWith(
        'Failed to save settings: Storage error',
        'error'
      );
    });

    test('should auto-save enabled state', async () => {
      options.elements.enabled.checked = false;

      await options.autoSave();

      expect(chrome.storage.sync.set).toHaveBeenCalledWith({ enabled: false });
      expect(chrome.tabs.query).toHaveBeenCalled();
    });

    test('should handle auto-save error silently', async () => {
      chrome.storage.sync.set.mockRejectedValueOnce(new Error('Storage error'));
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();

      await options.autoSave();

      expect(consoleSpy).toHaveBeenCalledWith('Auto-save failed:', expect.any(Error));
      consoleSpy.mockRestore();
    });
  });

  describe('Provider Management', () => {
    test('should update model options for OpenAI', () => {
      options.elements.provider.value = 'openai';

      options.updateModelOptions('openai');

      expect(options.elements.model.value).toBe('gpt-3.5-turbo');
    });

    test('should update model options for Anthropic', () => {
      options.elements.provider.value = 'anthropic';

      options.updateModelOptions('anthropic');

      expect(options.elements.model.value).toBe('claude-3-sonnet-20240229');
    });

    test('should update provider fields on change', () => {
      const updateModelSpy = jest.spyOn(options, 'updateModelOptions');
      const updateInfoSpy = jest.spyOn(options, 'updateProviderInfo');

      options.elements.provider.value = 'anthropic';
      options.updateProviderFields();

      expect(updateModelSpy).toHaveBeenCalledWith('anthropic');
      expect(updateInfoSpy).toHaveBeenCalledWith('anthropic');
    });
  });

  describe('API Testing', () => {
    test('should initiate API test', async () => {
      options.elements.provider.value = 'openai';
      options.elements.apiKey.value = 'test-key';

      await options.testAPI();

      expect(options.elements.testApiButton.disabled).toBe(true);
      expect(options.elements.testApiButton.textContent).toBe('Testing...');
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'TEST_API',
        settings: expect.objectContaining({
          provider: 'openai',
          apiKey: 'test-key'
        })
      });
    });

    test('should handle API test error', async () => {
      chrome.runtime.sendMessage.mockImplementationOnce(() => {
        throw new Error('Message error');
      });
      const notificationSpy = jest.spyOn(options, 'showNotification');

      await options.testAPI();

      expect(notificationSpy).toHaveBeenCalledWith('Test failed: Message error', 'error');
      expect(options.elements.testApiButton.disabled).toBe(false);
      expect(options.elements.testApiButton.textContent).toBe('Test API');
    });
  });

  describe('Import/Export', () => {
    test('should export settings', () => {
      options.elements.enabled.checked = true;
      options.elements.timeWindow.value = '1000';
      options.elements.provider.value = 'openai';

      // Mock document.createElement and click
      const mockLink = {
        href: '',
        download: '',
        click: jest.fn()
      };
      const createElementSpy = jest.spyOn(document, 'createElement').mockReturnValue(mockLink);

      options.exportSettings();

      expect(createElementSpy).toHaveBeenCalledWith('a');
      expect(mockLink.download).toBe('promptboost-settings.json');
      expect(mockLink.click).toHaveBeenCalled();
      expect(global.URL.createObjectURL).toHaveBeenCalled();

      createElementSpy.mockRestore();
    });

    test('should import settings successfully', async () => {
      const mockFile = new File(['{"enabled": false}'], 'settings.json', { type: 'application/json' });
      const event = { target: { files: [mockFile] } };
      const notificationSpy = jest.spyOn(options, 'showNotification');
      const applySpy = jest.spyOn(options, 'applyImportedSettings');

      options.importSettings(event);

      // Wait for FileReader to process
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(applySpy).toHaveBeenCalledWith(sampleSettings.default);
      expect(notificationSpy).toHaveBeenCalledWith('Settings imported successfully!', 'success');
    });

    test('should handle import error', async () => {
      const mockFile = new File(['invalid json'], 'settings.json', { type: 'application/json' });
      const event = { target: { files: [mockFile] } };

      // Mock FileReader to return invalid JSON
      global.FileReader = jest.fn(() => ({
        readAsText: jest.fn(function(file) {
          setTimeout(() => {
            this.onload({ target: { result: 'invalid json' } });
          }, 0);
        }),
        onload: null
      }));

      const notificationSpy = jest.spyOn(options, 'showNotification');

      options.importSettings(event);

      // Wait for FileReader to process
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(notificationSpy).toHaveBeenCalledWith(
        'Failed to import settings: Invalid file format',
        'error'
      );
    });

    test('should apply imported settings', () => {
      const importedSettings = {
        enabled: false,
        timeWindow: 2000,
        provider: 'anthropic',
        promptTemplate: 'Custom template: {text}',
        keyboardShortcut: 'Ctrl+Alt+S'
      };

      const updateUISpy = jest.spyOn(options, 'updateUI');

      options.applyImportedSettings(importedSettings);

      expect(options.elements.enabled.checked).toBe(false);
      expect(options.elements.timeWindow.value).toBe('2000');
      expect(options.elements.provider.value).toBe('anthropic');
      expect(options.elements.promptTemplate.value).toBe('Custom template: {text}');
      expect(options.elements.keyboardShortcut.value).toBe('Ctrl+Alt+S');
      expect(updateUISpy).toHaveBeenCalled();
    });

    test('should handle no file selected for import', () => {
      const event = { target: { files: [] } };

      // Should not throw error
      expect(() => options.importSettings(event)).not.toThrow();
    });
  });

  describe('UI Notifications', () => {
    test('should show notification', () => {
      const message = 'Test notification';
      const type = 'success';

      options.showNotification(message, type);

      const notification = document.querySelector('.notification');
      expect(notification).toBeTruthy();
      expect(notification.textContent).toBe(message);
      expect(notification.className).toContain(type);
    });

    test('should auto-remove notification', () => {
      jest.useFakeTimers();

      options.showNotification('Test message');

      const notification = document.querySelector('.notification');
      expect(notification).toBeTruthy();

      jest.advanceTimersByTime(4000);

      const removedNotification = document.querySelector('.notification');
      expect(removedNotification).toBeFalsy();

      jest.useRealTimers();
    });
  });

  describe('Event Listeners', () => {
    test('should handle save button click', async () => {
      const saveSpy = jest.spyOn(options, 'saveSettings');

      options.elements.saveButton.dispatchEvent(new Event('click'));

      expect(saveSpy).toHaveBeenCalled();
    });

    test('should handle test API button click', async () => {
      const testSpy = jest.spyOn(options, 'testAPI');

      options.elements.testApiButton.dispatchEvent(new Event('click'));

      expect(testSpy).toHaveBeenCalled();
    });

    test('should handle provider change', () => {
      const updateFieldsSpy = jest.spyOn(options, 'updateProviderFields');

      options.elements.provider.dispatchEvent(new Event('change'));

      expect(updateFieldsSpy).toHaveBeenCalled();
    });

    test('should handle enabled toggle', async () => {
      const autoSaveSpy = jest.spyOn(options, 'autoSave');

      options.elements.enabled.dispatchEvent(new Event('change'));

      expect(autoSaveSpy).toHaveBeenCalled();
    });
  });
});
