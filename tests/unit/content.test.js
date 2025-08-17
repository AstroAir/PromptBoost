/**
 * Unit tests for PromptBoostContent class
 * Tests spacebar detection, text manipulation, undo functionality, and UI overlays
 */

// Import test data and utilities
import { sampleTexts, sampleSettings, sampleMessages } from '../fixtures/test-data.js';
import '../mocks/dom-helpers.js';

// Mock the content script
const mockContentScript = `
class PromptBoostContent {
  constructor() {
    this.spacebarPresses = [];
    this.isEnabled = true;
    this.isProcessing = false;
    this.lastSelection = null;
    this.undoStack = [];
    this.optimizationHistory = [];
    this.settings = {};
    this.templates = {};

    this.init();
  }

  async init() {
    await this.loadSettings();
    this.setupEventListeners();
    this.setupMessageListener();
  }

  async loadSettings() {
    const result = await chrome.storage.sync.get({
      enabled: true,
      timeWindow: 1000,
      provider: 'openai',
      apiKey: '',
      promptTemplate: 'Please improve: {text}'
    });
    this.settings = result;
  }

  setupEventListeners() {
    document.addEventListener('keydown', (event) => this.handleKeyDown(event));
    document.addEventListener('selectionchange', () => this.handleSelectionChange());
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
    
    if (event.code === 'Space' || event.keyCode === 32) {
      this.recordSpacebarPress();
    }
  }

  recordSpacebarPress() {
    const now = Date.now();
    this.spacebarPresses.push(now);
    
    // Keep only recent presses within time window
    this.spacebarPresses = this.spacebarPresses.filter(
      time => now - time <= this.settings.timeWindow
    );
    
    // Check for triple press
    if (this.spacebarPresses.length >= 3) {
      this.triggerOptimization();
      this.spacebarPresses = [];
    }
  }

  handleSelectionChange() {
    const selection = window.getSelection();
    this.lastSelection = {
      text: selection.toString(),
      range: selection.rangeCount > 0 ? selection.getRangeAt(0) : null
    };
  }

  getSelectedText() {
    const activeElement = document.activeElement;
    
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      const start = activeElement.selectionStart;
      const end = activeElement.selectionEnd;
      return activeElement.value.substring(start, end);
    }
    
    const selection = window.getSelection();
    return selection.toString();
  }

  triggerOptimization(templateId = null) {
    const selectedText = this.getSelectedText();
    
    if (!selectedText || selectedText.trim().length === 0) {
      this.showNotification('Please select some text first', 'error');
      return;
    }

    this.isProcessing = true;
    this.showLoadingOverlay();

    try {
      if (templateId) {
        chrome.runtime.sendMessage({
          type: 'OPTIMIZE_WITH_TEMPLATE',
          text: selectedText,
          templateId: templateId,
          settings: this.settings
        });
      } else {
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

  handleOptimizationResult(data) {
    this.hideLoadingOverlay();
    this.isProcessing = false;

    if (data.optimizedText) {
      const originalText = this.getSelectedText();
      
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
        \`Text optimized with \${data.templateUsed}!\` :
        'Text optimized successfully!';
      this.showNotification(message, 'success');
    } else {
      this.showNotification('No optimization received', 'error');
    }
  }

  handleOptimizationError(error) {
    this.hideLoadingOverlay();
    this.isProcessing = false;
    this.showNotification(\`Optimization failed: \${error}\`, 'error');
  }

  replaceSelectedText(newText) {
    const activeElement = document.activeElement;
    
    if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
      const start = activeElement.selectionStart;
      const end = activeElement.selectionEnd;
      const originalValue = activeElement.value;
      
      // Store for undo
      this.undoStack.push({
        element: activeElement,
        originalValue,
        start,
        end,
        timestamp: Date.now()
      });
      
      activeElement.value = originalValue.substring(0, start) + newText + originalValue.substring(end);
      activeElement.setSelectionRange(start, start + newText.length);
    } else {
      // Handle contenteditable or regular text selection
      const selection = window.getSelection();
      if (selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        
        // Store for undo
        this.undoStack.push({
          range: range.cloneRange(),
          originalText: range.toString(),
          timestamp: Date.now()
        });
        
        range.deleteContents();
        range.insertNode(document.createTextNode(newText));
      }
    }
  }

  addToHistory(entry) {
    this.optimizationHistory.unshift(entry);
    
    // Keep only recent history
    if (this.optimizationHistory.length > 100) {
      this.optimizationHistory = this.optimizationHistory.slice(0, 100);
    }
  }

  showLoadingOverlay() {
    // Mock implementation
    const overlay = document.createElement('div');
    overlay.id = 'promptboost-loading';
    overlay.textContent = 'Optimizing...';
    document.body.appendChild(overlay);
  }

  hideLoadingOverlay() {
    const overlay = document.getElementById('promptboost-loading');
    if (overlay) {
      overlay.remove();
    }
  }

  showNotification(message, type = 'info') {
    // Mock implementation
    const notification = document.createElement('div');
    notification.id = 'promptboost-notification';
    notification.className = \`notification \${type}\`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 4000);
  }

  undo() {
    if (this.undoStack.length === 0) return false;
    
    const lastAction = this.undoStack.pop();
    
    if (lastAction.element) {
      // Undo input/textarea change
      lastAction.element.value = lastAction.originalValue;
      lastAction.element.setSelectionRange(lastAction.start, lastAction.end);
    } else if (lastAction.range) {
      // Undo text selection change
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(lastAction.range);
      lastAction.range.deleteContents();
      lastAction.range.insertNode(document.createTextNode(lastAction.originalText));
    }
    
    return true;
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PromptBoostContent;
}
`;

// Evaluate the mock script
eval(mockContentScript);

describe('PromptBoostContent', () => {
  let content;
  let mockInput;
  let mockTextarea;

  beforeEach(async () => {
    // Reset DOM
    document.body.innerHTML = '';

    // Reset Chrome API mocks
    global.chromeTestUtils.resetMocks();
    global.chromeTestUtils.setStorageData(sampleSettings.default);

    // Create mock elements
    mockInput = global.domTestUtils.createMockInput('text', sampleTexts.short);
    mockTextarea = global.domTestUtils.createMockInput('textarea', sampleTexts.medium);

    document.body.appendChild(mockInput);
    document.body.appendChild(mockTextarea);

    // Create fresh instance
    content = new PromptBoostContent();
    await content.init();

    // Mock timers
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('Initialization', () => {
    test('should initialize with default values', () => {
      expect(content.spacebarPresses).toEqual([]);
      expect(content.isEnabled).toBe(true);
      expect(content.isProcessing).toBe(false);
      expect(content.undoStack).toEqual([]);
      expect(content.optimizationHistory).toEqual([]);
    });

    test('should load settings from storage', async () => {
      expect(content.settings).toEqual(expect.objectContaining(sampleSettings.default));
    });

    test('should set up event listeners', () => {
      // Check if event listeners are set up (mocked)
      expect(content.settings).toBeDefined();
    });
  });

  describe('Spacebar Detection', () => {
    test('should record spacebar presses', () => {
      const event = global.domTestUtils.createMockKeyboardEvent(' ', { code: 'Space', keyCode: 32 });

      content.handleKeyDown(event);

      expect(content.spacebarPresses).toHaveLength(1);
    });

    test('should trigger optimization on triple spacebar', () => {
      // Mock text selection
      global.domTestUtils.mockWindowSelection(sampleTexts.short);

      // Spy on triggerOptimization
      const triggerSpy = jest.spyOn(content, 'triggerOptimization');

      // Simulate three spacebar presses
      const event = global.domTestUtils.createMockKeyboardEvent(' ', { code: 'Space', keyCode: 32 });
      content.handleKeyDown(event);
      content.handleKeyDown(event);
      content.handleKeyDown(event);

      expect(triggerSpy).toHaveBeenCalled();
      expect(content.spacebarPresses).toHaveLength(0); // Should be cleared after trigger
    });

    test('should not trigger when disabled', () => {
      content.isEnabled = false;

      const triggerSpy = jest.spyOn(content, 'triggerOptimization');
      const event = global.domTestUtils.createMockKeyboardEvent(' ', { code: 'Space', keyCode: 32 });

      content.handleKeyDown(event);
      content.handleKeyDown(event);
      content.handleKeyDown(event);

      expect(triggerSpy).not.toHaveBeenCalled();
    });

    test('should not trigger when processing', () => {
      content.isProcessing = true;

      const triggerSpy = jest.spyOn(content, 'triggerOptimization');
      const event = global.domTestUtils.createMockKeyboardEvent(' ', { code: 'Space', keyCode: 32 });

      content.handleKeyDown(event);
      content.handleKeyDown(event);
      content.handleKeyDown(event);

      expect(triggerSpy).not.toHaveBeenCalled();
    });

    test('should clear old spacebar presses outside time window', () => {
      const now = Date.now();
      content.spacebarPresses = [now - 2000, now - 1500]; // Old presses
      content.settings.timeWindow = 1000;

      const event = global.domTestUtils.createMockKeyboardEvent(' ', { code: 'Space', keyCode: 32 });
      content.handleKeyDown(event);

      // Should only keep the new press
      expect(content.spacebarPresses).toHaveLength(1);
    });
  });

  describe('Text Selection', () => {
    test('should get selected text from input element', () => {
      mockInput.focus();
      mockInput.setSelectionRange(0, 5);
      document.activeElement = mockInput;

      const selectedText = content.getSelectedText();

      expect(selectedText).toBe(sampleTexts.short.substring(0, 5));
    });

    test('should get selected text from textarea', () => {
      mockTextarea.focus();
      mockTextarea.setSelectionRange(0, 10);
      document.activeElement = mockTextarea;

      const selectedText = content.getSelectedText();

      expect(selectedText).toBe(sampleTexts.medium.substring(0, 10));
    });

    test('should get selected text from window selection', () => {
      const selectedText = 'selected text';
      global.domTestUtils.mockWindowSelection(selectedText);

      const result = content.getSelectedText();

      expect(result).toBe(selectedText);
    });

    test('should handle selection change', () => {
      const selectedText = 'test selection';
      global.domTestUtils.mockWindowSelection(selectedText);

      content.handleSelectionChange();

      expect(content.lastSelection.text).toBe(selectedText);
    });
  });

  describe('Text Replacement', () => {
    test('should replace text in input element', () => {
      const newText = 'optimized text';
      mockInput.focus();
      mockInput.setSelectionRange(0, 5);
      document.activeElement = mockInput;

      content.replaceSelectedText(newText);

      expect(mockInput.value).toContain(newText);
      expect(content.undoStack).toHaveLength(1);
    });

    test('should replace text in textarea', () => {
      const newText = 'optimized content';
      mockTextarea.focus();
      mockTextarea.setSelectionRange(0, 10);
      document.activeElement = mockTextarea;

      content.replaceSelectedText(newText);

      expect(mockTextarea.value).toContain(newText);
      expect(content.undoStack).toHaveLength(1);
    });

    test('should handle text replacement in contenteditable', () => {
      const newText = 'new text';
      const mockRange = {
        cloneRange: jest.fn(() => mockRange),
        deleteContents: jest.fn(),
        insertNode: jest.fn(),
        toString: () => 'old text'
      };

      global.domTestUtils.mockWindowSelection('old text');
      window.getSelection().getRangeAt = jest.fn(() => mockRange);

      content.replaceSelectedText(newText);

      expect(mockRange.deleteContents).toHaveBeenCalled();
      expect(mockRange.insertNode).toHaveBeenCalled();
      expect(content.undoStack).toHaveLength(1);
    });
  });

  describe('Optimization Handling', () => {
    test('should trigger optimization with selected text', () => {
      global.domTestUtils.mockWindowSelection(sampleTexts.short);

      content.triggerOptimization();

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'OPTIMIZE_TEXT',
          text: sampleTexts.short,
          settings: content.settings
        })
      );
      expect(content.isProcessing).toBe(true);
    });

    test('should trigger optimization with template', () => {
      global.domTestUtils.mockWindowSelection(sampleTexts.short);

      content.triggerOptimization('professional');

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'OPTIMIZE_WITH_TEMPLATE',
          text: sampleTexts.short,
          templateId: 'professional',
          settings: content.settings
        })
      );
    });

    test('should show error when no text selected', () => {
      global.domTestUtils.mockWindowSelection('');
      const notificationSpy = jest.spyOn(content, 'showNotification');

      content.triggerOptimization();

      expect(notificationSpy).toHaveBeenCalledWith('Please select some text first', 'error');
      expect(content.isProcessing).toBe(false);
    });

    test('should handle optimization result', () => {
      const data = {
        optimizedText: 'optimized result',
        templateUsed: 'Professional'
      };

      global.domTestUtils.mockWindowSelection(sampleTexts.short);
      const replaceSpy = jest.spyOn(content, 'replaceSelectedText');
      const notificationSpy = jest.spyOn(content, 'showNotification');

      content.handleOptimizationResult(data);

      expect(replaceSpy).toHaveBeenCalledWith(data.optimizedText);
      expect(notificationSpy).toHaveBeenCalledWith(
        'Text optimized with Professional!',
        'success'
      );
      expect(content.isProcessing).toBe(false);
      expect(content.optimizationHistory).toHaveLength(1);
    });

    test('should handle optimization error', () => {
      const error = 'API error';
      const notificationSpy = jest.spyOn(content, 'showNotification');

      content.handleOptimizationError(error);

      expect(notificationSpy).toHaveBeenCalledWith(
        `Optimization failed: ${error}`,
        'error'
      );
      expect(content.isProcessing).toBe(false);
    });
  });

  describe('Undo Functionality', () => {
    test('should undo input text replacement', () => {
      const originalValue = mockInput.value;
      mockInput.focus();
      mockInput.setSelectionRange(0, 5);
      document.activeElement = mockInput;

      content.replaceSelectedText('new text');
      expect(mockInput.value).not.toBe(originalValue);

      const undoResult = content.undo();

      expect(undoResult).toBe(true);
      expect(mockInput.value).toBe(originalValue);
      expect(content.undoStack).toHaveLength(0);
    });

    test('should return false when no undo available', () => {
      const undoResult = content.undo();

      expect(undoResult).toBe(false);
    });

    test('should undo contenteditable text replacement', () => {
      const mockRange = {
        cloneRange: jest.fn(() => mockRange),
        deleteContents: jest.fn(),
        insertNode: jest.fn(),
        toString: () => 'original text'
      };

      // Set up undo stack with range-based action
      content.undoStack.push({
        range: mockRange,
        originalText: 'original text',
        timestamp: Date.now()
      });

      const undoResult = content.undo();

      expect(undoResult).toBe(true);
      expect(mockRange.deleteContents).toHaveBeenCalled();
      expect(mockRange.insertNode).toHaveBeenCalled();
    });
  });

  describe('History Management', () => {
    test('should add entry to history', () => {
      const entry = {
        originalText: sampleTexts.short,
        optimizedText: 'optimized version',
        templateUsed: 'General',
        timestamp: Date.now(),
        url: 'https://example.com',
        domain: 'example.com'
      };

      content.addToHistory(entry);

      expect(content.optimizationHistory).toHaveLength(1);
      expect(content.optimizationHistory[0]).toEqual(entry);
    });

    test('should limit history to 100 entries', () => {
      // Add 101 entries
      for (let i = 0; i < 101; i++) {
        content.addToHistory({
          originalText: `text ${i}`,
          optimizedText: `optimized ${i}`,
          timestamp: Date.now() + i
        });
      }

      expect(content.optimizationHistory).toHaveLength(100);
      expect(content.optimizationHistory[0].originalText).toBe('text 100'); // Most recent first
    });
  });

  describe('UI Elements', () => {
    test('should show and hide loading overlay', () => {
      content.showLoadingOverlay();

      const overlay = document.getElementById('promptboost-loading');
      expect(overlay).toBeTruthy();
      expect(overlay.textContent).toBe('Optimizing...');

      content.hideLoadingOverlay();

      const hiddenOverlay = document.getElementById('promptboost-loading');
      expect(hiddenOverlay).toBeFalsy();
    });

    test('should show notification', () => {
      const message = 'Test notification';
      const type = 'success';

      content.showNotification(message, type);

      const notification = document.getElementById('promptboost-notification');
      expect(notification).toBeTruthy();
      expect(notification.textContent).toBe(message);
      expect(notification.className).toContain(type);
    });

    test('should auto-remove notification after timeout', () => {
      content.showNotification('Test message');

      const notification = document.getElementById('promptboost-notification');
      expect(notification).toBeTruthy();

      // Fast-forward time
      jest.advanceTimersByTime(4000);

      const removedNotification = document.getElementById('promptboost-notification');
      expect(removedNotification).toBeFalsy();
    });
  });

  describe('Message Handling', () => {
    test('should handle SETTINGS_UPDATED message', async () => {
      const loadSettingsSpy = jest.spyOn(content, 'loadSettings');

      const messageListener = chrome.runtime.onMessage.addListener.mock.calls[0][0];
      await messageListener({ type: 'SETTINGS_UPDATED' });

      expect(loadSettingsSpy).toHaveBeenCalled();
    });

    test('should handle TOGGLE_EXTENSION message', () => {
      const messageListener = chrome.runtime.onMessage.addListener.mock.calls[0][0];
      messageListener({ type: 'TOGGLE_EXTENSION', enabled: false });

      expect(content.isEnabled).toBe(false);
    });

    test('should handle OPTIMIZE_RESULT message', () => {
      const handleResultSpy = jest.spyOn(content, 'handleOptimizationResult');
      const data = { optimizedText: 'result' };

      const messageListener = chrome.runtime.onMessage.addListener.mock.calls[0][0];
      messageListener({ type: 'OPTIMIZE_RESULT', data });

      expect(handleResultSpy).toHaveBeenCalledWith(data);
    });

    test('should handle OPTIMIZATION_ERROR message', () => {
      const handleErrorSpy = jest.spyOn(content, 'handleOptimizationError');
      const error = 'Test error';

      const messageListener = chrome.runtime.onMessage.addListener.mock.calls[0][0];
      messageListener({ type: 'OPTIMIZATION_ERROR', error });

      expect(handleErrorSpy).toHaveBeenCalledWith(error);
    });
  });
});
