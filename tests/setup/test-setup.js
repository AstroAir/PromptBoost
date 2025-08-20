/**
 * Global test setup for PromptBoost extension tests
 * Sets up Chrome extension API mocks and common test utilities
 */

// Import Chrome API mocks
require('../mocks/chrome-api');

// Global test utilities
global.testUtils = {
  /**
   * Create a mock DOM element
   * @param {string} tagName - The tag name for the element
   * @param {Object} attributes - Attributes to set on the element
   * @returns {HTMLElement} Mock DOM element
   */
  createElement: (tagName, attributes = {}) => {
    const element = document.createElement(tagName);
    Object.keys(attributes).forEach(key => {
      element.setAttribute(key, attributes[key]);
    });
    return element;
  },

  /**
   * Create a mock text selection
   * @param {string} text - The selected text
   * @returns {Object} Mock selection object
   */
  createSelection: (text) => ({
    toString: () => text,
    rangeCount: text ? 1 : 0,
    getRangeAt: (_index) => ({
      startContainer: { nodeType: 3, textContent: text },
      endContainer: { nodeType: 3, textContent: text },
      startOffset: 0,
      endOffset: text.length,
      cloneContents: () => ({ textContent: text }),
      deleteContents: jest.fn(),
      insertNode: jest.fn()
    })
  }),

  /**
   * Wait for a specified amount of time
   * @param {number} ms - Milliseconds to wait
   * @returns {Promise} Promise that resolves after the specified time
   */
  wait: (ms) => new Promise(resolve => setTimeout(resolve, ms)),

  /**
   * Create a mock Chrome extension message
   * @param {string} type - Message type
   * @param {Object} data - Message data
   * @returns {Object} Mock message object
   */
  createMessage: (type, data = {}) => ({
    type,
    ...data
  }),

  /**
   * Create a mock Chrome tab
   * @param {number} id - Tab ID
   * @param {string} url - Tab URL
   * @returns {Object} Mock tab object
   */
  createTab: (id = 1, url = 'https://example.com') => ({
    id,
    url,
    title: 'Test Page',
    active: true,
    windowId: 1
  })
};

// Mock console methods for cleaner test output
global.console = {
  ...console,
  log: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  info: jest.fn(),
  debug: jest.fn()
};

// Mock window.getSelection
Object.defineProperty(window, 'getSelection', {
  writable: true,
  value: jest.fn(() => global.testUtils.createSelection(''))
});

// Mock document.execCommand
document.execCommand = jest.fn();

// Setup DOM environment
beforeEach(() => {
  // Clear document body
  document.body.innerHTML = '';

  // Reset all mocks
  jest.clearAllMocks();

  // Reset Chrome API mocks
  if (global.chrome) {
    Object.keys(global.chrome).forEach(api => {
      if (global.chrome[api] && typeof global.chrome[api].mockClear === 'function') {
        global.chrome[api].mockClear();
      }
    });
  }
});

// Cleanup after each test
afterEach(() => {
  // Clear any timers
  jest.clearAllTimers();

  // Clear any intervals
  jest.useRealTimers();
});
