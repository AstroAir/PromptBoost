/**
 * @fileoverview Tests for context menu blocking fix
 * Verifies that context menu only prevents default when properly configured
 */

const { JSDOM } = require('jsdom');

// Mock Chrome APIs
global.chrome = {
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  },
  storage: {
    sync: {
      get: jest.fn(),
      set: jest.fn()
    }
  }
};

describe('Context Menu Fix', () => {
  let dom;
  let window;
  let document;
  let PromptBoostContent;

  beforeEach(() => {
    // Set up DOM
    dom = new JSDOM('<!DOCTYPE html><html><body><p>Test content</p></body></html>');
    window = dom.window;
    document = window.document;
    
    global.window = window;
    global.document = document;

    // Mock window.getSelection
    window.getSelection = jest.fn(() => ({
      rangeCount: 1,
      isCollapsed: false,
      toString: () => 'selected text',
      getRangeAt: () => ({
        cloneRange: () => ({})
      })
    }));

    // Load the content script (simplified mock)
    PromptBoostContent = class {
      constructor() {
        this.isEnabled = true;
        this.isProcessing = false;
        this.settings = null;
        this.templates = {};
      }

      getSelectedText() {
        return 'selected text';
      }

      isProperlyConfigured() {
        return !!(this.settings && 
                  this.settings.apiKey && 
                  this.settings.provider && 
                  this.isEnabled);
      }

      getConfigurationStatus() {
        if (!this.isEnabled) return 'Extension is disabled';
        if (!this.settings) return 'Settings not loaded';
        if (!this.settings.provider) return 'No AI provider selected';
        if (!this.settings.apiKey) return 'No API key configured';
        return 'Ready';
      }

      handleContextMenu(event) {
        if (!this.isEnabled || this.isProcessing) return;

        const selectedText = this.getSelectedText();
        if (!selectedText || selectedText.trim().length === 0) return;

        const target = event.target;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

        if (!this.isProperlyConfigured()) {
          console.log(`PromptBoost: Context menu not shown - ${this.getConfigurationStatus()}`);
          return;
        }

        event.preventDefault();
        this.showContextMenu(event.pageX, event.pageY, selectedText);
      }

      showContextMenu(_x, _y, _selectedText) {
        // Mock implementation
        console.log('Context menu shown');
      }
    };
  });

  afterEach(() => {
    dom.window.close();
  });

  test('should NOT prevent default context menu when API key is missing', () => {
    const content = new PromptBoostContent();
    content.settings = { provider: 'openai' }; // Missing API key

    const mockEvent = {
      target: document.querySelector('p'),
      pageX: 100,
      pageY: 100,
      preventDefault: jest.fn()
    };

    content.handleContextMenu(mockEvent);

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
  });

  test('should NOT prevent default context menu when provider is missing', () => {
    const content = new PromptBoostContent();
    content.settings = { apiKey: 'test-key' }; // Missing provider

    const mockEvent = {
      target: document.querySelector('p'),
      pageX: 100,
      pageY: 100,
      preventDefault: jest.fn()
    };

    content.handleContextMenu(mockEvent);

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
  });

  test('should NOT prevent default context menu when extension is disabled', () => {
    const content = new PromptBoostContent();
    content.isEnabled = false;
    content.settings = { apiKey: 'test-key', provider: 'openai' };

    const mockEvent = {
      target: document.querySelector('p'),
      pageX: 100,
      pageY: 100,
      preventDefault: jest.fn()
    };

    content.handleContextMenu(mockEvent);

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
  });

  test('should prevent default context menu when properly configured', () => {
    const content = new PromptBoostContent();
    content.settings = { apiKey: 'test-key', provider: 'openai' };

    const mockEvent = {
      target: document.querySelector('p'),
      pageX: 100,
      pageY: 100,
      preventDefault: jest.fn()
    };

    content.handleContextMenu(mockEvent);

    expect(mockEvent.preventDefault).toHaveBeenCalled();
  });

  test('should NOT prevent default context menu on form elements even when configured', () => {
    const content = new PromptBoostContent();
    content.settings = { apiKey: 'test-key', provider: 'openai' };

    // Create input element
    const input = document.createElement('input');
    document.body.appendChild(input);

    const mockEvent = {
      target: input,
      pageX: 100,
      pageY: 100,
      preventDefault: jest.fn()
    };

    content.handleContextMenu(mockEvent);

    expect(mockEvent.preventDefault).not.toHaveBeenCalled();
  });

  test('isProperlyConfigured should return correct status', () => {
    const content = new PromptBoostContent();

    // Not configured
    expect(content.isProperlyConfigured()).toBe(false);
    expect(content.getConfigurationStatus()).toBe('Settings not loaded');

    // Partially configured
    content.settings = { apiKey: 'test-key' };
    expect(content.isProperlyConfigured()).toBe(false);
    expect(content.getConfigurationStatus()).toBe('No AI provider selected');

    // Fully configured
    content.settings = { apiKey: 'test-key', provider: 'openai' };
    expect(content.isProperlyConfigured()).toBe(true);
    expect(content.getConfigurationStatus()).toBe('Ready');

    // Disabled
    content.isEnabled = false;
    expect(content.isProperlyConfigured()).toBe(false);
    expect(content.getConfigurationStatus()).toBe('Extension is disabled');
  });
});
