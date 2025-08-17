/**
 * Chrome Extension API Mocks
 * Comprehensive mocks for Chrome extension APIs used in PromptBoost
 */

// Mock storage data
const mockStorageData = {};

// Mock Chrome APIs
global.chrome = {
  // Storage API
  storage: {
    sync: {
      get: jest.fn((keys, callback) => {
        const result = {};
        if (typeof keys === 'string') {
          result[keys] = mockStorageData[keys];
        } else if (Array.isArray(keys)) {
          keys.forEach(key => {
            result[key] = mockStorageData[key];
          });
        } else if (typeof keys === 'object') {
          Object.keys(keys).forEach(key => {
            result[key] = mockStorageData[key] !== undefined ? mockStorageData[key] : keys[key];
          });
        } else {
          Object.assign(result, mockStorageData);
        }

        if (callback) {
          callback(result);
        }
        return Promise.resolve(result);
      }),

      set: jest.fn((items, callback) => {
        Object.assign(mockStorageData, items);
        if (callback) {
          callback();
        }
        return Promise.resolve();
      }),

      remove: jest.fn((keys, callback) => {
        const keysArray = Array.isArray(keys) ? keys : [keys];
        keysArray.forEach(key => {
          delete mockStorageData[key];
        });
        if (callback) {
          callback();
        }
        return Promise.resolve();
      }),

      clear: jest.fn((callback) => {
        Object.keys(mockStorageData).forEach(key => {
          delete mockStorageData[key];
        });
        if (callback) {
          callback();
        }
        return Promise.resolve();
      })
    },

    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn()
    }
  },

  // Runtime API
  runtime: {
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
      hasListener: jest.fn()
    },

    onInstalled: {
      addListener: jest.fn(),
      removeListener: jest.fn(),
      hasListener: jest.fn()
    },

    sendMessage: jest.fn((message, callback) => {
      if (callback) {
        callback({ success: true });
      }
      return Promise.resolve({ success: true });
    }),

    openOptionsPage: jest.fn(),

    getURL: jest.fn((path) => `chrome-extension://test-extension-id/${path}`),

    id: 'test-extension-id',

    getManifest: jest.fn(() => ({
      name: 'PromptBoost Test',
      version: '1.0.0',
      manifest_version: 3
    }))
  },

  // Tabs API
  tabs: {
    query: jest.fn((queryInfo, callback) => {
      const mockTabs = [
        { id: 1, url: 'https://example.com', title: 'Test Page', active: true }
      ];
      if (callback) {
        callback(mockTabs);
      }
      return Promise.resolve(mockTabs);
    }),

    sendMessage: jest.fn((tabId, message, callback) => {
      if (callback) {
        callback({ success: true });
      }
      return Promise.resolve({ success: true });
    }),

    create: jest.fn((createProperties, callback) => {
      const newTab = {
        id: Math.floor(Math.random() * 1000),
        url: createProperties.url,
        title: 'New Tab',
        active: createProperties.active !== false
      };
      if (callback) {
        callback(newTab);
      }
      return Promise.resolve(newTab);
    }),

    update: jest.fn(),
    remove: jest.fn(),
    reload: jest.fn()
  },

  // Scripting API (Manifest V3)
  scripting: {
    executeScript: jest.fn((injection, callback) => {
      const result = [{ result: 'script executed' }];
      if (callback) {
        callback(result);
      }
      return Promise.resolve(result);
    }),

    insertCSS: jest.fn(),
    removeCSS: jest.fn()
  },

  // Action API (Manifest V3)
  action: {
    setBadgeText: jest.fn(),
    setBadgeBackgroundColor: jest.fn(),
    setIcon: jest.fn(),
    setTitle: jest.fn(),
    setPopup: jest.fn()
  },

  // Identity API
  identity: {
    getAuthToken: jest.fn((options, callback) => {
      const token = 'mock-auth-token';
      if (callback) {
        callback(token);
      }
      return Promise.resolve(token);
    }),

    removeCachedAuthToken: jest.fn(),
    launchWebAuthFlow: jest.fn()
  }
};

// Helper functions for tests
global.chromeTestUtils = {
  /**
   * Set mock storage data
   * @param {Object} data - Data to set in storage
   */
  setStorageData: (data) => {
    Object.assign(mockStorageData, data);
  },

  /**
   * Clear mock storage data
   */
  clearStorageData: () => {
    Object.keys(mockStorageData).forEach(key => {
      delete mockStorageData[key];
    });
  },

  /**
   * Get current mock storage data
   * @returns {Object} Current storage data
   */
  getStorageData: () => ({ ...mockStorageData }),

  /**
   * Simulate a Chrome message
   * @param {string} type - Message type
   * @param {Object} data - Message data
   * @param {Object} sender - Sender information
   */
  simulateMessage: (type, data = {}, sender = { tab: { id: 1 } }) => {
    const message = { type, ...data };
    const listeners = chrome.runtime.onMessage.addListener.mock.calls;

    listeners.forEach(([listener]) => {
      listener(message, sender, jest.fn());
    });
  },

  /**
   * Reset all Chrome API mocks
   */
  resetMocks: () => {
    Object.keys(chrome).forEach(api => {
      if (chrome[api] && typeof chrome[api] === 'object') {
        Object.keys(chrome[api]).forEach(method => {
          if (chrome[api][method] && typeof chrome[api][method].mockClear === 'function') {
            chrome[api][method].mockClear();
          }
        });
      }
    });
  }
};
