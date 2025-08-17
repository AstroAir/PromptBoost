/**
 * @fileoverview Jest setup file for PromptBoost tests
 * Configures global mocks and test environment setup.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

// Mock Chrome Extension APIs
global.chrome = {
  storage: {
    sync: {
      get: jest.fn().mockResolvedValue({}),
      set: jest.fn().mockResolvedValue(),
      remove: jest.fn().mockResolvedValue(),
      clear: jest.fn().mockResolvedValue()
    },
    local: {
      get: jest.fn().mockResolvedValue({}),
      set: jest.fn().mockResolvedValue(),
      remove: jest.fn().mockResolvedValue(),
      clear: jest.fn().mockResolvedValue()
    }
  },
  runtime: {
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    },
    getURL: jest.fn(path => `chrome-extension://test-id/${path}`),
    getManifest: jest.fn(() => ({
      version: '2.0.0',
      name: 'PromptBoost'
    }))
  },
  tabs: {
    query: jest.fn(),
    sendMessage: jest.fn(),
    create: jest.fn(),
    update: jest.fn()
  },
  notifications: {
    create: jest.fn(),
    clear: jest.fn()
  },
  action: {
    setBadgeText: jest.fn(),
    setBadgeBackgroundColor: jest.fn()
  }
};

// Mock browser APIs for cross-browser compatibility
global.browser = global.chrome;

// Mock fetch API
global.fetch = jest.fn();

// Mock performance API
global.performance = {
  now: jest.fn(() => Date.now()),
  mark: jest.fn(),
  measure: jest.fn()
};

// Mock TextEncoder/TextDecoder for streaming tests
global.TextEncoder = class TextEncoder {
  encode(str) {
    return new Uint8Array(Buffer.from(str, 'utf8'));
  }
};

global.TextDecoder = class TextDecoder {
  decode(buffer) {
    return Buffer.from(buffer).toString('utf8');
  }
};

// Mock Blob for file operations
global.Blob = class Blob {
  constructor(parts, options = {}) {
    this.parts = parts;
    this.type = options.type || '';
    this.size = parts.reduce((size, part) => size + part.length, 0);
  }
};

// Mock URL for URL operations
global.URL = class URL {
  constructor(url, base) {
    const fullUrl = base ? new URL(url, base).href : url;
    const parsed = new URL(fullUrl);
    
    this.href = parsed.href;
    this.protocol = parsed.protocol;
    this.hostname = parsed.hostname;
    this.pathname = parsed.pathname;
    this.search = parsed.search;
    this.searchParams = new URLSearchParams(parsed.search);
  }

  toString() {
    return this.href;
  }
};

// Mock URLSearchParams
global.URLSearchParams = class URLSearchParams {
  constructor(init) {
    this.params = new Map();
    
    if (typeof init === 'string') {
      init.replace(/^\?/, '').split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        if (key) this.params.set(decodeURIComponent(key), decodeURIComponent(value || ''));
      });
    }
  }

  get(name) {
    return this.params.get(name);
  }

  set(name, value) {
    this.params.set(name, value);
  }

  has(name) {
    return this.params.has(name);
  }

  delete(name) {
    this.params.delete(name);
  }

  toString() {
    const pairs = [];
    this.params.forEach((value, key) => {
      pairs.push(`${encodeURIComponent(key)}=${encodeURIComponent(value)}`);
    });
    return pairs.join('&');
  }
};

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
  length: 0,
  key: jest.fn()
};
global.localStorage = localStorageMock;

// Mock sessionStorage
global.sessionStorage = localStorageMock;

// Mock console methods for cleaner test output
const originalConsole = global.console;
global.console = {
  ...originalConsole,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn()
};

// Restore console for specific tests if needed
global.restoreConsole = () => {
  global.console = originalConsole;
};

// Mock crypto for ID generation
global.crypto = {
  getRandomValues: jest.fn(array => {
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 256);
    }
    return array;
  })
};

// Mock btoa/atob for base64 operations
global.btoa = jest.fn(str => Buffer.from(str, 'binary').toString('base64'));
global.atob = jest.fn(str => Buffer.from(str, 'base64').toString('binary'));

// Setup test utilities
global.testUtils = {
  // Create mock template
  createMockTemplate: (overrides = {}) => ({
    id: 'test-template',
    name: 'Test Template',
    description: 'Test description',
    category: 'test',
    template: 'Test content with {text}',
    version: 1,
    versions: [],
    isDefault: false,
    isCustom: true,
    metadata: {
      usage: 0,
      lastUsed: null,
      performance: {
        averageResponseTime: 0,
        successRate: 100
      }
    },
    createdAt: Date.now(),
    updatedAt: Date.now(),
    ...overrides
  }),

  // Create mock configuration
  createMockConfig: (overrides = {}) => ({
    enabled: true,
    timeWindow: 1000,
    provider: 'openai',
    apiKey: 'sk-test',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo',
    promptTemplate: 'Improve: {text}',
    keyboardShortcut: 'Ctrl+Shift+Space',
    quickTemplateSelection: true,
    selectedTemplate: 'general',
    advanced: {
      enableLogging: false,
      autoSaveHistory: true,
      maxHistoryItems: 100,
      requestTimeout: 30,
      retryAttempts: 3,
      showNotifications: true,
      notificationDuration: 4,
      maxTokens: 1000,
      temperature: 0.7
    },
    ...overrides
  }),

  // Create mock provider
  createMockProvider: (overrides = {}) => ({
    name: 'test-provider',
    displayName: 'Test Provider',
    isAuthenticated: false,
    authenticate: jest.fn().mockResolvedValue(true),
    callAPI: jest.fn().mockResolvedValue('Mock response'),
    validateConfig: jest.fn().mockReturnValue({ isValid: true, errors: [], warnings: [] }),
    getDefaultModel: jest.fn().mockReturnValue('test-model'),
    getAvailableModels: jest.fn().mockReturnValue(['test-model']),
    getConfigSchema: jest.fn().mockReturnValue({}),
    ...overrides
  }),

  // Wait for async operations
  waitFor: (ms = 0) => new Promise(resolve => setTimeout(resolve, ms)),

  // Flush all promises
  flushPromises: () => new Promise(resolve => setImmediate(resolve))
};

// Setup and teardown hooks
beforeEach(() => {
  // Clear all mocks before each test
  jest.clearAllMocks();
  
  // Reset fetch mock
  fetch.mockClear();
  fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: jest.fn().mockResolvedValue({}),
    text: jest.fn().mockResolvedValue('')
  });
  
  // Reset storage mocks
  chrome.storage.sync.get.mockResolvedValue({});
  chrome.storage.sync.set.mockResolvedValue();
  chrome.storage.local.get.mockResolvedValue({});
  chrome.storage.local.set.mockResolvedValue();
  
  // Reset localStorage
  localStorageMock.getItem.mockReturnValue(null);
  localStorageMock.setItem.mockClear();
  localStorageMock.removeItem.mockClear();
  localStorageMock.clear.mockClear();
});

afterEach(() => {
  // Clean up any timers
  jest.clearAllTimers();
  
  // Reset any global state
  if (global.TemplateManager) {
    global.TemplateManager.instance = null;
  }
  if (global.ConfigurationManager) {
    global.ConfigurationManager.instance = null;
  }
});

// Global error handler for unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Suppress specific warnings in tests
const originalWarn = console.warn;
console.warn = (...args) => {
  // Suppress specific warnings that are expected in tests
  const message = args[0];
  if (typeof message === 'string') {
    if (message.includes('deprecated') || message.includes('experimental')) {
      return;
    }
  }
  originalWarn.apply(console, args);
};
