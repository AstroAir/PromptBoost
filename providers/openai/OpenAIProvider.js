/**
 * @fileoverview OpenAI Provider for PromptBoost
 * Implements OpenAI GPT model integration with the new provider system.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

/**
 * OpenAI provider implementation.
 * Supports GPT-3.5, GPT-4, and other OpenAI models.
 * 
 * @class OpenAIProvider
 * @extends Provider
 * @since 2.0.0
 */
class OpenAIProvider extends Provider {
  /**
   * Creates an instance of OpenAIProvider.
   * 
   * @constructor
   * @param {Object} config - Provider configuration
   * @since 2.0.0
   */
  constructor(config) {
    super({
      name: 'openai',
      displayName: 'OpenAI (GPT)',
      description: 'OpenAI\'s GPT models including GPT-3.5 and GPT-4',
      supportedFeatures: ['text-generation', 'chat', 'streaming', 'function-calling'],
      ...config
    });

    this.baseURL = config.baseURL || 'https://api.openai.com/v1';
    this.apiKey = config.apiKey || null;
    this.organization = config.organization || null;

    // Default models
    this.defaultModel = 'gpt-3.5-turbo';
    this.availableModels = [
      'gpt-4',
      'gpt-4-turbo',
      'gpt-4-turbo-preview',
      'gpt-3.5-turbo',
      'gpt-3.5-turbo-16k',
      'gpt-3.5-turbo-instruct'
    ];
  }

  /**
   * Authenticates with OpenAI API.
   * 
   * @method authenticate
   * @param {Object} credentials - Authentication credentials
   * @param {string} credentials.apiKey - OpenAI API key
   * @param {string} [credentials.organization] - OpenAI organization ID
   * @param {string} [credentials.baseURL] - Custom base URL
   * @returns {Promise<boolean>} True if authentication successful
   * @throws {Error} When authentication fails
   * @since 2.0.0
   * @async
   */
  async authenticate(credentials) {
    try {
      this.apiKey = credentials.apiKey;
      this.organization = credentials.organization;
      this.baseURL = credentials.baseURL || this.baseURL;

      // Validate API key format
      const validation = ConfigValidator.validateApiKey(this.apiKey, 'openai');
      if (!validation.isValid) {
        throw new Error(`Invalid API key: ${validation.errors.join(', ')}`);
      }

      // Test authentication by making a simple request
      const response = await fetch(`${this.baseURL}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          ...(this.organization && { 'OpenAI-Organization': this.organization })
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
      this.availableModels = data.data?.map(model => model.id) || this.availableModels;
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
      const keyValidation = ConfigValidator.validateApiKey(config.apiKey, 'openai');
      result.errors.push(...keyValidation.errors);
      result.warnings.push(...keyValidation.warnings);
      if (!keyValidation.isValid) result.isValid = false;
    }

    // Validate base URL if provided
    if (config.baseURL) {
      const urlValidation = ConfigValidator.validateEndpoint(config.baseURL, 'openai');
      result.errors.push(...urlValidation.errors);
      result.warnings.push(...urlValidation.warnings);
      if (!urlValidation.isValid) result.isValid = false;
    }

    // Validate model if provided
    if (config.model) {
      const modelValidation = ConfigValidator.validateModel(config.model, 'openai');
      result.warnings.push(...modelValidation.warnings);
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
   * Calls the OpenAI API to process text.
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
        ...(this.organization && { 'OpenAI-Organization': this.organization })
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
    ApiHelper.validateResponse(data, 'openai');

    return ApiHelper.extractResponseText(data, 'openai');
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
        description: 'Your OpenAI API key (starts with sk-)',
        placeholder: 'sk-...',
        sensitive: true
      },
      organization: {
        type: 'string',
        required: false,
        label: 'Organization ID',
        description: 'Optional OpenAI organization ID',
        placeholder: 'org-...'
      },
      baseURL: {
        type: 'string',
        required: false,
        label: 'Base URL',
        description: 'Custom API base URL (for proxies)',
        placeholder: 'https://api.openai.com/v1',
        default: 'https://api.openai.com/v1'
      },
      model: {
        type: 'select',
        required: false,
        label: 'Model',
        description: 'OpenAI model to use',
        options: this.availableModels.map(model => ({ value: model, label: model })),
        default: this.defaultModel
      }
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { OpenAIProvider };
} else if (typeof window !== 'undefined') {
  window.OpenAIProvider = OpenAIProvider;
}
