/**
 * @fileoverview Test suite for OpenAIProvider
 * Tests the OpenAI provider implementation including authentication,
 * API calls, configuration validation, and error handling.
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
    sanitized: 'sk-test-key'
  }),
  validateEndpoint: jest.fn().mockReturnValue({
    isValid: true,
    errors: [],
    warnings: [],
    sanitized: 'https://api.openai.com/v1'
  }),
  validateModel: jest.fn().mockReturnValue({
    isValid: true,
    errors: [],
    warnings: []
  })
};

global.ApiHelper = {
  validateResponse: jest.fn(),
  extractResponseText: jest.fn().mockReturnValue('Generated response text')
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
      resetTime: 0
    };
  }

  async checkRateLimit() {
    // Mock implementation
  }

  handleError(error, context) {
    return error;
  }
};

const { OpenAIProvider } = require('../../providers/openai/OpenAIProvider.js');

describe('OpenAIProvider', () => {
  let provider;

  beforeEach(() => {
    jest.clearAllMocks();
    provider = new OpenAIProvider({
      apiKey: 'sk-test-key',
      baseURL: 'https://api.openai.com/v1'
    });

    // Mock successful fetch responses
    fetch.mockResolvedValue({
      ok: true,
      status: 200,
      headers: new Map([
        ['x-ratelimit-remaining-requests', '59'],
        ['x-ratelimit-remaining-tokens', '89000'],
        ['x-ratelimit-reset-requests', '60']
      ]),
      json: jest.fn().mockResolvedValue({
        choices: [{
          message: {
            content: 'Generated response text'
          }
        }]
      })
    });
  });

  describe('Constructor', () => {
    test('should initialize with correct default values', () => {
      const newProvider = new OpenAIProvider({});

      expect(newProvider.name).toBe('openai');
      expect(newProvider.displayName).toBe('OpenAI (GPT)');
      expect(newProvider.baseURL).toBe('https://api.openai.com/v1');
      expect(newProvider.defaultModel).toBe('gpt-3.5-turbo');
      expect(newProvider.availableModels).toContain('gpt-4');
      expect(newProvider.availableModels).toContain('gpt-3.5-turbo');
    });

    test('should accept custom configuration', () => {
      const customProvider = new OpenAIProvider({
        apiKey: 'custom-key',
        baseURL: 'https://custom.openai.com/v1',
        organization: 'org-123'
      });

      expect(customProvider.apiKey).toBe('custom-key');
      expect(customProvider.baseURL).toBe('https://custom.openai.com/v1');
      expect(customProvider.organization).toBe('org-123');
    });
  });

  describe('Authentication', () => {
    test('should authenticate successfully with valid credentials', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: [
            { id: 'gpt-4' },
            { id: 'gpt-3.5-turbo' }
          ]
        })
      });

      const result = await provider.authenticate({
        apiKey: 'sk-valid-key',
        organization: 'org-123'
      });

      expect(result).toBe(true);
      expect(provider.isAuthenticated).toBe(true);
      expect(provider.apiKey).toBe('sk-valid-key');
      expect(provider.organization).toBe('org-123');
      expect(fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/models',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer sk-valid-key',
            'OpenAI-Organization': 'org-123'
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

    test('should validate API key format', async () => {
      ConfigValidator.validateApiKey.mockReturnValue({
        isValid: false,
        errors: ['Invalid API key format'],
        warnings: []
      });

      await expect(provider.authenticate({ apiKey: 'invalid-format' }))
        .rejects.toThrow('Invalid API key: Invalid API key format');
    });

    test('should update available models from API response', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({
          data: [
            { id: 'gpt-4-turbo' },
            { id: 'gpt-3.5-turbo-16k' }
          ]
        })
      });

      await provider.authenticate({ apiKey: 'sk-valid-key' });

      expect(provider.availableModels).toContain('gpt-4-turbo');
      expect(provider.availableModels).toContain('gpt-3.5-turbo-16k');
    });
  });

  describe('Configuration Validation', () => {
    test('should validate valid configuration', () => {
      const config = {
        apiKey: 'sk-valid-key',
        baseURL: 'https://api.openai.com/v1',
        model: 'gpt-3.5-turbo'
      };

      const result = provider.validateConfig(config);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(ConfigValidator.validateApiKey).toHaveBeenCalledWith('sk-valid-key', 'openai');
      expect(ConfigValidator.validateEndpoint).toHaveBeenCalledWith('https://api.openai.com/v1', 'openai');
      expect(ConfigValidator.validateModel).toHaveBeenCalledWith('gpt-3.5-turbo', 'openai');
    });

    test('should reject configuration without API key', () => {
      const config = {};

      const result = provider.validateConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('API key is required');
    });

    test('should include validation warnings', () => {
      ConfigValidator.validateApiKey.mockReturnValue({
        isValid: true,
        errors: [],
        warnings: ['API key format looks unusual'],
        sanitized: 'sk-test'
      });

      const config = { apiKey: 'sk-test' };
      const result = provider.validateConfig(config);

      expect(result.warnings).toContain('API key format looks unusual');
    });
  });

  describe('API Calls', () => {
    beforeEach(async () => {
      await provider.authenticate({ apiKey: 'sk-test-key' });
    });

    test('should make successful API call', async () => {
      const prompt = 'Hello, world!';
      const options = {
        model: 'gpt-3.5-turbo',
        maxTokens: 100,
        temperature: 0.7
      };

      const result = await provider.callAPI(prompt, options);

      expect(result).toBe('Generated response text');
      expect(fetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': 'Bearer sk-test-key'
          }),
          body: JSON.stringify({
            model: 'gpt-3.5-turbo',
            messages: [{ role: 'user', content: prompt }],
            max_tokens: 100,
            temperature: 0.7,
            stream: false
          })
        })
      );
    });

    test('should use default options when not provided', async () => {
      await provider.callAPI('Hello');

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          body: JSON.stringify({
            model: 'gpt-3.5-turbo', // Default model
            messages: [{ role: 'user', content: 'Hello' }],
            max_tokens: 1000, // Default maxTokens
            temperature: 0.7, // Default temperature
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
      const unauthenticatedProvider = new OpenAIProvider({});

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

    test('should update rate limits from response headers', async () => {
      await provider.callAPI('Hello');

      expect(provider.rateLimits.currentRequests).toBe(1); // 60 - 59
      expect(provider.rateLimits.currentTokens).toBe(1000); // 90000 - 89000
    });
  });

  describe('Streaming API Calls', () => {
    beforeEach(async () => {
      await provider.authenticate({ apiKey: 'sk-test-key' });
    });

    test('should handle streaming response', async () => {
      const mockReader = {
        read: jest.fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":"Hello"}}]}\n\n')
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: {"choices":[{"delta":{"content":" world"}}]}\n\n')
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode('data: [DONE]\n\n')
          })
          .mockResolvedValueOnce({ done: true }),
        releaseLock: jest.fn()
      };

      fetch.mockResolvedValueOnce({
        ok: true,
        body: {
          getReader: () => mockReader
        }
      });

      const stream = await provider.callAPI('Hello', { stream: true });
      const chunks = [];

      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      expect(chunks).toEqual(['Hello', ' world']);
      expect(mockReader.releaseLock).toHaveBeenCalled();
    });
  });

  describe('Model Management', () => {
    test('should return default model', () => {
      expect(provider.getDefaultModel()).toBe('gpt-3.5-turbo');
    });

    test('should return available models', () => {
      const models = provider.getAvailableModels();

      expect(Array.isArray(models)).toBe(true);
      expect(models).toContain('gpt-4');
      expect(models).toContain('gpt-3.5-turbo');
    });
  });

  describe('Configuration Schema', () => {
    test('should return configuration schema', () => {
      const schema = provider.getConfigSchema();

      expect(schema).toHaveProperty('apiKey');
      expect(schema.apiKey.type).toBe('string');
      expect(schema.apiKey.required).toBe(true);
      expect(schema.apiKey.sensitive).toBe(true);

      expect(schema).toHaveProperty('model');
      expect(schema.model.type).toBe('select');
      expect(schema.model.options).toBeDefined();
    });

    test('should include available models in schema options', () => {
      const schema = provider.getConfigSchema();
      const modelOptions = schema.model.options.map(opt => opt.value);

      expect(modelOptions).toContain('gpt-4');
      expect(modelOptions).toContain('gpt-3.5-turbo');
    });
  });

  describe('Error Handling', () => {
    beforeEach(async () => {
      await provider.authenticate({ apiKey: 'sk-test-key' });
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

    test('should handle missing response data', async () => {
      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({}) // Missing choices
      });

      ApiHelper.validateResponse.mockImplementation(() => {
        throw new Error('No response choices returned');
      });

      await expect(provider.callAPI('Hello'))
        .rejects.toThrow('No response choices returned');
    });
  });

  describe('Organization Support', () => {
    test('should include organization header when provided', async () => {
      const providerWithOrg = new OpenAIProvider({
        apiKey: 'sk-test',
        organization: 'org-123'
      });

      fetch.mockResolvedValueOnce({
        ok: true,
        json: jest.fn().mockResolvedValue({ data: [] })
      });

      await providerWithOrg.authenticate({
        apiKey: 'sk-test',
        organization: 'org-123'
      });

      expect(fetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          headers: expect.objectContaining({
            'OpenAI-Organization': 'org-123'
          })
        })
      );
    });

    test('should not include organization header when not provided', async () => {
      await provider.authenticate({ apiKey: 'sk-test' });

      const lastCall = fetch.mock.calls[fetch.mock.calls.length - 1];
      const headers = lastCall[1].headers;

      expect(headers).not.toHaveProperty('OpenAI-Organization');
    });
  });
});
