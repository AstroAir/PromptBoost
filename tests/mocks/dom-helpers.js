/**
 * DOM Helper Mocks and Utilities
 * Utilities for mocking DOM interactions in PromptBoost tests
 */

/**
 * Mock DOM utilities for testing
 */
global.domTestUtils = {
  /**
   * Create a mock input element with text selection capabilities
   * @param {string} type - Input type (text, textarea, etc.)
   * @param {string} value - Initial value
   * @returns {HTMLElement} Mock input element
   */
  createMockInput: (type = 'text', value = '') => {
    const element = document.createElement(type === 'textarea' ? 'textarea' : 'input');
    if (type !== 'textarea') {
      element.type = type;
    }
    element.value = value;

    // Mock selection methods
    element.setSelectionRange = jest.fn((start, end) => {
      element.selectionStart = start;
      element.selectionEnd = end;
    });

    element.select = jest.fn(() => {
      element.selectionStart = 0;
      element.selectionEnd = element.value.length;
    });

    // Mock focus/blur
    element.focus = jest.fn();
    element.blur = jest.fn();

    return element;
  },

  /**
   * Create a mock contenteditable element
   * @param {string} content - Initial content
   * @returns {HTMLElement} Mock contenteditable element
   */
  createMockContentEditable: (content = '') => {
    const element = document.createElement('div');
    element.contentEditable = 'true';
    element.textContent = content;

    // Mock selection methods
    element.focus = jest.fn();
    element.blur = jest.fn();

    return element;
  },

  /**
   * Create a mock text selection
   * @param {string} text - Selected text
   * @param {HTMLElement} container - Container element
   * @returns {Selection} Mock selection object
   */
  createMockSelection: (text = '', container = null) => {
    const range = {
      startContainer: container || { nodeType: 3, textContent: text },
      endContainer: container || { nodeType: 3, textContent: text },
      startOffset: 0,
      endOffset: text.length,
      collapsed: text.length === 0,
      commonAncestorContainer: container || document.body,

      cloneContents: jest.fn(() => {
        const fragment = document.createDocumentFragment();
        const textNode = document.createTextNode(text);
        fragment.appendChild(textNode);
        return fragment;
      }),

      deleteContents: jest.fn(),
      insertNode: jest.fn(),
      selectNode: jest.fn(),
      selectNodeContents: jest.fn(),
      setStart: jest.fn(),
      setEnd: jest.fn(),
      toString: () => text
    };

    const selection = {
      rangeCount: text ? 1 : 0,
      anchorNode: container,
      focusNode: container,
      anchorOffset: 0,
      focusOffset: text.length,
      isCollapsed: text.length === 0,
      type: text ? 'Range' : 'None',

      getRangeAt: jest.fn((index) => index === 0 ? range : null),
      addRange: jest.fn(),
      removeRange: jest.fn(),
      removeAllRanges: jest.fn(),
      collapse: jest.fn(),
      extend: jest.fn(),
      selectAllChildren: jest.fn(),
      toString: () => text
    };

    return selection;
  },

  /**
   * Mock window.getSelection to return a specific selection
   * @param {string} text - Text to be selected
   * @param {HTMLElement} container - Container element
   */
  mockWindowSelection: (text = '', container = null) => {
    const selection = domTestUtils.createMockSelection(text, container);
    window.getSelection = jest.fn(() => selection);
    return selection;
  },

  /**
   * Create a mock event object
   * @param {string} type - Event type
   * @param {Object} properties - Additional event properties
   * @returns {Event} Mock event object
   */
  createMockEvent: (type, properties = {}) => {
    const event = {
      type,
      target: null,
      currentTarget: null,
      preventDefault: jest.fn(),
      stopPropagation: jest.fn(),
      stopImmediatePropagation: jest.fn(),
      bubbles: true,
      cancelable: true,
      defaultPrevented: false,
      ...properties
    };

    return event;
  },

  /**
   * Create a mock keyboard event
   * @param {string} key - Key pressed
   * @param {Object} options - Event options
   * @returns {KeyboardEvent} Mock keyboard event
   */
  createMockKeyboardEvent: (key, options = {}) => {
    return domTestUtils.createMockEvent('keydown', {
      key,
      code: options.code || `Key${key.toUpperCase()}`,
      keyCode: options.keyCode || key.charCodeAt(0),
      which: options.which || key.charCodeAt(0),
      ctrlKey: options.ctrlKey || false,
      shiftKey: options.shiftKey || false,
      altKey: options.altKey || false,
      metaKey: options.metaKey || false,
      ...options
    });
  },

  /**
   * Simulate typing in an element
   * @param {HTMLElement} element - Target element
   * @param {string} text - Text to type
   */
  simulateTyping: (element, text) => {
    element.value = text;
    element.dispatchEvent(new Event('input', { bubbles: true }));
    element.dispatchEvent(new Event('change', { bubbles: true }));
  },

  /**
   * Simulate text selection in an element
   * @param {HTMLElement} element - Target element
   * @param {number} start - Selection start
   * @param {number} end - Selection end
   */
  simulateSelection: (element, start = 0, end = null) => {
    if (end === null) {
      end = element.value ? element.value.length : element.textContent.length;
    }

    if (element.setSelectionRange) {
      element.setSelectionRange(start, end);
    }

    // Trigger selection event
    element.dispatchEvent(new Event('select', { bubbles: true }));
    document.dispatchEvent(new Event('selectionchange', { bubbles: true }));
  },

  /**
   * Add element to DOM and return cleanup function
   * @param {HTMLElement} element - Element to add
   * @param {HTMLElement} parent - Parent element (defaults to document.body)
   * @returns {Function} Cleanup function
   */
  addToDOM: (element, parent = document.body) => {
    parent.appendChild(element);
    return () => {
      if (element.parentNode) {
        element.parentNode.removeChild(element);
      }
    };
  }
};

// Mock document.execCommand
document.execCommand = jest.fn((_command, _showUI, _value) => {
  // Simulate successful execution
  return true;
});

// Mock Range constructor
global.Range = jest.fn(() => ({
  setStart: jest.fn(),
  setEnd: jest.fn(),
  selectNode: jest.fn(),
  selectNodeContents: jest.fn(),
  deleteContents: jest.fn(),
  insertNode: jest.fn(),
  cloneContents: jest.fn(() => document.createDocumentFragment()),
  toString: jest.fn(() => '')
}));

// Mock Selection constructor
global.Selection = jest.fn(() => domTestUtils.createMockSelection());
