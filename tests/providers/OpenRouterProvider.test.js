/**
 * @fileoverview Test suite for OpenRouterProvider
 * Tests the OpenRouter provider implementation including OAuth PKCE authentication,
 * API calls, model management, and error handling.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

// Mock global fetch
global.fetch = jest.fn();

// Mock dependencies
global.ConfigValidator = {
  validateApiKey: jest.fn().mockReturnValue({
    isValid: true,
    errors: [],
    warnings: [],
    sanitized: 'sk-or-test-key'
  }),
  validateEndpoint: jest.fn().mockReturnValue({
    isValid: true,
    errors: [],
    warnings: [],
    sanitized: 'https://openrouter.ai/api/v1'
  }),
  validateModel: jest.fn().mockReturnValue({
    isValid: true,
    errors: [],
    warnings: []
  })
};

global.chrome = {
  runtime: {
    getURL: jest.fn().mockReturnValue('chrome-extension://test/')
  }
};

global.Provider = class Provider {
  constructor(config) {
    Object.assign(this, config);
    this.isAuthenticated = false;
    this.rateLimits = {
      requestsPerMinute: 60,
      tokensPerMinute: 90000,
      currentRequests: 0,
      currentTokens: 0,
      resetTime: Date.now() + 60000
    };
    this.lastError = null;
  }

  handleError(error, context) {
    this.lastError = { message: error.message, context, timestamp: Date.now() };
    return new Error(`${this.displayName} error: ${error.message}`);
  }

  checkRateLimit() {
    return Promise.resolve();
  }

  getRateLimitStatus() {
    return this.rateLimits;
  }
};

// Import the provider
require('../../providers/openrouter/OpenRouterProvider.js');

describe('OpenRouterProvider', () => {
  let provider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new OpenRouterProvider({
      apiKey: 'sk-or-test-key',
      baseURL: 'https://openrouter.ai/api/v1',
      appName: 'PromptBoost Test'
    });

    // Mock successful API responses
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Map([
        ['x-ratelimit-requests-remaining', '59'],
        ['x-ratelimit-tokens-remaining', '89000'],
        ['x-ratelimit-requests-reset', new Date(Date.now() + 60000).toISOString()],
        ['x-ratelimit-tokens-reset', new Date(Date.now() + 60000).toISOString()]
      ]),
      json: jest.fn().mockResolvedValue({
        data: [
          {
            id: 'openai/gpt-4',
            name: 'GPT-4',
            description: 'OpenAI GPT-4 model',
            context_length: 8192,
            pricing: { prompt: '0.00003', completion: '0.00006' }
          },
          {
            id: 'anthropic/claude-3-sonnet',
            name: 'Claude 3 Sonnet',
            description: 'Anthropic Claude 3 Sonnet model',
            context_length: 200000,
            pricing: { prompt: '0.000003', completion: '0.000015' }
          }
        ]
      })
    });
  });

  describe('Constructor', () => {
    test('should initialize with correct default values', () => {
      const newProvider = new OpenRouterProvider({});

      expect(newProvider.name).toBe('openrouter');
      expect(newProvider.displayName).toBe('OpenRouter (Multiple Models)');
      expect(newProvider.baseURL).toBe('https://openrouter.ai/api/v1');
      expect(newProvider.appName).toBe('PromptBoost');
      expect(newProvider.defaultModel).toBe('openai/gpt-3.5-turbo');
      expect(newProvider.availableModels).toContain('openai/gpt-4');
      expect(newProvider.availableModels).toContain('anthropic/claude-3-sonnet');
    });

    test('should accept custom configuration', () => {
      const config = {
        apiKey: 'sk-or-custom-key',
        baseURL: 'https://custom.openrouter.ai/api/v1',
        appName: 'Custom App'
      };

      const customProvider = new OpenRouterProvider(config);

      expect(customProvider.apiKey).toBe('sk-or-custom-key');
      expect(customProvider.baseURL).toBe('https://custom.openrouter.ai/api/v1');
      expect(customProvider.appName).toBe('Custom App');
    });
  });

  describe('Authentication', () => {
    test('should authenticate successfully with valid API key', async () => {
      const result = await provider.authenticate({
        apiKey: 'sk-or-valid-key'
      });

      expect(result).toBe(true);
      expect(provider.isAuthenticated).toBe(true);
      expect(provider.apiKey).toBe('sk-or-valid-key');
      expect(fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/models',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer sk-or-valid-key',
            'HTTP-Referer': 'chrome-extension://test/',
            'X-Title': 'PromptBoost Test'
          })
        })
      );
    });

    test('should fail authentication with invalid API key', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: jest.fn().mockResolvedValue({
          error: { message: 'Invalid API key' }
        })
      });

      await expect(provider.authenticate({ apiKey: 'invalid-key' }))
        .rejects.toThrow('Invalid API key');
      expect(provider.isAuthenticated).toBe(false);
    });

    test('should update available models from API response', async () => {
      await provider.authenticate({ apiKey: 'sk-or-valid-key' });

      expect(provider.availableModels).toContain('openai/gpt-4');
      expect(provider.availableModels).toContain('anthropic/claude-3-sonnet');
    });

    test('should validate API key format', async () => {
      ConfigValidator.validateApiKey.mockReturnValue({
        isValid: false,
        errors: ['Invalid API key format'],
        warnings: []
      });

      await expect(provider.authenticate({ apiKey: 'invalid-format' }))
        .rejects.toThrow('Invalid API key: Invalid API key format');
    });
  });

  describe('API Calls', () => {
    beforeEach(async () => {
      await provider.authenticate({ apiKey: 'sk-or-test-key' });

      // Mock chat completion response
      fetch.mockResolvedValue({
        ok: true,
        status: 200,
        headers: new Map([
          ['x-ratelimit-requests-remaining', '59'],
          ['x-ratelimit-tokens-remaining', '89000']
        ]),
        json: jest.fn().mockResolvedValue({
          choices: [
            {
              message: {
                content: 'Generated response text'
              }
            }
          ],
          usage: {
            prompt_tokens: 10,
            completion_tokens: 20,
            total_tokens: 30
          }
        })
      });
    });

    test('should make successful API call', async () => {
      const prompt = 'Hello, world!';
      const options = {
        model: 'openai/gpt-4',
        maxTokens: 100,
        temperature: 0.7
      };

      const result = await provider.callAPI(prompt, options);

      expect(result).toBe('Generated response text');
      expect(fetch).toHaveBeenCalledWith(
        'https://openrouter.ai/api/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer sk-or-test-key',
            'HTTP-Referer': 'chrome-extension://test/',
            'X-Title': 'PromptBoost Test'
          }),
          body: JSON.stringify({
            model: 'openai/gpt-4',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 100,
            temperature: 0.7,
            stream: false
          })
        })
      );
    });

    test('should handle custom messages format', async () => {
      const messages = [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: 'Hello!' }
      ];

      await provider.callAPI('', { messages });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify(expect.objectContaining({
            messages: messages
          }))
        })
      );
    });

    test('should fail when not authenticated', async () => {
      const unauthenticatedProvider = new OpenRouterProvider({});

      await expect(unauthenticatedProvider.callAPI('Hello'))
        .rejects.toThrow('Provider not authenticated');
    });

    test('should handle API errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        json: jest.fn().mockResolvedValue({
          error: { message: 'Bad request' }
        })
      });

      await expect(provider.callAPI('Hello'))
        .rejects.toThrow('Bad request');
    });
  });

  describe('Model Management', () => {
    test('should return default model', () => {
      expect(provider.getDefaultModel()).toBe('openai/gpt-3.5-turbo');
    });

    test('should return available models', () => {
      const models = provider.getAvailableModels();

      expect(Array.isArray(models)).toBe(true);
      expect(models).toContain('openai/gpt-4');
      expect(models).toContain('anthropic/claude-3-sonnet');
    });

    test('should get models from API when authenticated', async () => {
      await provider.authenticate({ apiKey: 'sk-or-test-key' });

      const models = await provider.getModels();

      expect(Array.isArray(models)).toBe(true);
      expect(models.length).toBeGreaterThan(0);
      expect(models[0]).toHaveProperty('id');
      expect(models[0]).toHaveProperty('name');
    });
  });

  describe('Configuration Schema', () => {
    test('should return configuration schema', () => {
      const schema = provider.getConfigSchema();

      expect(schema).toHaveProperty('apiKey');
      expect(schema.apiKey.type).toBe('string');
      expect(schema.apiKey.required).toBe(true);
      expect(schema.apiKey.sensitive).toBe(true);

      expect(schema).toHaveProperty('baseURL');
      expect(schema.baseURL.type).toBe('string');
      expect(schema.baseURL.required).toBe(false);
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await provider.authenticate({ apiKey: 'sk-or-test-key' });
    });

    test('should handle network errors', async () => {
      fetch.mockRejectedValue(new Error('Network error'));

      await expect(provider.callAPI('Hello'))
        .rejects.toThrow('Network error');
    });

    test('should handle malformed JSON responses', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockRejectedValue(new Error('Invalid JSON'))
      });

      await expect(provider.callAPI('Hello'))
        .rejects.toThrow('Invalid JSON');
    });

    test('should handle rate limit errors', async () => {
      fetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
        json: jest.fn().mockResolvedValue({
          error: { message: 'Rate limit exceeded' }
        })
      });

      await expect(provider.callAPI('Hello'))
        .rejects.toThrow('Rate limit exceeded');
    });
  });

  describe('Connection Testing', () => {
    test('should test connection successfully', async () => {
      const result = await provider.testConnection({
        apiKey: 'sk-or-test-key'
      });

      expect(result.success).toBe(true);
      expect(result).toHaveProperty('result');
    });

    test('should fail connection test with invalid config', async () => {
      const result = await provider.testConnection({
        apiKey: ''
      });

      expect(result.success).toBe(false);
      expect(result).toHaveProperty('error');
    });
  });
});
