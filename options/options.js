// PromptBoost Options Page Script

class PromptBoostOptions {
  constructor() {
    this.elements = {};
    this.currentSection = 'overview';
    this.sidebarCollapsed = localStorage.getItem('sidebarCollapsed') === 'true';

    // Pagination state
    this.templatePagination = {
      currentPage: 1,
      itemsPerPage: 10,
      totalItems: 0,
      filteredItems: []
    };

    this.historyPagination = {
      currentPage: 1,
      itemsPerPage: 25,
      totalItems: 0,
      filteredItems: []
    };

    this.defaultSettings = {
      enabled: true,
      timeWindow: 1000,
      provider: 'openai',
      apiKey: '',
      apiEndpoint: 'https://api.openai.com/v1/chat/completions',
      model: 'gpt-3.5-turbo',
      promptTemplate: 'Please improve and optimize the following text while maintaining its original meaning and tone:\n\n{text}',
      keyboardShortcut: 'Ctrl+Shift+Space',
      quickTemplateSelection: true,
      selectedTemplate: 'general',
      // Advanced settings
      enableLogging: false,
      autoSaveHistory: true,
      maxHistoryItems: 100,
      requestTimeout: 30,
      retryAttempts: 3,
      showNotifications: true,
      notificationDuration: 4
    };

    this.init();
  }

  init() {
    this.bindElements();
    this.setupSidebar();
    this.setupNavigation();
    this.setupEventListeners();
    this.loadSettings();
    this.loadTemplates();
    this.loadHistoryStats();
    this.updateDashboard();
    this.updateProviderFields();
    this.setupSearch();
    this.setupAccessibility();

    // Check for first-time users after everything is loaded
    setTimeout(() => this.checkFirstTimeUser(), 500);
  }

  bindElements() {
    this.elements = {
      // Sidebar and navigation
      sidebarToggle: document.getElementById('sidebarToggle'),
      sidebar: document.getElementById('sidebar'),
      mainContent: document.getElementById('mainContent'),
      globalSearch: document.getElementById('globalSearch'),
      breadcrumb: document.getElementById('breadcrumb'),

      // Settings elements
      enabled: document.getElementById('enabled'),
      timeWindow: document.getElementById('timeWindow'),
      provider: document.getElementById('provider'),
      apiKey: document.getElementById('apiKey'),
      apiEndpoint: document.getElementById('apiEndpoint'),
      model: document.getElementById('model'),
      promptTemplate: document.getElementById('promptTemplate'),
      keyboardShortcut: document.getElementById('keyboardShortcut'),

      // Template management
      quickTemplateSelection: document.getElementById('quickTemplateSelection'),
      selectedTemplate: document.getElementById('selectedTemplate'),
      createTemplate: document.getElementById('createTemplate'),
      importTemplates: document.getElementById('importTemplates'),
      exportTemplates: document.getElementById('exportTemplates'),
      templateList: document.getElementById('templateList'),

      // Modal elements
      templateModal: document.getElementById('templateModal'),
      modalTitle: document.getElementById('modalTitle'),
      templateName: document.getElementById('templateName'),
      templateCategory: document.getElementById('templateCategory'),
      templateDescription: document.getElementById('templateDescription'),
      templatePrompt: document.getElementById('templatePrompt'),
      saveTemplate: document.getElementById('saveTemplate'),
      cancelTemplate: document.getElementById('cancelTemplate'),
      closeModal: document.getElementById('closeModal'),
      templateImportFile: document.getElementById('templateImportFile'),

      // History management
      historyStats: document.getElementById('historyStats'),
      totalOptimizations: document.getElementById('totalOptimizations'),
      weekOptimizations: document.getElementById('weekOptimizations'),
      mostUsedTemplate: document.getElementById('mostUsedTemplate'),
      viewHistory: document.getElementById('viewHistory'),
      exportHistory: document.getElementById('exportHistory'),
      clearHistory: document.getElementById('clearHistory'),

      // History modal
      historyModal: document.getElementById('historyModal'),
      closeHistoryModal: document.getElementById('closeHistoryModal'),
      closeHistoryModalBtn: document.getElementById('closeHistoryModalBtn'),
      historySearch: document.getElementById('historySearch'),
      historyFilter: document.getElementById('historyFilter'),
      historyList: document.getElementById('historyList'),

      // Advanced settings
      enableLogging: document.getElementById('enableLogging'),
      autoSaveHistory: document.getElementById('autoSaveHistory'),
      maxHistoryItems: document.getElementById('maxHistoryItems'),
      requestTimeout: document.getElementById('requestTimeout'),
      retryAttempts: document.getElementById('retryAttempts'),
      showNotifications: document.getElementById('showNotifications'),
      notificationDuration: document.getElementById('notificationDuration'),

      // Quick login
      quickLoginSection: document.getElementById('quickLoginSection'),
      quickLogin: document.getElementById('quickLogin'),
      getApiKey: document.getElementById('getApiKey'),

      // Provider info
      providerInfo: document.getElementById('providerInfo'),

      // Dashboard elements
      headerStatus: document.getElementById('headerStatus'),
      dashTotalOptimizations: document.getElementById('dashTotalOptimizations'),
      dashActiveTemplates: document.getElementById('dashActiveTemplates'),
      dashTestApi: document.getElementById('dashTestApi'),
      dashViewHistory: document.getElementById('dashViewHistory'),
      dashCreateTemplate: document.getElementById('dashCreateTemplate'),

      saveSettings: document.getElementById('saveSettings'),
      testApi: document.getElementById('testApi'),
      resetSettings: document.getElementById('resetSettings'),
      toggleApiKey: document.getElementById('toggleApiKey'),
      exportSettings: document.getElementById('exportSettings'),
      importSettings: document.getElementById('importSettings'),
      importFile: document.getElementById('importFile'),

      status: document.getElementById('status'),
      apiEndpointGroup: document.getElementById('apiEndpointGroup'),

      // Template pagination elements
      templateSearch: document.getElementById('templateSearch'),
      templateCategoryFilter: document.getElementById('templateCategoryFilter'),
      templatePagination: document.getElementById('templatePagination'),
      templatePaginationInfo: document.getElementById('templatePaginationInfo'),
      templateItemsPerPage: document.getElementById('templateItemsPerPage'),
      templateFirstPage: document.getElementById('templateFirstPage'),
      templatePrevPage: document.getElementById('templatePrevPage'),
      templatePages: document.getElementById('templatePages'),
      templateNextPage: document.getElementById('templateNextPage'),
      templateLastPage: document.getElementById('templateLastPage'),
      templateGotoPage: document.getElementById('templateGotoPage'),
      templateGotoBtn: document.getElementById('templateGotoBtn'),

      // History pagination elements
      historySearchInput: document.getElementById('historySearchInput'),
      historyTemplateFilter: document.getElementById('historyTemplateFilter'),
      historyDateFilter: document.getElementById('historyDateFilter'),
      historyPagination: document.getElementById('historyPagination'),
      historyPaginationInfo: document.getElementById('historyPaginationInfo'),
      historyItemsPerPage: document.getElementById('historyItemsPerPage'),
      historyFirstPage: document.getElementById('historyFirstPage'),
      historyPrevPage: document.getElementById('historyPrevPage'),
      historyPages: document.getElementById('historyPages'),
      historyNextPage: document.getElementById('historyNextPage'),
      historyLastPage: document.getElementById('historyLastPage'),
      historyGotoPage: document.getElementById('historyGotoPage'),
      historyGotoBtn: document.getElementById('historyGotoBtn'),

      // Footer elements
      saveAllSettings: document.getElementById('saveAllSettings'),
      footerStatus: document.getElementById('footerStatus')
    };
  }

  setupEventListeners() {
    // Sidebar toggle
    this.elements.sidebarToggle.addEventListener('click', () => this.toggleSidebar());

    // Settings events
    this.elements.saveSettings.addEventListener('click', () => this.saveSettings());
    this.elements.testApi.addEventListener('click', () => this.testAPI());
    this.elements.resetSettings.addEventListener('click', () => this.resetSettings());
    this.elements.toggleApiKey.addEventListener('click', () => this.toggleApiKeyVisibility());
    this.elements.exportSettings.addEventListener('click', () => this.exportSettings());
    this.elements.importSettings.addEventListener('click', () => this.elements.importFile.click());
    this.elements.importFile.addEventListener('change', (e) => this.importSettings(e));

    // Template management
    this.elements.createTemplate.addEventListener('click', () => this.openTemplateModal());
    this.elements.importTemplates.addEventListener('click', () => this.elements.templateImportFile.click());
    this.elements.exportTemplates.addEventListener('click', () => this.exportTemplates());
    this.elements.templateImportFile.addEventListener('change', (e) => this.importTemplates(e));

    // Modal events
    this.elements.saveTemplate.addEventListener('click', () => this.saveTemplateFromModal());
    this.elements.cancelTemplate.addEventListener('click', () => this.closeTemplateModal());
    this.elements.closeModal.addEventListener('click', () => this.closeTemplateModal());

    // History management
    this.elements.viewHistory.addEventListener('click', () => this.openHistoryModal());
    this.elements.exportHistory.addEventListener('click', () => this.exportHistory());
    this.elements.clearHistory.addEventListener('click', () => this.clearHistory());
    this.elements.closeHistoryModal.addEventListener('click', () => this.closeHistoryModal());
    this.elements.closeHistoryModalBtn.addEventListener('click', () => this.closeHistoryModal());
    this.elements.historySearch.addEventListener('input', () => this.filterHistory());
    this.elements.historyFilter.addEventListener('change', () => this.filterHistory());

    // Template pagination events
    this.elements.templateSearch.addEventListener('input', () => this.filterTemplates());
    this.elements.templateCategoryFilter.addEventListener('change', () => this.filterTemplates());
    this.elements.templateItemsPerPage.addEventListener('change', () => this.changeTemplatePageSize());
    this.elements.templateFirstPage.addEventListener('click', () => this.goToTemplatePage(1));
    this.elements.templatePrevPage.addEventListener('click', () => this.goToTemplatePage(this.templatePagination.currentPage - 1));
    this.elements.templateNextPage.addEventListener('click', () => this.goToTemplatePage(this.templatePagination.currentPage + 1));
    this.elements.templateLastPage.addEventListener('click', () => this.goToTemplateLastPage());
    this.elements.templateGotoBtn.addEventListener('click', () => this.goToTemplatePageFromInput());
    this.elements.templateGotoPage.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.goToTemplatePageFromInput();
    });

    // History pagination events
    this.elements.historySearchInput.addEventListener('input', () => this.filterHistoryItems());
    this.elements.historyTemplateFilter.addEventListener('change', () => this.filterHistoryItems());
    this.elements.historyDateFilter.addEventListener('change', () => this.filterHistoryItems());
    this.elements.historyItemsPerPage.addEventListener('change', () => this.changeHistoryPageSize());
    this.elements.historyFirstPage.addEventListener('click', () => this.goToHistoryPage(1));
    this.elements.historyPrevPage.addEventListener('click', () => this.goToHistoryPage(this.historyPagination.currentPage - 1));
    this.elements.historyNextPage.addEventListener('click', () => this.goToHistoryPage(this.historyPagination.currentPage + 1));
    this.elements.historyLastPage.addEventListener('click', () => this.goToHistoryLastPage());
    this.elements.historyGotoBtn.addEventListener('click', () => this.goToHistoryPageFromInput());
    this.elements.historyGotoPage.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.goToHistoryPageFromInput();
    });

    // Footer save button
    this.elements.saveAllSettings.addEventListener('click', () => this.saveSettings());

    // Quick login events
    this.elements.quickLogin.addEventListener('click', () => this.handleQuickLogin());
    this.elements.getApiKey.addEventListener('click', () => this.openApiKeyPage());

    // Dashboard events
    this.elements.dashTestApi.addEventListener('click', () => this.testAPI());
    this.elements.dashViewHistory.addEventListener('click', () => this.openHistoryModal());
    this.elements.dashCreateTemplate.addEventListener('click', () => this.openTemplateModal());

    this.elements.provider.addEventListener('change', () => this.updateProviderFields());

    // Auto-save on certain changes
    this.elements.enabled.addEventListener('change', () => this.autoSave());
    this.elements.quickTemplateSelection.addEventListener('change', () => this.autoSave());
  }

  async loadSettings() {
    try {
      const settings = await chrome.storage.sync.get(this.defaultSettings);

      this.elements.enabled.checked = settings.enabled;
      this.elements.timeWindow.value = settings.timeWindow;
      this.elements.provider.value = settings.provider;
      this.elements.apiKey.value = settings.apiKey;
      this.elements.apiEndpoint.value = settings.apiEndpoint;
      this.elements.model.value = settings.model;
      this.elements.promptTemplate.value = settings.promptTemplate;
      this.elements.keyboardShortcut.value = settings.keyboardShortcut;

      // Template settings
      this.elements.quickTemplateSelection.checked = settings.quickTemplateSelection !== false;
      this.elements.selectedTemplate.value = settings.selectedTemplate || 'general';

      // Advanced settings
      this.elements.enableLogging.checked = settings.enableLogging || false;
      this.elements.autoSaveHistory.checked = settings.autoSaveHistory !== false;
      this.elements.maxHistoryItems.value = settings.maxHistoryItems || 100;
      this.elements.requestTimeout.value = settings.requestTimeout || 30;
      this.elements.retryAttempts.value = settings.retryAttempts || 3;
      this.elements.showNotifications.checked = settings.showNotifications !== false;
      this.elements.notificationDuration.value = settings.notificationDuration || 4;

      this.updateProviderFields();
    } catch (error) {
      this.showStatus('Failed to load settings', 'error');
    }
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
        selectedTemplate: this.elements.selectedTemplate.value,
        // Advanced settings
        enableLogging: this.elements.enableLogging.checked,
        autoSaveHistory: this.elements.autoSaveHistory.checked,
        maxHistoryItems: parseInt(this.elements.maxHistoryItems.value),
        requestTimeout: parseInt(this.elements.requestTimeout.value),
        retryAttempts: parseInt(this.elements.retryAttempts.value),
        showNotifications: this.elements.showNotifications.checked,
        notificationDuration: parseInt(this.elements.notificationDuration.value)
      };

      // Validation
      if (settings.timeWindow < 500 || settings.timeWindow > 3000) {
        throw new Error('Time window must be between 500 and 3000 milliseconds');
      }

      if (!settings.promptTemplate.includes('{text}')) {
        throw new Error('Prompt template must include {text} placeholder');
      }

      await chrome.storage.sync.set(settings);

      // Notify content scripts
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            type: 'SETTINGS_UPDATED'
          }).catch(() => { }); // Ignore errors for tabs without content script
        });
      });

      this.showStatus('Settings saved successfully!', 'success');
    } catch (error) {
      this.showStatus(`Failed to save settings: ${error.message}`, 'error');
    }
  }

  async autoSave() {
    // Auto-save for critical settings like enabled state
    try {
      await chrome.storage.sync.set({
        enabled: this.elements.enabled.checked
      });

      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            type: 'TOGGLE_EXTENSION',
            enabled: this.elements.enabled.checked
          }).catch(() => { });
        });
      });
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  }

  updateProviderFields() {
    const provider = this.elements.provider.value;

    // Update model options
    this.updateModelOptions(provider);

    // Update provider info
    this.updateProviderInfo(provider);

    // Update API endpoint based on provider
    switch (provider) {
      case 'openai':
        this.elements.apiEndpoint.value = 'https://api.openai.com/v1/chat/completions';
        this.elements.apiEndpointGroup.style.display = 'none';
        this.elements.quickLoginSection.style.display = 'none';
        break;
      case 'anthropic':
        this.elements.apiEndpoint.value = 'https://api.anthropic.com/v1/messages';
        this.elements.apiEndpointGroup.style.display = 'none';
        this.elements.quickLoginSection.style.display = 'none';
        break;
      case 'openrouter':
        this.elements.apiEndpoint.value = 'https://openrouter.ai/api/v1/chat/completions';
        this.elements.apiEndpointGroup.style.display = 'none';
        this.elements.quickLoginSection.style.display = 'block';
        break;
      case 'custom':
        this.elements.apiEndpointGroup.style.display = 'block';
        this.elements.quickLoginSection.style.display = 'none';
        break;
    }
  }

  updateModelOptions(provider) {
    const modelSelect = this.elements.model;
    modelSelect.innerHTML = '';

    const modelOptions = {
      openai: [
        { value: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo' },
        { value: 'gpt-3.5-turbo-16k', label: 'GPT-3.5 Turbo 16K' },
        { value: 'gpt-4', label: 'GPT-4' },
        { value: 'gpt-4-turbo-preview', label: 'GPT-4 Turbo' }
      ],
      anthropic: [
        { value: 'claude-3-haiku-20240307', label: 'Claude 3 Haiku' },
        { value: 'claude-3-sonnet-20240229', label: 'Claude 3 Sonnet' },
        { value: 'claude-3-opus-20240229', label: 'Claude 3 Opus' }
      ],
      openrouter: [
        { value: 'openai/gpt-3.5-turbo', label: 'OpenAI GPT-3.5 Turbo' },
        { value: 'openai/gpt-4', label: 'OpenAI GPT-4' },
        { value: 'anthropic/claude-3-sonnet', label: 'Anthropic Claude 3 Sonnet' },
        { value: 'anthropic/claude-3-opus', label: 'Anthropic Claude 3 Opus' },
        { value: 'meta-llama/llama-2-70b-chat', label: 'Meta Llama 2 70B' },
        { value: 'mistralai/mixtral-8x7b-instruct', label: 'Mixtral 8x7B' }
      ],
      custom: [
        { value: 'custom-model', label: 'Custom Model' }
      ]
    };

    const options = modelOptions[provider] || modelOptions.custom;
    options.forEach(option => {
      const optionElement = document.createElement('option');
      optionElement.value = option.value;
      optionElement.textContent = option.label;
      modelSelect.appendChild(optionElement);
    });

    // Set default selection
    if (options.length > 0) {
      modelSelect.value = options[0].value;
    }
  }

  updateProviderInfo(provider) {
    const providerInfos = {
      openai: {
        icon: '🤖',
        name: 'OpenAI',
        description: 'OpenAI provides state-of-the-art language models including GPT-3.5 and GPT-4.',
        features: ['Fast Response', 'High Quality', 'Reliable']
      },
      anthropic: {
        icon: '🧠',
        name: 'Anthropic',
        description: 'Anthropic\'s Claude models are designed to be helpful, harmless, and honest.',
        features: ['Safety Focused', 'Long Context', 'Thoughtful']
      },
      openrouter: {
        icon: '🌐',
        name: 'OpenRouter',
        description: 'Access multiple AI models through a single API. Compare and choose the best model for your needs.',
        features: ['Multiple Models', 'Cost Effective', 'Easy Switching']
      },
      custom: {
        icon: '⚙️',
        name: 'Custom API',
        description: 'Connect to your own AI model or API endpoint for maximum flexibility.',
        features: ['Full Control', 'Custom Models', 'Private']
      }
    };

    const info = providerInfos[provider];
    if (info) {
      this.elements.providerInfo.innerHTML = `
        <div class="provider-info-card">
          <div class="provider-info-header">
            <span class="provider-icon">${info.icon}</span>
            <span class="provider-name">${info.name}</span>
          </div>
          <div class="provider-info-content">
            <p>${info.description}</p>
            <div class="provider-features">
              ${info.features.map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
            </div>
          </div>
        </div>
      `;
    }
  }

  async testAPI() {
    const settings = {
      provider: this.elements.provider.value,
      apiKey: this.elements.apiKey.value.trim(),
      apiEndpoint: this.elements.apiEndpoint.value.trim(),
      model: this.elements.model.value.trim(),
      promptTemplate: this.elements.promptTemplate.value.trim()
    };

    if (!settings.apiKey) {
      this.showStatus('Please enter an API key first', 'error');
      return;
    }

    this.elements.testApi.disabled = true;
    this.elements.testApi.textContent = 'Testing...';
    this.showStatus('Testing API connection...', 'info');

    try {
      // Send test request to background script
      chrome.runtime.sendMessage({
        type: 'TEST_API',
        settings: settings
      });

      // Listen for response
      const listener = (message) => {
        if (message.type === 'API_TEST_RESULT') {
          chrome.runtime.onMessage.removeListener(listener);

          if (message.success) {
            this.showStatus('API test successful!', 'success');
          } else {
            this.showStatus(`API test failed: ${message.error}`, 'error');
          }

          this.elements.testApi.disabled = false;
          this.elements.testApi.textContent = 'Test API';
        }
      };

      chrome.runtime.onMessage.addListener(listener);

      // Timeout after 30 seconds
      setTimeout(() => {
        chrome.runtime.onMessage.removeListener(listener);
        this.elements.testApi.disabled = false;
        this.elements.testApi.textContent = 'Test API';
        this.showStatus('API test timed out', 'error');
      }, 30000);

    } catch (error) {
      this.showStatus(`API test failed: ${error.message}`, 'error');
      this.elements.testApi.disabled = false;
      this.elements.testApi.textContent = 'Test API';
    }
  }

  async resetSettings() {
    if (confirm('Are you sure you want to reset all settings to defaults? This cannot be undone.')) {
      try {
        await chrome.storage.sync.set(this.defaultSettings);
        await this.loadSettings();
        this.showStatus('Settings reset to defaults', 'success');
      } catch (error) {
        this.showStatus(`Failed to reset settings: ${error.message}`, 'error');
      }
    }
  }

  toggleApiKeyVisibility() {
    const isPassword = this.elements.apiKey.type === 'password';
    this.elements.apiKey.type = isPassword ? 'text' : 'password';
    this.elements.toggleApiKey.textContent = isPassword ? 'Hide' : 'Show';
  }

  async exportSettings() {
    try {
      const settings = await chrome.storage.sync.get();
      const dataStr = JSON.stringify(settings, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'promptboost-settings.json';
      link.click();

      URL.revokeObjectURL(url);
      this.showStatus('Settings exported successfully', 'success');
    } catch (error) {
      this.showStatus(`Failed to export settings: ${error.message}`, 'error');
    }
  }

  async importSettings(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const settings = JSON.parse(text);

      // Validate settings
      const validKeys = Object.keys(this.defaultSettings);
      const importedKeys = Object.keys(settings);

      if (!importedKeys.some(key => validKeys.includes(key))) {
        throw new Error('Invalid settings file format');
      }

      // Merge with defaults to ensure all required keys exist
      const mergedSettings = { ...this.defaultSettings, ...settings };

      await chrome.storage.sync.set(mergedSettings);
      await this.loadSettings();

      this.showStatus('Settings imported successfully', 'success');
    } catch (error) {
      this.showStatus(`Failed to import settings: ${error.message}`, 'error');
    }

    // Reset file input
    event.target.value = '';
  }

  showStatus(message, type = 'info') {
    this.elements.status.textContent = message;
    this.elements.status.className = `status-message ${type}`;

    // Update footer status as well
    if (this.elements.footerStatus) {
      this.elements.footerStatus.textContent = message;
      this.elements.footerStatus.className = `footer-status ${type}`;
    }

    // Auto-hide after 5 seconds
    setTimeout(() => {
      this.elements.status.style.display = 'none';
      if (this.elements.footerStatus && type !== 'success') {
        this.elements.footerStatus.textContent = 'Ready';
        this.elements.footerStatus.className = 'footer-status';
      }
    }, 5000);
  }

  // Template Management Methods
  async loadTemplates() {
    try {
      const result = await chrome.storage.sync.get(['templates']);
      this.templates = result.templates || {};

      // Initialize template pagination
      this.templatePagination.filteredItems = Object.values(this.templates);
      this.templatePagination.totalItems = this.templatePagination.filteredItems.length;
      this.templatePagination.currentPage = 1;

      this.renderTemplateList();
      this.updateTemplateSelector();
    } catch (error) {
      this.showStatus('Failed to load templates', 'error');
    }
  }

  renderTemplateList() {
    const templateList = this.elements.templateList;
    templateList.innerHTML = '';

    // Use filtered items if available, otherwise use all templates
    const templatesToShow = this.templatePagination.filteredItems.length > 0
      ? this.templatePagination.filteredItems
      : Object.values(this.templates || {});

    if (templatesToShow.length === 0) {
      templateList.innerHTML = '<p style="text-align: center; color: #666; padding: 2rem;">No templates found. Create your first template!</p>';
      this.templatePagination.totalItems = 0;
      this.updateTemplatePagination();
      return;
    }

    // Calculate pagination
    const { currentPage, itemsPerPage } = this.templatePagination;
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedTemplates = templatesToShow.slice(startIndex, endIndex);

    // Update total items if not set
    if (this.templatePagination.totalItems !== templatesToShow.length) {
      this.templatePagination.totalItems = templatesToShow.length;
    }

    paginatedTemplates.forEach(template => {
      const templateItem = document.createElement('div');
      templateItem.className = 'template-item';

      templateItem.innerHTML = `
        <div class="template-info">
          <div class="template-name">${template.name}</div>
          <div class="template-meta">
            <span class="template-category-badge">${template.category}</span>
            ${template.isDefault ? '<span class="template-default-badge">Default</span>' : ''}
          </div>
          <div class="template-description">${template.description}</div>
        </div>
        <div class="template-actions-item">
          <button class="btn-secondary btn-small" onclick="promptBoostOptions.editTemplate('${template.id}')">Edit</button>
          ${!template.isDefault ? `<button class="btn-danger btn-small" onclick="promptBoostOptions.deleteTemplate('${template.id}')">Delete</button>` : ''}
        </div>
      `;

      templateList.appendChild(templateItem);
    });

    // Update pagination controls
    this.updateTemplatePagination();
  }

  updateTemplateSelector() {
    const selector = this.elements.selectedTemplate;
    selector.innerHTML = '';

    Object.values(this.templates).forEach(template => {
      const option = document.createElement('option');
      option.value = template.id;
      option.textContent = template.name;
      selector.appendChild(option);
    });
  }

  openTemplateModal(templateId = null) {
    this.currentEditingTemplate = templateId;

    if (templateId && this.templates[templateId]) {
      const template = this.templates[templateId];
      this.elements.modalTitle.textContent = 'Edit Template';
      this.elements.templateName.value = template.name;
      this.elements.templateCategory.value = template.category;
      this.elements.templateDescription.value = template.description;
      this.elements.templatePrompt.value = template.template;
    } else {
      this.elements.modalTitle.textContent = 'Create New Template';
      this.elements.templateName.value = '';
      this.elements.templateCategory.value = 'General';
      this.elements.templateDescription.value = '';
      this.elements.templatePrompt.value = '';
    }

    this.elements.templateModal.style.display = 'flex';
  }

  closeTemplateModal() {
    this.elements.templateModal.style.display = 'none';
    this.currentEditingTemplate = null;
  }

  async saveTemplateFromModal() {
    const name = this.elements.templateName.value.trim();
    const category = this.elements.templateCategory.value;
    const description = this.elements.templateDescription.value.trim();
    const template = this.elements.templatePrompt.value.trim();

    if (!name || !description || !template) {
      this.showStatus('Please fill in all required fields', 'error');
      return;
    }

    if (!template.includes('{text}')) {
      this.showStatus('Template must include {text} placeholder', 'error');
      return;
    }

    try {
      const templateData = {
        id: this.currentEditingTemplate || 'custom_' + Date.now(),
        name,
        category,
        description,
        template,
        isDefault: false,
        isCustom: true,
        createdAt: this.currentEditingTemplate ? this.templates[this.currentEditingTemplate].createdAt : Date.now(),
        updatedAt: Date.now()
      };

      this.templates[templateData.id] = templateData;
      await chrome.storage.sync.set({ templates: this.templates });

      this.renderTemplateList();
      this.updateTemplateSelector();
      this.closeTemplateModal();

      this.showStatus(this.currentEditingTemplate ? 'Template updated successfully' : 'Template created successfully', 'success');
    } catch (error) {
      this.showStatus('Failed to save template', 'error');
    }
  }

  editTemplate(templateId) {
    this.openTemplateModal(templateId);
  }

  async deleteTemplate(templateId) {
    if (!confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      delete this.templates[templateId];
      await chrome.storage.sync.set({ templates: this.templates });

      this.renderTemplateList();
      this.updateTemplateSelector();
      this.showStatus('Template deleted successfully', 'success');
    } catch (error) {
      this.showStatus('Failed to delete template', 'error');
    }
  }

  async exportTemplates() {
    try {
      const customTemplates = {};
      Object.entries(this.templates).forEach(([id, template]) => {
        if (template.isCustom) {
          customTemplates[id] = template;
        }
      });

      const dataStr = JSON.stringify(customTemplates, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'promptboost-templates.json';
      link.click();

      URL.revokeObjectURL(url);
      this.showStatus('Templates exported successfully', 'success');
    } catch (error) {
      this.showStatus('Failed to export templates', 'error');
    }
  }

  async importTemplates(event) {
    const file = event.target.files[0];
    if (!file) return;

    try {
      const text = await file.text();
      const importedTemplates = JSON.parse(text);

      // Validate templates
      let validCount = 0;
      Object.values(importedTemplates).forEach(template => {
        if (template.name && template.template && template.template.includes('{text}')) {
          template.isCustom = true;
          template.importedAt = Date.now();
          this.templates[template.id || 'imported_' + Date.now() + '_' + validCount] = template;
          validCount++;
        }
      });

      if (validCount > 0) {
        await chrome.storage.sync.set({ templates: this.templates });
        this.renderTemplateList();
        this.updateTemplateSelector();
        this.showStatus(`${validCount} templates imported successfully`, 'success');
      } else {
        this.showStatus('No valid templates found in file', 'error');
      }
    } catch (error) {
      this.showStatus('Failed to import templates: Invalid file format', 'error');
    }

    event.target.value = '';
  }

  // History Management Methods
  async loadHistoryStats() {
    try {
      const result = await chrome.storage.local.get(['optimizationHistory']);
      const history = result.optimizationHistory || [];

      // Calculate stats
      const total = history.length;
      const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      const thisWeek = history.filter(item => item.timestamp > weekAgo).length;

      // Find most used template
      const templateCounts = {};
      history.forEach(item => {
        const template = item.templateUsed || 'Default';
        templateCounts[template] = (templateCounts[template] || 0) + 1;
      });

      const mostUsed = Object.entries(templateCounts)
        .sort(([,a], [,b]) => b - a)[0];

      // Update UI
      this.elements.totalOptimizations.textContent = total;
      this.elements.weekOptimizations.textContent = thisWeek;
      this.elements.mostUsedTemplate.textContent = mostUsed ? mostUsed[0] : '-';

    } catch (error) {
      console.error('Failed to load history stats:', error);
    }
  }

  async openHistoryModal() {
    try {
      const result = await chrome.storage.local.get(['optimizationHistory']);
      this.history = result.optimizationHistory || [];

      // Populate template filter
      const templates = new Set(['all']);
      this.history.forEach(item => {
        templates.add(item.templateUsed || 'Default');
      });

      this.elements.historyFilter.innerHTML = '';
      templates.forEach(template => {
        const option = document.createElement('option');
        option.value = template;
        option.textContent = template === 'all' ? 'All Templates' : template;
        this.elements.historyFilter.appendChild(option);
      });

      this.renderHistory();
      this.elements.historyModal.style.display = 'flex';
    } catch (error) {
      this.showStatus('Failed to load history', 'error');
    }
  }

  closeHistoryModal() {
    this.elements.historyModal.style.display = 'none';
  }

  renderHistory() {
    const historyList = this.elements.historyList;
    let filteredHistory = this.history || [];

    // Apply filters
    const searchTerm = this.elements.historySearch.value.toLowerCase();
    const templateFilter = this.elements.historyFilter.value;

    if (searchTerm) {
      filteredHistory = filteredHistory.filter(item =>
        item.originalText.toLowerCase().includes(searchTerm) ||
        item.optimizedText.toLowerCase().includes(searchTerm) ||
        item.domain.toLowerCase().includes(searchTerm)
      );
    }

    if (templateFilter !== 'all') {
      filteredHistory = filteredHistory.filter(item =>
        (item.templateUsed || 'Default') === templateFilter
      );
    }

    if (filteredHistory.length === 0) {
      historyList.innerHTML = `
        <div class="history-empty">
          <h4>No optimization history found</h4>
          <p>Start optimizing text to see your history here.</p>
        </div>
      `;
      return;
    }

    historyList.innerHTML = '';
    filteredHistory.forEach(item => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';

      const date = new Date(item.timestamp).toLocaleString();

      historyItem.innerHTML = `
        <div class="history-header">
          <span class="history-template">${item.templateUsed || 'Default'}</span>
          <span class="history-date">${date}</span>
        </div>
        <div class="history-domain">${item.domain}</div>
        <div class="history-texts">
          <div class="history-text history-original">
            <div class="history-text-label">Original</div>
            ${item.originalText}
          </div>
          <div class="history-text history-optimized">
            <div class="history-text-label">Optimized</div>
            ${item.optimizedText}
          </div>
        </div>
      `;

      historyList.appendChild(historyItem);
    });
  }

  filterHistory() {
    this.renderHistory();
  }

  async exportHistory() {
    try {
      const result = await chrome.storage.local.get(['optimizationHistory']);
      const history = result.optimizationHistory || [];

      if (history.length === 0) {
        this.showStatus('No history to export', 'error');
        return;
      }

      const dataStr = JSON.stringify(history, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });

      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `promptboost-history-${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      URL.revokeObjectURL(url);
      this.showStatus('History exported successfully', 'success');
    } catch (error) {
      this.showStatus('Failed to export history', 'error');
    }
  }

  async clearHistory() {
    if (!confirm('Are you sure you want to clear all optimization history? This cannot be undone.')) {
      return;
    }

    try {
      await chrome.storage.local.set({ optimizationHistory: [] });
      this.loadHistoryStats();
      this.showStatus('History cleared successfully', 'success');
    } catch (error) {
      this.showStatus('Failed to clear history', 'error');
    }
  }

  // Quick Login Methods
  async handleQuickLogin() {
    try {
      this.elements.quickLogin.disabled = true;
      this.elements.quickLogin.textContent = 'Authenticating...';
      this.showStatus('Starting OpenRouter authentication...', 'info');

      // Set up message listener for auth results
      const messageListener = (message) => {
        if (message.type === 'OPENROUTER_AUTH_SUCCESS') {
          chrome.runtime.onMessage.removeListener(messageListener);
          this.elements.apiKey.value = message.token;
          this.elements.quickLogin.disabled = false;
          this.elements.quickLogin.innerHTML = '<span class="login-icon">🔐</span>Login with OpenRouter';
          this.showStatus('Successfully authenticated with OpenRouter!', 'success');
        } else if (message.type === 'OPENROUTER_AUTH_ERROR') {
          chrome.runtime.onMessage.removeListener(messageListener);
          this.elements.quickLogin.disabled = false;
          this.elements.quickLogin.innerHTML = '<span class="login-icon">🔐</span>Login with OpenRouter';
          this.showStatus('Authentication failed: ' + message.error, 'error');
        }
      };

      chrome.runtime.onMessage.addListener(messageListener);

      // Start OAuth flow via background script
      chrome.runtime.sendMessage({
        type: 'OPENROUTER_AUTH',
        action: 'start'
      });

      // Timeout after 5 minutes
      setTimeout(() => {
        chrome.runtime.onMessage.removeListener(messageListener);
        this.elements.quickLogin.disabled = false;
        this.elements.quickLogin.innerHTML = '<span class="login-icon">🔐</span>Login with OpenRouter';
        this.showStatus('Authentication timed out', 'error');
      }, 300000);

    } catch (error) {
      this.elements.quickLogin.disabled = false;
      this.elements.quickLogin.innerHTML = '<span class="login-icon">🔐</span>Login with OpenRouter';
      this.showStatus('Failed to start authentication: ' + error.message, 'error');
    }
  }

  openApiKeyPage() {
    window.open('https://openrouter.ai/keys', '_blank');
    this.showStatus('Opening OpenRouter API keys page...', 'info');
  }

  // Dashboard Methods
  async updateDashboard() {
    try {
      // Update header status
      const isConfigured = this.elements.apiKey.value.trim().length > 0;
      this.elements.headerStatus.textContent = isConfigured ? 'Ready' : 'Setup Required';

      // Update dashboard stats
      const result = await chrome.storage.local.get(['optimizationHistory']);
      const history = result.optimizationHistory || [];
      this.elements.dashTotalOptimizations.textContent = history.length;

      // Update active templates count
      const templateCount = Object.keys(this.templates || {}).length;
      this.elements.dashActiveTemplates.textContent = templateCount;

    } catch (error) {
      console.error('Failed to update dashboard:', error);
    }
  }

  // Sidebar Management
  setupSidebar() {
    // Apply saved sidebar state
    if (this.sidebarCollapsed) {
      this.elements.sidebar.classList.add('collapsed');
      this.elements.mainContent.classList.add('sidebar-collapsed');
      this.elements.sidebarToggle.classList.add('active');
    }

    // Create mobile overlay
    if (window.innerWidth <= 768) {
      this.createMobileOverlay();
    }

    // Handle window resize
    window.addEventListener('resize', () => {
      if (window.innerWidth <= 768) {
        this.createMobileOverlay();
      } else {
        this.removeMobileOverlay();
      }
    });
  }

  createMobileOverlay() {
    if (!document.querySelector('.sidebar-overlay')) {
      const overlay = document.createElement('div');
      overlay.className = 'sidebar-overlay';
      overlay.addEventListener('click', () => this.closeMobileSidebar());
      document.body.appendChild(overlay);
    }
  }

  removeMobileOverlay() {
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) {
      overlay.remove();
    }
  }

  toggleSidebar() {
    const isMobile = window.innerWidth <= 768;

    if (isMobile) {
      this.toggleMobileSidebar();
    } else {
      this.toggleDesktopSidebar();
    }
  }

  toggleDesktopSidebar() {
    this.sidebarCollapsed = !this.sidebarCollapsed;

    if (this.sidebarCollapsed) {
      this.elements.sidebar.classList.add('collapsed');
      this.elements.mainContent.classList.add('sidebar-collapsed');
      this.elements.sidebarToggle.classList.add('active');
    } else {
      this.elements.sidebar.classList.remove('collapsed');
      this.elements.mainContent.classList.remove('sidebar-collapsed');
      this.elements.sidebarToggle.classList.remove('active');
    }

    // Save state
    localStorage.setItem('sidebarCollapsed', this.sidebarCollapsed);
  }

  toggleMobileSidebar() {
    const isOpen = this.elements.sidebar.classList.contains('open');
    const overlay = document.querySelector('.sidebar-overlay');

    if (isOpen) {
      this.elements.sidebar.classList.remove('open');
      if (overlay) overlay.classList.remove('active');
      this.elements.sidebarToggle.classList.remove('active');
    } else {
      this.elements.sidebar.classList.add('open');
      if (overlay) overlay.classList.add('active');
      this.elements.sidebarToggle.classList.add('active');
    }
  }

  closeMobileSidebar() {
    this.elements.sidebar.classList.remove('open');
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) overlay.classList.remove('active');
    this.elements.sidebarToggle.classList.remove('active');
  }

  // Navigation Management
  setupNavigation() {
    // Add click listeners to nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        const action = link.dataset.action;

        if (action === 'start-tour') {
          this.startOnboardingTour();
        } else if (section) {
          this.navigateToSection(section);
        }
      });
    });

    // Show initial section
    this.navigateToSection(this.currentSection);
  }

  navigateToSection(sectionId) {
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => section.classList.remove('active'));

    // Show target section
    const targetSection = document.getElementById(`${sectionId}-section`);
    if (targetSection) {
      targetSection.classList.add('active');
    }

    // Update nav links
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.dataset.section === sectionId) {
        link.classList.add('active');
      }
    });

    // Update breadcrumb
    this.updateBreadcrumb(sectionId);

    // Close mobile sidebar
    if (window.innerWidth <= 768) {
      this.closeMobileSidebar();
    }

    this.currentSection = sectionId;
  }

  updateBreadcrumb(sectionId) {
    const breadcrumbList = this.elements.breadcrumb.querySelector('.breadcrumb-list');
    const sectionNames = {
      overview: 'Overview',
      general: 'General Settings',
      provider: 'AI Provider',
      templates: 'Templates',
      advanced: 'Advanced',
      history: 'History',
      backup: 'Backup & Restore'
    };

    breadcrumbList.innerHTML = `
      <li class="breadcrumb-item"><a href="#overview">Dashboard</a></li>
      <li class="breadcrumb-item active">${sectionNames[sectionId] || 'Unknown'}</li>
    `;
  }

  // Search Functionality
  setupSearch() {
    this.elements.globalSearch.addEventListener('input', (e) => {
      this.performGlobalSearch(e.target.value);
    });
  }

  performGlobalSearch(query) {
    if (!query.trim()) {
      this.clearSearchHighlights();
      return;
    }

    const searchTerms = query.toLowerCase().split(' ');
    const sections = document.querySelectorAll('.content-section');

    sections.forEach(section => {
      const textContent = section.textContent.toLowerCase();
      const hasMatch = searchTerms.some(term => textContent.includes(term));

      if (hasMatch) {
        section.style.display = 'block';
        this.highlightSearchTerms(section, searchTerms);
      } else {
        section.style.display = 'none';
      }
    });
  }

  highlightSearchTerms(element, terms) {
    // Simple highlighting implementation
    // In a production app, you'd want a more sophisticated approach
    this.clearSearchHighlights();

    terms.forEach(term => {
      const walker = document.createTreeWalker(
        element,
        NodeFilter.SHOW_TEXT,
        null,
        false
      );

      const textNodes = [];
      let node;
      while (node = walker.nextNode()) {
        if (node.textContent.toLowerCase().includes(term)) {
          textNodes.push(node);
        }
      }

      textNodes.forEach(textNode => {
        const parent = textNode.parentNode;
        const text = textNode.textContent;
        const regex = new RegExp(`(${term})`, 'gi');
        const highlightedText = text.replace(regex, '<mark class="search-highlight">$1</mark>');

        if (highlightedText !== text) {
          const wrapper = document.createElement('span');
          wrapper.innerHTML = highlightedText;
          parent.replaceChild(wrapper, textNode);
        }
      });
    });
  }

  clearSearchHighlights() {
    const highlights = document.querySelectorAll('.search-highlight');
    highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      parent.replaceChild(document.createTextNode(highlight.textContent), highlight);
      parent.normalize();
    });
  }

  // Accessibility and Keyboard Navigation
  setupAccessibility() {
    // Add ARIA labels and roles
    this.addAriaLabels();

    // Setup keyboard navigation
    this.setupKeyboardNavigation();

    // Ensure proper focus management
    this.setupFocusManagement();
  }

  addAriaLabels() {
    // Add ARIA labels to navigation
    const sidebar = this.elements.sidebar;
    sidebar.setAttribute('role', 'navigation');
    sidebar.setAttribute('aria-label', 'Settings navigation');

    // Add ARIA labels to pagination
    const templatePagination = this.elements.templatePagination;
    if (templatePagination) {
      templatePagination.setAttribute('role', 'navigation');
      templatePagination.setAttribute('aria-label', 'Template pagination');
    }

    const historyPagination = this.elements.historyPagination;
    if (historyPagination) {
      historyPagination.setAttribute('role', 'navigation');
      historyPagination.setAttribute('aria-label', 'History pagination');
    }

    // Add ARIA labels to search inputs
    this.elements.globalSearch.setAttribute('aria-label', 'Search all settings');

    if (this.elements.templateSearch) {
      this.elements.templateSearch.setAttribute('aria-label', 'Search templates');
    }

    if (this.elements.historySearchInput) {
      this.elements.historySearchInput.setAttribute('aria-label', 'Search history');
    }
  }

  setupKeyboardNavigation() {
    // Global keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + K to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        this.elements.globalSearch.focus();
      }

      // Escape to close modals or tour
      if (e.key === 'Escape') {
        this.handleEscapeKey();
      }

      // Arrow keys for navigation
      if (e.target.classList.contains('nav-link')) {
        this.handleNavKeyboard(e);
      }
    });
  }

  handleEscapeKey() {
    // Close tour if active
    const tourOverlay = document.querySelector('.tour-overlay');
    if (tourOverlay) {
      this.endTour();
      return;
    }

    // Close modals
    const templateModal = this.elements.templateModal;
    const historyModal = this.elements.historyModal;

    if (templateModal && templateModal.style.display === 'flex') {
      this.closeTemplateModal();
    } else if (historyModal && historyModal.style.display === 'flex') {
      this.closeHistoryModal();
    }
  }

  handleNavKeyboard(e) {
    const navLinks = Array.from(document.querySelectorAll('.nav-link'));
    const currentIndex = navLinks.indexOf(e.target);

    let nextIndex;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = (currentIndex + 1) % navLinks.length;
        navLinks[nextIndex].focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = currentIndex === 0 ? navLinks.length - 1 : currentIndex - 1;
        navLinks[nextIndex].focus();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        e.target.click();
        break;
    }
  }

  setupFocusManagement() {
    // Ensure sidebar toggle is focusable
    this.elements.sidebarToggle.setAttribute('tabindex', '0');

    // Add focus styles for better visibility
    const style = document.createElement('style');
    style.textContent = `
      .nav-link:focus,
      .sidebar-toggle:focus,
      .pagination-btn:focus,
      .pagination-page:focus {
        outline: 2px solid hsl(221.2 83.2% 53.3%);
        outline-offset: 2px;
      }

      .search-input:focus {
        outline: none;
        box-shadow: 0 0 0 2px hsl(221.2 83.2% 53.3%);
      }
    `;
    document.head.appendChild(style);
  }

  // Template Pagination Methods
  filterTemplates() {
    const searchTerm = this.elements.templateSearch.value.toLowerCase();
    const categoryFilter = this.elements.templateCategoryFilter.value;

    let filteredTemplates = Object.values(this.templates || {});

    // Apply search filter
    if (searchTerm) {
      filteredTemplates = filteredTemplates.filter(template =>
        template.name.toLowerCase().includes(searchTerm) ||
        template.description.toLowerCase().includes(searchTerm) ||
        template.category.toLowerCase().includes(searchTerm)
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filteredTemplates = filteredTemplates.filter(template =>
        template.category === categoryFilter
      );
    }

    this.templatePagination.filteredItems = filteredTemplates;
    this.templatePagination.totalItems = filteredTemplates.length;
    this.templatePagination.currentPage = 1;

    this.renderTemplateList();
    this.updateTemplatePagination();
  }

  changeTemplatePageSize() {
    this.templatePagination.itemsPerPage = parseInt(this.elements.templateItemsPerPage.value);
    this.templatePagination.currentPage = 1;
    this.renderTemplateList();
    this.updateTemplatePagination();
  }

  goToTemplatePage(page) {
    const totalPages = Math.ceil(this.templatePagination.totalItems / this.templatePagination.itemsPerPage);
    if (page >= 1 && page <= totalPages) {
      this.templatePagination.currentPage = page;
      this.renderTemplateList();
      this.updateTemplatePagination();
    }
  }

  goToTemplateLastPage() {
    const totalPages = Math.ceil(this.templatePagination.totalItems / this.templatePagination.itemsPerPage);
    this.goToTemplatePage(totalPages);
  }

  goToTemplatePageFromInput() {
    const page = parseInt(this.elements.templateGotoPage.value);
    if (!isNaN(page)) {
      this.goToTemplatePage(page);
      this.elements.templateGotoPage.value = '';
    }
  }

  updateTemplatePagination() {
    const { currentPage, itemsPerPage, totalItems } = this.templatePagination;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Update info text
    this.elements.templatePaginationInfo.textContent =
      `Showing ${startItem}-${endItem} of ${totalItems} templates`;

    // Update button states
    this.elements.templateFirstPage.disabled = currentPage === 1;
    this.elements.templatePrevPage.disabled = currentPage === 1;
    this.elements.templateNextPage.disabled = currentPage === totalPages;
    this.elements.templateLastPage.disabled = currentPage === totalPages;

    // Update page numbers
    this.renderTemplatePageNumbers(currentPage, totalPages);

    // Update goto page max
    this.elements.templateGotoPage.max = totalPages;
  }

  renderTemplatePageNumbers(currentPage, totalPages) {
    const pagesContainer = this.elements.templatePages;
    pagesContainer.innerHTML = '';

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.className = `pagination-page ${i === currentPage ? 'active' : ''}`;
      pageBtn.textContent = i;
      pageBtn.addEventListener('click', () => this.goToTemplatePage(i));
      pagesContainer.appendChild(pageBtn);
    }
  }

  // History Pagination Methods
  filterHistoryItems() {
    // This will be implemented when we have actual history data
    // For now, just update pagination
    this.historyPagination.currentPage = 1;
    this.updateHistoryPagination();
  }

  changeHistoryPageSize() {
    this.historyPagination.itemsPerPage = parseInt(this.elements.historyItemsPerPage.value);
    this.historyPagination.currentPage = 1;
    this.updateHistoryPagination();
  }

  goToHistoryPage(page) {
    const totalPages = Math.ceil(this.historyPagination.totalItems / this.historyPagination.itemsPerPage);
    if (page >= 1 && page <= totalPages) {
      this.historyPagination.currentPage = page;
      this.updateHistoryPagination();
    }
  }

  goToHistoryLastPage() {
    const totalPages = Math.ceil(this.historyPagination.totalItems / this.historyPagination.itemsPerPage);
    this.goToHistoryPage(totalPages);
  }

  goToHistoryPageFromInput() {
    const page = parseInt(this.elements.historyGotoPage.value);
    if (!isNaN(page)) {
      this.goToHistoryPage(page);
      this.elements.historyGotoPage.value = '';
    }
  }

  updateHistoryPagination() {
    const { currentPage, itemsPerPage, totalItems } = this.historyPagination;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    // Update info text
    this.elements.historyPaginationInfo.textContent =
      `Showing ${startItem}-${endItem} of ${totalItems} items`;

    // Update button states
    this.elements.historyFirstPage.disabled = currentPage === 1;
    this.elements.historyPrevPage.disabled = currentPage === 1;
    this.elements.historyNextPage.disabled = currentPage === totalPages;
    this.elements.historyLastPage.disabled = currentPage === totalPages;

    // Update page numbers
    this.renderHistoryPageNumbers(currentPage, totalPages);

    // Update goto page max
    this.elements.historyGotoPage.max = totalPages;
  }

  renderHistoryPageNumbers(currentPage, totalPages) {
    const pagesContainer = this.elements.historyPages;
    pagesContainer.innerHTML = '';

    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage < maxVisiblePages - 1) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement('button');
      pageBtn.className = `pagination-page ${i === currentPage ? 'active' : ''}`;
      pageBtn.textContent = i;
      pageBtn.addEventListener('click', () => this.goToHistoryPage(i));
      pagesContainer.appendChild(pageBtn);
    }
  }

  // Onboarding Tour System
  startOnboardingTour() {
    this.tourSteps = [
      {
        target: '#sidebarToggle',
        title: 'Sidebar Navigation',
        content: 'Use this button to collapse or expand the sidebar navigation. The sidebar organizes all settings into logical categories.',
        position: 'right'
      },
      {
        target: '#globalSearch',
        title: 'Global Search',
        content: 'Search across all settings, templates, and options. Type keywords to quickly find what you\'re looking for.',
        position: 'bottom'
      },
      {
        target: '.nav-link[data-section="general"]',
        title: 'General Settings',
        content: 'Configure basic extension behavior, activation methods, and keyboard shortcuts.',
        position: 'right'
      },
      {
        target: '.nav-link[data-section="provider"]',
        title: 'AI Provider',
        content: 'Set up your AI provider (OpenAI, Anthropic, OpenRouter, or Custom). Configure API keys and select models.',
        position: 'right'
      },
      {
        target: '.nav-link[data-section="templates"]',
        title: 'Template Management',
        content: 'Create, edit, and organize prompt templates. Use pagination and search to manage large collections.',
        position: 'right'
      },
      {
        target: '#templateSearch',
        title: 'Template Search & Filters',
        content: 'Search templates by name, description, or category. Use filters to narrow down results.',
        position: 'bottom'
      },
      {
        target: '#templatePagination',
        title: 'Pagination Controls',
        content: 'Navigate through large lists with pagination. Change items per page and jump to specific pages.',
        position: 'top'
      },
      {
        target: '.nav-link[data-section="history"]',
        title: 'History & Analytics',
        content: 'View optimization history, usage statistics, and manage your data.',
        position: 'right'
      },
      {
        target: '.nav-link[data-section="backup"]',
        title: 'Backup & Restore',
        content: 'Export your settings and templates for backup, or import configurations from other devices.',
        position: 'right'
      }
    ];

    this.currentTourStep = 0;
    this.createTourOverlay();
    this.showTourStep();
  }

  createTourOverlay() {
    // Remove existing tour overlay
    const existingOverlay = document.querySelector('.tour-overlay');
    if (existingOverlay) {
      existingOverlay.remove();
    }

    // Create tour overlay
    this.tourOverlay = document.createElement('div');
    this.tourOverlay.className = 'tour-overlay';
    this.tourOverlay.innerHTML = `
      <div class="tour-backdrop"></div>
      <div class="tour-tooltip">
        <div class="tour-header">
          <h3 class="tour-title"></h3>
          <button class="tour-close" aria-label="Close tour">×</button>
        </div>
        <div class="tour-content"></div>
        <div class="tour-footer">
          <div class="tour-progress">
            <span class="tour-step-counter"></span>
            <div class="tour-progress-bar">
              <div class="tour-progress-fill"></div>
            </div>
          </div>
          <div class="tour-actions">
            <button class="tour-btn tour-skip">Skip Tour</button>
            <button class="tour-btn tour-prev" disabled>Previous</button>
            <button class="tour-btn tour-next">Next</button>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(this.tourOverlay);

    // Add event listeners
    this.tourOverlay.querySelector('.tour-close').addEventListener('click', () => this.endTour());
    this.tourOverlay.querySelector('.tour-skip').addEventListener('click', () => this.endTour());
    this.tourOverlay.querySelector('.tour-prev').addEventListener('click', () => this.previousTourStep());
    this.tourOverlay.querySelector('.tour-next').addEventListener('click', () => this.nextTourStep());

    // Close on backdrop click
    this.tourOverlay.querySelector('.tour-backdrop').addEventListener('click', () => this.endTour());
  }

  showTourStep() {
    const step = this.tourSteps[this.currentTourStep];
    const target = document.querySelector(step.target);

    if (!target) {
      console.warn(`Tour target not found: ${step.target}`);
      this.nextTourStep();
      return;
    }

    // Navigate to the appropriate section if needed
    const sectionMatch = step.target.match(/data-section="([^"]+)"/);
    if (sectionMatch) {
      this.navigateToSection(sectionMatch[1]);
    }

    // Update tooltip content
    const tooltip = this.tourOverlay.querySelector('.tour-tooltip');
    const title = this.tourOverlay.querySelector('.tour-title');
    const content = this.tourOverlay.querySelector('.tour-content');
    const stepCounter = this.tourOverlay.querySelector('.tour-step-counter');
    const progressFill = this.tourOverlay.querySelector('.tour-progress-fill');
    const prevBtn = this.tourOverlay.querySelector('.tour-prev');
    const nextBtn = this.tourOverlay.querySelector('.tour-next');

    title.textContent = step.title;
    content.textContent = step.content;
    stepCounter.textContent = `Step ${this.currentTourStep + 1} of ${this.tourSteps.length}`;

    // Update progress bar
    const progress = ((this.currentTourStep + 1) / this.tourSteps.length) * 100;
    progressFill.style.width = `${progress}%`;

    // Update button states
    prevBtn.disabled = this.currentTourStep === 0;
    nextBtn.textContent = this.currentTourStep === this.tourSteps.length - 1 ? 'Finish' : 'Next';

    // Position tooltip
    this.positionTourTooltip(target, step.position, tooltip);

    // Highlight target element
    this.highlightTourTarget(target);
  }

  positionTourTooltip(target, position, tooltip) {
    const targetRect = target.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const margin = 20;

    let top, left;

    switch (position) {
      case 'top':
        top = targetRect.top - tooltipRect.height - margin;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + margin;
        left = targetRect.left + (targetRect.width - tooltipRect.width) / 2;
        break;
      case 'left':
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.left - tooltipRect.width - margin;
        break;
      case 'right':
      default:
        top = targetRect.top + (targetRect.height - tooltipRect.height) / 2;
        left = targetRect.right + margin;
        break;
    }

    // Ensure tooltip stays within viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;

    if (left < 0) left = margin;
    if (left + tooltipRect.width > viewportWidth) left = viewportWidth - tooltipRect.width - margin;
    if (top < 0) top = margin;
    if (top + tooltipRect.height > viewportHeight) top = viewportHeight - tooltipRect.height - margin;

    tooltip.style.position = 'fixed';
    tooltip.style.top = `${top}px`;
    tooltip.style.left = `${left}px`;
    tooltip.style.zIndex = '10001';
  }

  highlightTourTarget(target) {
    // Remove existing highlights
    const existingHighlight = document.querySelector('.tour-highlight');
    if (existingHighlight) {
      existingHighlight.remove();
    }

    // Create highlight overlay
    const highlight = document.createElement('div');
    highlight.className = 'tour-highlight';

    const targetRect = target.getBoundingClientRect();
    highlight.style.position = 'fixed';
    highlight.style.top = `${targetRect.top - 4}px`;
    highlight.style.left = `${targetRect.left - 4}px`;
    highlight.style.width = `${targetRect.width + 8}px`;
    highlight.style.height = `${targetRect.height + 8}px`;
    highlight.style.zIndex = '10000';

    document.body.appendChild(highlight);

    // Scroll target into view
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  nextTourStep() {
    if (this.currentTourStep < this.tourSteps.length - 1) {
      this.currentTourStep++;
      this.showTourStep();
    } else {
      this.endTour();
    }
  }

  previousTourStep() {
    if (this.currentTourStep > 0) {
      this.currentTourStep--;
      this.showTourStep();
    }
  }

  endTour() {
    // Remove tour elements
    const tourOverlay = document.querySelector('.tour-overlay');
    const tourHighlight = document.querySelector('.tour-highlight');

    if (tourOverlay) tourOverlay.remove();
    if (tourHighlight) tourHighlight.remove();

    // Mark tour as completed
    localStorage.setItem('tourCompleted', 'true');

    // Show completion message
    this.showStatus('Tour completed! You can restart it anytime from the Help section.', 'success');
  }

  // Check if user should see tour on first visit
  checkFirstTimeUser() {
    const tourCompleted = localStorage.getItem('tourCompleted');
    const hasApiKey = this.elements.apiKey.value.trim().length > 0;

    if (!tourCompleted && !hasApiKey) {
      // Show tour suggestion for first-time users
      setTimeout(() => {
        if (confirm('Welcome to PromptBoost! Would you like to take a quick tour to learn about the key features?')) {
          this.startOnboardingTour();
        }
      }, 1000);
    }
  }
}

// Global reference for template management
let promptBoostOptions;

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  promptBoostOptions = new PromptBoostOptions();
});
