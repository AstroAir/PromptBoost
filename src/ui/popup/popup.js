// PromptBoost Popup Script

class PromptBoostPopup {
  constructor() {
    this.elements = {};
    this.settings = {};
    this.init();
  }

  init() {
    this.bindElements();
    this.setupEventListeners();
    this.loadSettings();
  }

  bindElements() {
    this.elements = {
      statusIndicator: document.getElementById('statusIndicator'),
      statusDot: document.getElementById('statusDot'),
      statusText: document.getElementById('statusText'),
      extensionToggle: document.getElementById('extensionToggle'),
      currentProvider: document.getElementById('currentProvider'),
      currentModel: document.getElementById('currentModel'),
      apiKeyStatus: document.getElementById('apiKeyStatus'),
      openOptions: document.getElementById('openOptions'),
      testConnection: document.getElementById('testConnection'),
      helpLink: document.getElementById('helpLink'),
      feedbackLink: document.getElementById('feedbackLink')
    };
  }

  setupEventListeners() {
    this.elements.extensionToggle.addEventListener('change', () => this.toggleExtension());
    this.elements.openOptions.addEventListener('click', () => this.openOptionsPage());
    this.elements.testConnection.addEventListener('click', () => this.testConnection());
    this.elements.helpLink.addEventListener('click', () => this.openHelp());
    this.elements.feedbackLink.addEventListener('click', () => this.openFeedback());

    // Listen for messages from background script
    chrome.runtime.onMessage.addListener((message) => {
      if (message.type === 'API_TEST_RESULT') {
        this.handleTestResult(message);
      }
    });
  }

  async loadSettings() {
    try {
      const settings = await chrome.storage.sync.get({
        enabled: true,
        provider: 'openai',
        apiKey: '',
        model: 'gpt-3.5-turbo'
      });

      this.settings = settings;
      this.updateUI();
    } catch (error) {
      console.error('Failed to load settings:', error);
      this.updateStatus('Error loading settings', 'error');
    }
  }

  updateUI() {
    // Update toggle state
    this.elements.extensionToggle.checked = this.settings.enabled;

    // Update provider info
    this.elements.currentProvider.textContent = this.getProviderDisplayName(this.settings.provider);
    this.elements.currentModel.textContent = this.settings.model || 'Not set';

    // Update API key status
    if (this.settings.apiKey && this.settings.apiKey.trim()) {
      this.elements.apiKeyStatus.textContent = 'Configured';
      this.elements.apiKeyStatus.className = 'setting-value configured';
    } else {
      this.elements.apiKeyStatus.textContent = 'Not configured';
      this.elements.apiKeyStatus.className = 'setting-value not-configured';
    }

    // Update status
    this.updateStatus();
  }

  updateStatus(message = null, type = 'active') {
    if (message) {
      this.elements.statusText.textContent = message;
    } else if (!this.settings.enabled) {
      this.elements.statusText.textContent = 'Disabled';
      type = 'inactive';
    } else if (!this.settings.apiKey || !this.settings.apiKey.trim()) {
      this.elements.statusText.textContent = 'API key required';
      type = 'error';
    } else {
      this.elements.statusText.textContent = 'Ready';
      type = 'active';
    }

    // Update status dot
    this.elements.statusDot.className = `status-dot ${type}`;
  }

  getProviderDisplayName(provider) {
    switch (provider) {
      case 'openai': return 'OpenAI';
      case 'anthropic': return 'Anthropic';
      case 'custom': return 'Custom';
      default: return provider;
    }
  }

  async toggleExtension() {
    const enabled = this.elements.extensionToggle.checked;

    try {
      await chrome.storage.sync.set({ enabled });
      this.settings.enabled = enabled;

      // Notify all tabs
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            type: 'TOGGLE_EXTENSION',
            enabled: enabled
          }).catch(() => { }); // Ignore errors for tabs without content script
        });
      });

      this.updateStatus();
    } catch (error) {
      console.error('Failed to toggle extension:', error);
      // Revert toggle state
      this.elements.extensionToggle.checked = !enabled;
      this.updateStatus('Failed to update settings', 'error');
    }
  }

  openOptionsPage() {
    chrome.runtime.openOptionsPage();
    window.close();
  }

  async testConnection() {
    if (!this.settings.apiKey || !this.settings.apiKey.trim()) {
      this.updateStatus('API key required', 'error');
      return;
    }

    this.elements.testConnection.disabled = true;
    this.elements.testConnection.textContent = 'Testing...';
    this.updateStatus('Testing API...', 'active');

    try {
      chrome.runtime.sendMessage({
        type: 'TEST_API',
        settings: this.settings
      });

      // Timeout after 30 seconds
      setTimeout(() => {
        this.elements.testConnection.disabled = false;
        this.elements.testConnection.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22,4 12,14.01 9,11.01"></polyline>
          </svg>
          Test API
        `;
        this.updateStatus('Test timed out', 'error');
      }, 30000);

    } catch (error) {
      this.handleTestResult({ success: false, error: error.message });
    }
  }

  handleTestResult(message) {
    this.elements.testConnection.disabled = false;
    this.elements.testConnection.innerHTML = `
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22,4 12,14.01 9,11.01"></polyline>
      </svg>
      Test API
    `;

    if (message.success) {
      this.updateStatus('API test successful', 'active');
      setTimeout(() => this.updateStatus(), 3000);
    } else {
      this.updateStatus(`Test failed: ${message.error}`, 'error');
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

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new PromptBoostPopup();
});
