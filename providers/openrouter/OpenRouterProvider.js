/**
 * @fileoverview OpenRouter Provider for PromptBoost
 * Implements OpenRouter API integration for accessing multiple models through a single API.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

/**
 * OpenRouter provider implementation.
 * Provides access to multiple AI models through OpenRouter's unified API.
 * 
 * @class OpenRouterProvider
 * @extends Provider
 * @since 2.0.0
 */
class OpenRouterProvider extends Provider {
  /**
   * Creates an instance of OpenRouterProvider.
   * 
   * @constructor
   * @param {Object} config - Provider configuration
   * @since 2.0.0
   */
  constructor(config) {
    super({
      name: 'openrouter',
      displayName: 'OpenRouter (Multiple Models)',
      description: 'Access to multiple AI models through OpenRouter\'s unified API',
      supportedFeatures: ['text-generation', 'chat', 'streaming', 'multiple-models'],
      ...config
    });

    this.baseURL = config.baseURL || 'https://openrouter.ai/api/v1';
    this.apiKey = config.apiKey || null;
    this.appName = config.appName || 'PromptBoost';
    this.appUrl = config.appUrl || chrome.runtime.getURL('');
    
    // Default models (popular ones)
    this.defaultModel = 'openai/gpt-3.5-turbo';
    this.availableModels = [
      'openai/gpt-4',
      'openai/gpt-4-turbo',
      'openai/gpt-3.5-turbo',
      'anthropic/claude-3-opus',
      'anthropic/claude-3-sonnet',
      'anthropic/claude-3-haiku',
      'google/gemini-pro',
      'meta-llama/llama-2-70b-chat',
      'mistralai/mixtral-8x7b-instruct'
    ];
  }

  /**
   * Authenticates with OpenRouter API.
   * 
   * @method authenticate
   * @param {Object} credentials - Authentication credentials
   * @param {string} credentials.apiKey - OpenRouter API key
   * @param {string} [credentials.baseURL] - Custom base URL
   * @param {string} [credentials.appName] - Application name
   * @param {string} [credentials.appUrl] - Application URL
   * @returns {Promise<boolean>} True if authentication successful
   * @throws {Error} When authentication fails
   * @since 2.0.0
   * @async
   */
  async authenticate(credentials) {
    try {
      this.apiKey = credentials.apiKey;
      this.baseURL = credentials.baseURL || this.baseURL;
      this.appName = credentials.appName || this.appName;
      this.appUrl = credentials.appUrl || this.appUrl;

      // Validate API key format
      const validation = ConfigValidator.validateApiKey(this.apiKey, 'openrouter');
      if (!validation.isValid) {
        throw new Error(`Invalid API key: ${validation.errors.join(', ')}`);
      }

      // Test authentication by making a simple request
      const response = await fetch(`${this.baseURL}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'HTTP-Referer': this.appUrl,
          'X-Title': this.appName
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          throw new Error('Invalid API key');
        }
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      // Update available models from API response
      if (data.data && Array.isArray(data.data)) {
        this.availableModels = data.data.map(model => model.id);
      }

      this.isAuthenticated = true;
      return true;
    } catch (error) {
      this.isAuthenticated = false;
      throw this.handleError(error, 'authentication');
    }
  }

  /**
   * Validates provider configuration.
   * 
   * @method validateConfig
   * @param {Object} config - Configuration to validate
   * @returns {Object} Validation result
   * @since 2.0.0
   */
  validateConfig(config) {
    const result = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Validate API key
    if (!config.apiKey) {
      result.isValid = false;
      result.errors.push('API key is required');
    } else {
      const keyValidation = ConfigValidator.validateApiKey(config.apiKey, 'openrouter');
      result.errors.push(...keyValidation.errors);
      result.warnings.push(...keyValidation.warnings);
      if (!keyValidation.isValid) result.isValid = false;
    }

    // Validate base URL if provided
    if (config.baseURL) {
      const urlValidation = ConfigValidator.validateEndpoint(config.baseURL, 'openrouter');
      result.errors.push(...urlValidation.errors);
      result.warnings.push(...urlValidation.warnings);
      if (!urlValidation.isValid) result.isValid = false;
    }

    return result;
  }

  /**
   * Gets the default model for this provider.
   * 
   * @method getDefaultModel
   * @returns {string} Default model name
   * @since 2.0.0
   */
  getDefaultModel() {
    return this.defaultModel;
  }

  /**
   * Gets available models for this provider.
   * 
   * @method getAvailableModels
   * @returns {Array<string>} Array of available model names
   * @since 2.0.0
   */
  getAvailableModels() {
    return this.availableModels;
  }

  /**
   * Calls the OpenRouter API to process text.
   * 
   * @method callAPI
   * @param {string} prompt - The prompt to send to the API
   * @param {Object} options - API call options
   * @param {string} [options.model] - Model to use
   * @param {number} [options.maxTokens=1000] - Maximum tokens to generate
   * @param {number} [options.temperature=0.7] - Temperature for generation
   * @param {boolean} [options.stream=false] - Whether to stream the response
   * @param {Array} [options.messages] - Chat messages (if using chat format)
   * @returns {Promise<string|AsyncGenerator<string>>} Generated text or stream
   * @throws {Error} When API call fails
   * @since 2.0.0
   * @async
   */
  async callAPI(prompt, options = {}) {
    try {
      if (!this.isAuthenticated) {
        throw new Error('Provider not authenticated');
      }

      await this.checkRateLimit();

      const model = options.model || this.getDefaultModel();
      const maxTokens = options.maxTokens || 1000;
      const temperature = options.temperature || 0.7;
      const stream = options.stream || false;

      // Prepare messages
      let messages;
      if (options.messages && Array.isArray(options.messages)) {
        messages = options.messages;
      } else {
        messages = [{ role: 'user', content: prompt }];
      }

      const requestBody = {
        model: model,
        messages: messages,
        max_tokens: maxTokens,
        temperature: temperature,
        stream: stream
      };

      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
        'HTTP-Referer': this.appUrl,
        'X-Title': this.appName
      };

      if (stream) {
        return this.handleStreamingResponse(requestBody, headers);
      } else {
        return this.handleRegularResponse(requestBody, headers);
      }
    } catch (error) {
      throw this.handleError(error, 'API call');
    }
  }

  /**
   * Handles regular (non-streaming) API response.
   * 
   * @method handleRegularResponse
   * @param {Object} requestBody - Request body
   * @param {Object} headers - Request headers
   * @returns {Promise<string>} Generated text
   * @since 2.0.0
   * @async
   */
  async handleRegularResponse(requestBody, headers) {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Update rate limit info
    this.updateRateLimitFromHeaders(response.headers);
    
    // Validate response
    ApiHelper.validateResponse(data, 'openrouter');
    
    return ApiHelper.extractResponseText(data, 'openrouter');
  }

  /**
   * Handles streaming API response.
   * 
   * @method handleStreamingResponse
   * @param {Object} requestBody - Request body
   * @param {Object} headers - Request headers
   * @returns {AsyncGenerator<string>} Streaming text generator
   * @since 2.0.0
   * @async
   */
  async *handleStreamingResponse(requestBody, headers) {
    const response = await fetch(`${this.baseURL}/chat/completions`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') return;

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                yield content;
              }
            } catch (error) {
              // Skip invalid JSON lines
              continue;
            }
          }
        }
      }
    } finally {
      reader.releaseLock();
    }
  }

  /**
   * Updates rate limit information from response headers.
   * 
   * @method updateRateLimitFromHeaders
   * @param {Headers} headers - Response headers
   * @since 2.0.0
   */
  updateRateLimitFromHeaders(headers) {
    // OpenRouter uses similar headers to OpenAI
    const requestsRemaining = headers.get('x-ratelimit-remaining-requests');
    const tokensRemaining = headers.get('x-ratelimit-remaining-tokens');
    const resetTime = headers.get('x-ratelimit-reset-requests');

    if (requestsRemaining) {
      this.rateLimits.currentRequests = this.rateLimits.requestsPerMinute - parseInt(requestsRemaining);
    }

    if (tokensRemaining) {
      this.rateLimits.currentTokens = this.rateLimits.tokensPerMinute - parseInt(tokensRemaining);
    }

    if (resetTime) {
      this.rateLimits.resetTime = Date.now() + (parseInt(resetTime) * 1000);
    }
  }

  /**
   * Gets provider-specific configuration schema.
   * 
   * @method getConfigSchema
   * @returns {Object} Configuration schema
   * @since 2.0.0
   */
  getConfigSchema() {
    return {
      apiKey: {
        type: 'string',
        required: true,
        label: 'API Key',
        description: 'Your OpenRouter API key',
        placeholder: 'sk-or-...',
        sensitive: true
      },
      baseURL: {
        type: 'string',
        required: false,
        label: 'Base URL',
        description: 'Custom API base URL (for proxies)',
        placeholder: 'https://openrouter.ai/api/v1',
        default: 'https://openrouter.ai/api/v1'
      },
      appName: {
        type: 'string',
        required: false,
        label: 'App Name',
        description: 'Application name for OpenRouter',
        placeholder: 'PromptBoost',
        default: 'PromptBoost'
      },
      model: {
        type: 'select',
        required: false,
        label: 'Model',
        description: 'Model to use',
        options: this.availableModels.map(model => ({ value: model, label: model })),
        default: this.defaultModel
      }
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OpenRouterProvider };
} else if (typeof window !== 'undefined') {
  window.OpenRouterProvider = OpenRouterProvider;
}
