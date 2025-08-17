/**
 * @fileoverview PromptBoost Content Script
 * Handles triple spacebar detection, text selection and replacement,
 * undo functionality, and user interface interactions on web pages.
 *
 * @author PromptBoost Team
 * @version 1.0.0
 * @since 1.0.0
 */

/**
 * Main content script class for PromptBoost extension.
 * Manages text selection, spacebar detection, optimization triggers,
 * and user interface elements injected into web pages.
 *
 * @class PromptBoostContent
 * @since 1.0.0
 */
class PromptBoostContent {
  /**
   * Creates an instance of PromptBoostContent.
   * Initializes all necessary properties and starts the content script.
   *
   * @constructor
   * @since 1.0.0
   */
  constructor() {
    /** @type {number[]} Array of spacebar press timestamps */
    this.spacebarPresses = [];

    /** @type {boolean} Whether the extension is currently enabled */
    this.isEnabled = true;

    /** @type {boolean} Whether an optimization is currently in progress */
    this.isProcessing = false;

    /** @type {Object|null} Last text selection information */
    this.lastSelection = null;

    /** @type {Array} Stack of actions that can be undone */
    this.undoStack = [];

    /** @type {Array} History of optimization operations */
    this.optimizationHistory = [];

    /** @type {Object} Extension settings loaded from storage */
    this.settings = {};

    /** @type {Object} Available prompt templates */
    this.templates = {};

    this.init();
  }

  /**
   * Initializes the content script by loading settings, history, and setting up event listeners.
   * This method is called automatically during construction.
   *
   * @method init
   * @returns {Promise<void>} Resolves when initialization is complete
   * @since 1.0.0
   * @async
   */
  async init() {
    // Load settings and history
    await this.loadSettings();
    await this.loadHistoryFromStorage();

    // Set up event listeners
    this.setupEventListeners();

    // Listen for messages from background script
    this.setupMessageListener();

    console.log('PromptBoost content script initialized');
  }

  /**
   * Loads extension settings from Chrome storage.
   * Sets default values for any missing settings.
   *
   * @method loadSettings
   * @returns {Promise<void>} Resolves when settings are loaded
   * @since 1.0.0
   * @async
   */
  async loadSettings() {
    try {
      const result = await chrome.storage.sync.get({
        enabled: true,
        timeWindow: 1000,
        provider: 'openai',
        apiKey: '',
        apiEndpoint: 'https://api.openai.com/v1/chat/completions',
        model: 'gpt-3.5-turbo',
        promptTemplate: 'Please improve and optimize the following text while maintaining its original meaning and tone:\n\n{text}',
        keyboardShortcut: 'Ctrl+Shift+Space',
        selectedTemplate: 'general',
        quickTemplateSelection: true,
        templates: {}
      });

      this.settings = result;
      this.isEnabled = result.enabled;
      this.templates = result.templates;
    } catch (error) {
      console.error('Failed to load settings:', error);
    }
  }

  setupEventListeners() {
    // Listen for keydown events
    document.addEventListener('keydown', this.handleKeyDown.bind(this), true);

    // Listen for keyboard shortcuts
    document.addEventListener('keydown', this.handleKeyboardShortcut.bind(this), true);

    // Listen for selection changes
    document.addEventListener('selectionchange', this.handleSelectionChange.bind(this));

    // Listen for context menu (right-click)
    document.addEventListener('contextmenu', this.handleContextMenu.bind(this), true);

    // Listen for clicks to hide context menu
    document.addEventListener('click', this.hideContextMenu.bind(this), true);
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case 'SETTINGS_UPDATED':
          this.loadSettings();
          break;
        case 'TOGGLE_EXTENSION':
          this.isEnabled = message.enabled;
          break;
        case 'OPTIMIZE_RESULT':
          this.handleOptimizationResult(message.data);
          break;
        case 'OPTIMIZATION_ERROR':
          this.handleOptimizationError(message.error);
          break;
      }
    });
  }

  handleKeyDown(event) {
    if (!this.isEnabled || this.isProcessing) return;
    
    // Check for spacebar (keyCode 32 or key ' ')
    if (event.code === 'Space' || event.keyCode === 32) {
      this.recordSpacebarPress();
    }
  }

  handleKeyboardShortcut(event) {
    if (!this.isEnabled) return;

    // Optimization shortcut: Ctrl+Shift+Space
    if (event.ctrlKey && event.shiftKey && event.code === 'Space' && !this.isProcessing) {
      event.preventDefault();
      this.triggerOptimization();
    }

    // Template selector shortcut: Ctrl+Shift+T
    if (event.ctrlKey && event.shiftKey && event.code === 'KeyT' && !this.isProcessing) {
      const selectedText = this.getSelectedText();
      if (selectedText && selectedText.trim().length > 0) {
        event.preventDefault();
        this.showTemplateSelector(selectedText);
      }
    }

    // Undo shortcut: Ctrl+Z (only for PromptBoost changes)
    if (event.ctrlKey && !event.shiftKey && event.code === 'KeyZ' && this.undoStack.length > 0) {
      // Check if the last change was recent (within 30 seconds)
      const lastChange = this.undoStack[this.undoStack.length - 1];
      if (lastChange && Date.now() - lastChange.timestamp < 30000) {
        event.preventDefault();
        this.undoLastChange();
      }
    }

    // Escape to close template selector or context menu
    if (event.code === 'Escape') {
      this.hideTemplateSelector();
      this.hideContextMenu();
    }
  }

  recordSpacebarPress() {
    const now = Date.now();
    this.spacebarPresses.push(now);
    
    // Remove old presses outside the time window
    this.spacebarPresses = this.spacebarPresses.filter(
      timestamp => now - timestamp <= this.settings.timeWindow
    );
    
    // Check if we have 3 presses within the time window
    if (this.spacebarPresses.length >= 3) {
      this.triggerOptimization();
      this.spacebarPresses = []; // Reset
    }
  }

  handleSelectionChange() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
      this.lastSelection = {
        text: selection.toString(),
        range: selection.getRangeAt(0).cloneRange(),
        element: this.getActiveElement()
      };
    }
  }

  getActiveElement() {
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA' || activeEl.contentEditable === 'true')) {
      return activeEl;
    }
    return null;
  }

  async triggerOptimization(templateId = null) {
    if (this.isProcessing) return;

    const selectedText = this.getSelectedText();
    if (!selectedText || selectedText.trim().length === 0) {
      this.showNotification('Please select some text first', 'error');
      return;
    }

    if (!this.settings.apiKey) {
      this.showNotification('Please configure your API key in extension settings', 'error');
      return;
    }

    // Show template selection if enabled and no specific template provided
    if (!templateId && this.settings.quickTemplateSelection && Object.keys(this.templates).length > 0) {
      this.showTemplateSelector(selectedText);
      return;
    }

    this.isProcessing = true;
    this.showLoadingOverlay();
    this.showTriggerIndicator();

    try {
      if (templateId) {
        // Use specific template
        chrome.runtime.sendMessage({
          type: 'OPTIMIZE_WITH_TEMPLATE',
          text: selectedText,
          templateId: templateId,
          settings: this.settings
        });
      } else {
        // Use default template
        chrome.runtime.sendMessage({
          type: 'OPTIMIZE_TEXT',
          text: selectedText,
          settings: this.settings
        });
      }
    } catch (error) {
      this.handleOptimizationError(error.message);
    }
  }

  getSelectedText() {
    const selection = window.getSelection();
    if (selection.rangeCount > 0 && !selection.isCollapsed) {
      return selection.toString();
    }
    
    // Check for text in input fields
    const activeEl = document.activeElement;
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      const start = activeEl.selectionStart;
      const end = activeEl.selectionEnd;
      if (start !== end) {
        return activeEl.value.substring(start, end);
      }
    }
    
    return '';
  }

  handleOptimizationResult(data) {
    this.hideLoadingOverlay();
    this.isProcessing = false;

    if (data.optimizedText) {
      const originalText = this.getSelectedText();

      // Add to history
      this.addToHistory({
        originalText,
        optimizedText: data.optimizedText,
        templateUsed: data.templateUsed || 'Default',
        timestamp: Date.now(),
        url: window.location.href,
        domain: window.location.hostname
      });

      this.replaceSelectedText(data.optimizedText);

      const message = data.templateUsed ?
        `Text optimized with ${data.templateUsed}!` :
        'Text optimized successfully!';
      this.showNotification(message, 'success');
    } else {
      this.showNotification('No optimization received', 'error');
    }
  }

  addToHistory(historyItem) {
    this.optimizationHistory.unshift(historyItem);

    // Limit history to 100 items
    if (this.optimizationHistory.length > 100) {
      this.optimizationHistory = this.optimizationHistory.slice(0, 100);
    }

    // Save to storage
    this.saveHistoryToStorage();
  }

  async saveHistoryToStorage() {
    try {
      await chrome.storage.local.set({
        optimizationHistory: this.optimizationHistory
      });
    } catch (error) {
      console.error('Failed to save history:', error);
    }
  }

  async loadHistoryFromStorage() {
    try {
      const result = await chrome.storage.local.get(['optimizationHistory']);
      this.optimizationHistory = result.optimizationHistory || [];
    } catch (error) {
      console.error('Failed to load history:', error);
    }
  }

  handleOptimizationError(error) {
    this.hideLoadingOverlay();
    this.isProcessing = false;
    this.showNotification(`Optimization failed: ${error}`, 'error');
  }

  replaceSelectedText(newText) {
    const selection = window.getSelection();
    const activeEl = document.activeElement;

    // Store for undo
    const originalText = this.getSelectedText();
    const undoData = {
      originalText,
      newText,
      element: activeEl,
      timestamp: Date.now(),
      selectionStart: null,
      selectionEnd: null,
      range: null
    };

    // Store additional context for undo
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      undoData.selectionStart = activeEl.selectionStart;
      undoData.selectionEnd = activeEl.selectionEnd;
    } else if (selection.rangeCount > 0) {
      undoData.range = selection.getRangeAt(0).cloneRange();
    }

    this.undoStack.push(undoData);

    // Limit undo stack size
    if (this.undoStack.length > 10) {
      this.undoStack.shift();
    }

    // Handle different types of elements
    if (activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA')) {
      this.replaceInInputField(activeEl, newText);
    } else if (selection.rangeCount > 0) {
      this.replaceInSelection(selection, newText);
    }

    // Show undo notification
    this.showUndoNotification();
  }

  showUndoNotification() {
    const notification = document.createElement('div');
    notification.className = 'promptboost-undo-notification';
    notification.innerHTML = `
      <span>Text optimized!</span>
      <button class="promptboost-undo-btn" onclick="window.promptBoostInstance?.undoLastChange()">Undo</button>
    `;
    notification.id = 'promptboost-undo';

    // Remove existing undo notification
    const existing = document.getElementById('promptboost-undo');
    if (existing) existing.remove();

    document.body.appendChild(notification);

    // Auto-hide after 8 seconds
    setTimeout(() => {
      const el = document.getElementById('promptboost-undo');
      if (el) el.remove();
    }, 8000);
  }

  undoLastChange() {
    if (this.undoStack.length === 0) {
      this.showNotification('Nothing to undo', 'error');
      return;
    }

    const lastChange = this.undoStack.pop();
    const { originalText, element, selectionStart, selectionEnd, range } = lastChange;

    try {
      if (element && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA')) {
        // Restore in input field
        const currentStart = element.selectionStart;
        const currentEnd = element.selectionEnd;
        const value = element.value;

        // Find the optimized text and replace it back
        const beforeText = value.substring(0, currentStart - (currentEnd - currentStart));
        const afterText = value.substring(currentEnd);

        element.value = beforeText + originalText + afterText;
        element.selectionStart = selectionStart;
        element.selectionEnd = selectionStart + originalText.length;

        element.dispatchEvent(new Event('input', { bubbles: true }));
      } else if (range) {
        // Restore in content editable or regular selection
        const selection = window.getSelection();
        selection.removeAllRanges();
        selection.addRange(range);

        if (selection.rangeCount > 0) {
          const currentRange = selection.getRangeAt(0);
          currentRange.deleteContents();
          currentRange.insertNode(document.createTextNode(originalText));
        }
      }

      this.showNotification('Change undone', 'success');

      // Hide undo notification
      const undoNotification = document.getElementById('promptboost-undo');
      if (undoNotification) undoNotification.remove();

    } catch (error) {
      console.error('Undo failed:', error);
      this.showNotification('Undo failed', 'error');
    }
  }

  replaceInInputField(element, newText) {
    const start = element.selectionStart;
    const end = element.selectionEnd;
    const value = element.value;
    
    element.value = value.substring(0, start) + newText + value.substring(end);
    element.selectionStart = start;
    element.selectionEnd = start + newText.length;
    
    // Trigger input event for frameworks
    element.dispatchEvent(new Event('input', { bubbles: true }));
  }

  replaceInSelection(selection, newText) {
    if (selection.rangeCount === 0) return;
    
    const range = selection.getRangeAt(0);
    range.deleteContents();
    range.insertNode(document.createTextNode(newText));
    
    // Clear selection
    selection.removeAllRanges();
  }

  showLoadingOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'promptboost-loading-overlay';
    overlay.innerHTML = `
      <div class="promptboost-loading-content">
        <div class="promptboost-spinner"></div>
        <p class="promptboost-loading-text">Optimizing text with AI...</p>
      </div>
    `;
    overlay.id = 'promptboost-loading';
    document.body.appendChild(overlay);
  }

  hideLoadingOverlay() {
    const overlay = document.getElementById('promptboost-loading');
    if (overlay) {
      overlay.remove();
    }
  }

  showTriggerIndicator() {
    const indicator = document.createElement('div');
    indicator.className = 'promptboost-trigger-indicator';
    indicator.textContent = 'PromptBoost Activated!';
    indicator.id = 'promptboost-indicator';
    document.body.appendChild(indicator);
    
    setTimeout(() => {
      const el = document.getElementById('promptboost-indicator');
      if (el) el.remove();
    }, 2000);
  }

  showTemplateSelector(selectedText) {
    const selector = document.createElement('div');
    selector.className = 'promptboost-template-selector';
    selector.id = 'promptboost-template-selector';

    // Group templates by category
    const categories = {};
    Object.values(this.templates).forEach(template => {
      const category = template.category || 'Other';
      if (!categories[category]) categories[category] = [];
      categories[category].push(template);
    });

    let html = `
      <div class="promptboost-template-content">
        <div class="promptboost-template-header">
          <h3>Choose Template</h3>
          <button class="promptboost-template-close" onclick="window.promptBoostInstance?.hideTemplateSelector()">×</button>
        </div>
        <div class="promptboost-template-preview">
          <strong>Selected text:</strong> "${selectedText.substring(0, 100)}${selectedText.length > 100 ? '...' : ''}"
        </div>
        <div class="promptboost-template-categories">
    `;

    Object.entries(categories).forEach(([category, templates]) => {
      html += `<div class="promptboost-template-category">
        <h4>${category}</h4>
        <div class="promptboost-template-list">`;

      templates.forEach(template => {
        html += `
          <div class="promptboost-template-item" onclick="window.promptBoostInstance?.selectTemplate('${template.id}', '${selectedText.replace(/'/g, "\\'")}')">
            <div class="promptboost-template-name">${template.name}</div>
            <div class="promptboost-template-description">${template.description}</div>
          </div>
        `;
      });

      html += `</div></div>`;
    });

    html += `
        </div>
        <div class="promptboost-template-actions">
          <button class="promptboost-btn-secondary" onclick="window.promptBoostInstance?.selectTemplate('general', '${selectedText.replace(/'/g, "\\'")}')">Use Default</button>
          <button class="promptboost-btn-secondary" onclick="window.promptBoostInstance?.hideTemplateSelector()">Cancel</button>
        </div>
      </div>
    `;

    selector.innerHTML = html;

    // Remove existing selector
    const existing = document.getElementById('promptboost-template-selector');
    if (existing) existing.remove();

    document.body.appendChild(selector);
  }

  hideTemplateSelector() {
    const selector = document.getElementById('promptboost-template-selector');
    if (selector) selector.remove();
  }

  selectTemplate(templateId, selectedText) {
    this.hideTemplateSelector();
    this.triggerOptimization(templateId);
  }

  handleContextMenu(event) {
    // Only show context menu if text is selected and extension is enabled
    if (!this.isEnabled || this.isProcessing) return;

    const selectedText = this.getSelectedText();
    if (!selectedText || selectedText.trim().length === 0) return;

    // Don't interfere with existing context menus on form elements
    const target = event.target;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

    event.preventDefault();
    this.showContextMenu(event.pageX, event.pageY, selectedText);
  }

  showContextMenu(x, y, selectedText) {
    this.hideContextMenu(); // Remove any existing menu

    if (!this.templates || Object.keys(this.templates).length === 0) {
      // Fallback to simple optimization
      this.triggerOptimization();
      return;
    }

    const menu = document.createElement('div');
    menu.className = 'promptboost-context-menu';
    menu.id = 'promptboost-context-menu';

    // Group templates by category
    const categories = {};
    Object.values(this.templates).forEach(template => {
      const category = template.category || 'Other';
      if (!categories[category]) categories[category] = [];
      categories[category].push(template);
    });

    let html = '<div class="promptboost-context-header">PromptBoost</div>';

    // Add quick actions first
    html += `
      <div class="promptboost-context-item" onclick="window.promptBoostInstance?.triggerOptimization()">
        <span class="promptboost-context-icon">⚡</span>
        <span>Quick Optimize</span>
      </div>
      <div class="promptboost-context-divider"></div>
    `;

    // Add template categories
    Object.entries(categories).forEach(([category, templates]) => {
      if (templates.length === 1) {
        const template = templates[0];
        html += `
          <div class="promptboost-context-item" onclick="window.promptBoostInstance?.selectTemplate('${template.id}', '${selectedText.replace(/'/g, "\\'")}')">
            <span class="promptboost-context-icon">📝</span>
            <span>${template.name}</span>
          </div>
        `;
      } else {
        html += `<div class="promptboost-context-category">${category}</div>`;
        templates.forEach(template => {
          html += `
            <div class="promptboost-context-item promptboost-context-sub" onclick="window.promptBoostInstance?.selectTemplate('${template.id}', '${selectedText.replace(/'/g, "\\'")}')">
              <span>${template.name}</span>
            </div>
          `;
        });
      }
    });

    menu.innerHTML = html;

    // Position the menu
    menu.style.left = x + 'px';
    menu.style.top = y + 'px';

    document.body.appendChild(menu);

    // Adjust position if menu goes off screen
    const rect = menu.getBoundingClientRect();
    if (rect.right > window.innerWidth) {
      menu.style.left = (x - rect.width) + 'px';
    }
    if (rect.bottom > window.innerHeight) {
      menu.style.top = (y - rect.height) + 'px';
    }
  }

  hideContextMenu() {
    const menu = document.getElementById('promptboost-context-menu');
    if (menu) menu.remove();
  }

  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `promptboost-notification ${type}`;
    notification.textContent = message;
    notification.id = 'promptboost-notification';

    // Remove existing notification
    const existing = document.getElementById('promptboost-notification');
    if (existing) existing.remove();

    document.body.appendChild(notification);

    setTimeout(() => {
      const el = document.getElementById('promptboost-notification');
      if (el) el.remove();
    }, 4000);
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.promptBoostInstance = new PromptBoostContent();
  });
} else {
  window.promptBoostInstance = new PromptBoostContent();
}
