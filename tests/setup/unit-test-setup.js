/**
 * Unit test specific setup
 * Additional configuration and mocks for unit tests
 */

// Mock fetch for API calls
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({
      choices: [{
        message: {
          content: 'Optimized text response'
        }
      }]
    }),
    text: () => Promise.resolve('Optimized text response')
  })
);

// Mock XMLHttpRequest
global.XMLHttpRequest = jest.fn(() => ({
  open: jest.fn(),
  send: jest.fn(),
  setRequestHeader: jest.fn(),
  addEventListener: jest.fn(),
  readyState: 4,
  status: 200,
  responseText: JSON.stringify({
    choices: [{
      message: {
        content: 'Optimized text response'
      }
    }]
  })
}));

// Unit test utilities
global.unitTestUtils = {
  /**
   * Create a mock Chrome storage result
   * @param {Object} data - Storage data
   * @returns {Object} Mock storage result
   */
  createStorageResult: (data) => Promise.resolve(data),

  /**
   * Create a mock API response
   * @param {string} content - Response content
   * @param {boolean} success - Whether the response is successful
   * @returns {Object} Mock API response
   */
  createApiResponse: (content = 'Optimized text', success = true) => ({
    ok: success,
    status: success ? 200 : 400,
    json: () => Promise.resolve(success ? {
      choices: [{
        message: { content }
      }]
    } : {
      error: { message: 'API Error' }
    })
  }),

  /**
   * Mock a Chrome extension class
   * @param {Function} ClassConstructor - The class to mock
   * @returns {Object} Mocked class instance
   */
  mockExtensionClass: (ClassConstructor) => {
    const instance = new ClassConstructor();

    // Mock all methods
    Object.getOwnPropertyNames(Object.getPrototypeOf(instance))
      .filter(name => name !== 'constructor' && typeof instance[name] === 'function')
      .forEach(methodName => {
        instance[methodName] = jest.fn(instance[methodName]);
      });

    return instance;
  }
};

// Setup fake timers for unit tests
beforeEach(() => {
  jest.useFakeTimers();
});

afterEach(() => {
  jest.runOnlyPendingTimers();
  jest.useRealTimers();
});
