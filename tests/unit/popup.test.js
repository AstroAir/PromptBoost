/**
 * Unit tests for PromptBoostPopup class
 * Tests UI interactions, settings toggle, and API testing functionality
 */

// Import test data and utilities
import { sampleSettings } from '../fixtures/test-data.js';

// Mock the popup script
const mockPopupScript = `
class PromptBoostPopup {
  constructor() {
    this.settings = {};
    this.elements = {};
    this.init();
  }

  async init() {
    this.initializeElements();
    await this.loadSettings();
    this.setupEventListeners();
    this.updateUI();
  }

  initializeElements() {
    // Mock DOM elements
    this.elements = {
      extensionToggle: document.getElementById('extensionToggle') || this.createElement('input', { type: 'checkbox', id: 'extensionToggle' }),
      statusText: document.getElementById('statusText') || this.createElement('div', { id: 'statusText' }),
      providerInfo: document.getElementById('providerInfo') || this.createElement('div', { id: 'providerInfo' }),
      openOptions: document.getElementById('openOptions') || this.createElement('button', { id: 'openOptions' }),
      testConnection: document.getElementById('testConnection') || this.createElement('button', { id: 'testConnection' }),
      helpLink: document.getElementById('helpLink') || this.createElement('a', { id: 'helpLink' }),
      feedbackLink: document.getElementById('feedbackLink') || this.createElement('a', { id: 'feedbackLink' })
    };

    // Add elements to DOM if not present
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
    const result = await chrome.storage.sync.get({
      enabled: true,
      provider: 'openai',
      apiKey: '',
      model: 'gpt-3.5-turbo'
    });
    this.settings = result;
  }

  setupEventListeners() {
    this.elements.extensionToggle.addEventListener('change', () => this.toggleExtension());
    this.elements.openOptions.addEventListener('click', () => this.openOptionsPage());
    this.elements.testConnection.addEventListener('click', () => this.testConnection());
    this.elements.helpLink.addEventListener('click', () => this.openHelp());
    this.elements.feedbackLink.addEventListener('click', () => this.openFeedback());

    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'API_TEST_RESULT') {
        this.handleTestResult(message);
      }
    });
  }

  updateUI() {
    this.elements.extensionToggle.checked = this.settings.enabled;
    this.updateStatus();
    this.updateProviderInfo();
  }

  updateStatus(message = null, type = 'default') {
    if (message) {
      this.elements.statusText.textContent = message;
      this.elements.statusText.className = \`status \${type}\`;
    } else {
      const status = this.settings.enabled ? 'Active' : 'Disabled';
      const hasApiKey = this.settings.apiKey && this.settings.apiKey.length > 0;
      const statusType = this.settings.enabled && hasApiKey ? 'active' : 'inactive';
      
      this.elements.statusText.textContent = status;
      this.elements.statusText.className = \`status \${statusType}\`;
    }
  }

  updateProviderInfo() {
    const provider = this.settings.provider || 'openai';
    const model = this.settings.model || 'gpt-3.5-turbo';
    const hasApiKey = this.settings.apiKey && this.settings.apiKey.length > 0;
    
    this.elements.providerInfo.innerHTML = \`
      <div class="provider-name">\${provider.toUpperCase()}</div>
      <div class="model-name">\${model}</div>
      <div class="api-status">\${hasApiKey ? 'API Key Configured' : 'No API Key'}</div>
    \`;
  }

  async toggleExtension() {
    const enabled = this.elements.extensionToggle.checked;

    try {
      await chrome.storage.sync.set({ enabled });
      this.settings.enabled = enabled;

      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            type: 'TOGGLE_EXTENSION',
            enabled: enabled
          }).catch(() => { });
        });
      });

      this.updateStatus();
    } catch (error) {
      console.error('Failed to toggle extension:', error);
      this.elements.extensionToggle.checked = !enabled;
      this.updateStatus('Failed to update settings', 'error');
    }
  }

  openOptionsPage() {
    chrome.runtime.openOptionsPage();
    window.close();
  }

  testConnection() {
    this.elements.testConnection.disabled = true;
    this.elements.testConnection.textContent = 'Testing...';

    chrome.runtime.sendMessage({
      type: 'TEST_API',
      settings: this.settings
    });
  }

  handleTestResult(message) {
    this.elements.testConnection.disabled = false;
    this.elements.testConnection.textContent = 'Test API';

    if (message.success) {
      this.updateStatus('API test successful', 'active');
      setTimeout(() => this.updateStatus(), 3000);
    } else {
      this.updateStatus(\`Test failed: \${message.error}\`, 'error');
      setTimeout(() => this.updateStatus(), 5000);
    }
  }

  openHelp() {
    chrome.tabs.create({
      url: 'https://github.com/your-repo/promptboost#usage'
    });
    window.close();
  }

  openFeedback() {
    chrome.tabs.create({
      url: 'https://github.com/your-repo/promptboost/issues'
    });
    window.close();
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PromptBoostPopup;
}
`;

// Evaluate the mock script
eval(mockPopupScript);

describe('PromptBoostPopup', () => {
  let popup;

  beforeEach(async () => {
    // Reset DOM
    document.body.innerHTML = '';

    // Reset Chrome API mocks
    global.chromeTestUtils.resetMocks();
    global.chromeTestUtils.setStorageData(sampleSettings.default);

    // Mock window.close
    global.window.close = jest.fn();

    // Create fresh instance
    popup = new PromptBoostPopup();
    await popup.init();
  });

  describe('Initialization', () => {
    test('should initialize elements', () => {
      expect(popup.elements.extensionToggle).toBeTruthy();
      expect(popup.elements.statusText).toBeTruthy();
      expect(popup.elements.providerInfo).toBeTruthy();
      expect(popup.elements.openOptions).toBeTruthy();
      expect(popup.elements.testConnection).toBeTruthy();
    });

    test('should load settings from storage', () => {
      expect(popup.settings).toEqual(expect.objectContaining(sampleSettings.default));
    });

    test('should update UI with loaded settings', () => {
      expect(popup.elements.extensionToggle.checked).toBe(sampleSettings.default.enabled);
      expect(popup.elements.statusText.textContent).toContain('Active');
    });
  });

  describe('UI Updates', () => {
    test('should update status for enabled extension with API key', () => {
      popup.settings = { enabled: true, apiKey: 'test-key' };

      popup.updateStatus();

      expect(popup.elements.statusText.textContent).toBe('Active');
      expect(popup.elements.statusText.className).toContain('active');
    });

    test('should update status for disabled extension', () => {
      popup.settings = { enabled: false, apiKey: 'test-key' };

      popup.updateStatus();

      expect(popup.elements.statusText.textContent).toBe('Disabled');
      expect(popup.elements.statusText.className).toContain('inactive');
    });

    test('should update status with custom message', () => {
      popup.updateStatus('Custom message', 'error');

      expect(popup.elements.statusText.textContent).toBe('Custom message');
      expect(popup.elements.statusText.className).toContain('error');
    });

    test('should update provider info', () => {
      popup.settings = {
        provider: 'openai',
        model: 'gpt-4',
        apiKey: 'test-key'
      };

      popup.updateProviderInfo();

      expect(popup.elements.providerInfo.innerHTML).toContain('OPENAI');
      expect(popup.elements.providerInfo.innerHTML).toContain('gpt-4');
      expect(popup.elements.providerInfo.innerHTML).toContain('API Key Configured');
    });

    test('should show no API key status', () => {
      popup.settings = {
        provider: 'openai',
        model: 'gpt-3.5-turbo',
        apiKey: ''
      };

      popup.updateProviderInfo();

      expect(popup.elements.providerInfo.innerHTML).toContain('No API Key');
    });
  });

  describe('Extension Toggle', () => {
    test('should toggle extension on', async () => {
      popup.elements.extensionToggle.checked = true;

      await popup.toggleExtension();

      expect(chrome.storage.sync.set).toHaveBeenCalledWith({ enabled: true });
      expect(popup.settings.enabled).toBe(true);
      expect(chrome.tabs.query).toHaveBeenCalled();
    });

    test('should toggle extension off', async () => {
      popup.elements.extensionToggle.checked = false;

      await popup.toggleExtension();

      expect(chrome.storage.sync.set).toHaveBeenCalledWith({ enabled: false });
      expect(popup.settings.enabled).toBe(false);
    });

    test('should handle toggle error', async () => {
      popup.elements.extensionToggle.checked = true;
      chrome.storage.sync.set.mockRejectedValueOnce(new Error('Storage error'));

      await popup.toggleExtension();

      expect(popup.elements.extensionToggle.checked).toBe(false);
      expect(popup.elements.statusText.textContent).toContain('Failed to update settings');
    });

    test('should send message to all tabs on toggle', async () => {
      const mockTabs = [{ id: 1 }, { id: 2 }];
      chrome.tabs.query.mockImplementationOnce((query, callback) => {
        callback(mockTabs);
      });

      popup.elements.extensionToggle.checked = true;
      await popup.toggleExtension();

      expect(chrome.tabs.sendMessage).toHaveBeenCalledTimes(2);
      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
        1,
        expect.objectContaining({
          type: 'TOGGLE_EXTENSION',
          enabled: true
        })
      );
    });
  });

  describe('Navigation', () => {
    test('should open options page', () => {
      popup.openOptionsPage();

      expect(chrome.runtime.openOptionsPage).toHaveBeenCalled();
      expect(window.close).toHaveBeenCalled();
    });

    test('should open help page', () => {
      popup.openHelp();

      expect(chrome.tabs.create).toHaveBeenCalledWith({
        url: 'https://github.com/your-repo/promptboost#usage'
      });
      expect(window.close).toHaveBeenCalled();
    });

    test('should open feedback page', () => {
      popup.openFeedback();

      expect(chrome.tabs.create).toHaveBeenCalledWith({
        url: 'https://github.com/your-repo/promptboost/issues'
      });
      expect(window.close).toHaveBeenCalled();
    });
  });

  describe('API Testing', () => {
    test('should initiate API test', () => {
      popup.testConnection();

      expect(popup.elements.testConnection.disabled).toBe(true);
      expect(popup.elements.testConnection.textContent).toBe('Testing...');
      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith({
        type: 'TEST_API',
        settings: popup.settings
      });
    });

    test('should handle successful API test result', () => {
      popup.testConnection();

      const message = { success: true, result: 'Test successful' };
      popup.handleTestResult(message);

      expect(popup.elements.testConnection.disabled).toBe(false);
      expect(popup.elements.testConnection.textContent).toBe('Test API');
      expect(popup.elements.statusText.textContent).toContain('API test successful');
    });

    test('should handle failed API test result', () => {
      popup.testConnection();

      const message = { success: false, error: 'Invalid API key' };
      popup.handleTestResult(message);

      expect(popup.elements.testConnection.disabled).toBe(false);
      expect(popup.elements.statusText.textContent).toContain('Test failed: Invalid API key');
    });

    test('should reset status after successful test', () => {
      jest.useFakeTimers();

      const message = { success: true };
      popup.handleTestResult(message);

      expect(popup.elements.statusText.textContent).toContain('API test successful');

      jest.advanceTimersByTime(3000);

      // Status should be reset (updateStatus called without parameters)
      expect(popup.elements.statusText.textContent).not.toContain('API test successful');

      jest.useRealTimers();
    });

    test('should reset status after failed test', () => {
      jest.useFakeTimers();

      const message = { success: false, error: 'Test error' };
      popup.handleTestResult(message);

      expect(popup.elements.statusText.textContent).toContain('Test failed');

      jest.advanceTimersByTime(5000);

      // Status should be reset
      expect(popup.elements.statusText.textContent).not.toContain('Test failed');

      jest.useRealTimers();
    });
  });

  describe('Event Listeners', () => {
    test('should handle extension toggle click', async () => {
      const toggleSpy = jest.spyOn(popup, 'toggleExtension');

      popup.elements.extensionToggle.dispatchEvent(new Event('change'));

      expect(toggleSpy).toHaveBeenCalled();
    });

    test('should handle options button click', () => {
      const openOptionsSpy = jest.spyOn(popup, 'openOptionsPage');

      popup.elements.openOptions.dispatchEvent(new Event('click'));

      expect(openOptionsSpy).toHaveBeenCalled();
    });

    test('should handle test connection button click', () => {
      const testConnectionSpy = jest.spyOn(popup, 'testConnection');

      popup.elements.testConnection.dispatchEvent(new Event('click'));

      expect(testConnectionSpy).toHaveBeenCalled();
    });

    test('should handle API test result message', () => {
      const handleTestResultSpy = jest.spyOn(popup, 'handleTestResult');
      const message = { type: 'API_TEST_RESULT', success: true };

      const messageListener = chrome.runtime.onMessage.addListener.mock.calls[0][0];
      messageListener(message);

      expect(handleTestResultSpy).toHaveBeenCalledWith(message);
    });
  });
});
