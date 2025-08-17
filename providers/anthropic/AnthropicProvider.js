/**
 * @fileoverview Anthropic Provider for PromptBoost
 * Implements Anthropic Claude model integration with the new provider system.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

/**
 * Anthropic provider implementation.
 * Supports Claude 3 models (Opus, Sonnet, Haiku).
 * 
 * @class AnthropicProvider
 * @extends Provider
 * @since 2.0.0
 */
class AnthropicProvider extends Provider {
  /**
   * Creates an instance of AnthropicProvider.
   * 
   * @constructor
   * @param {Object} config - Provider configuration
   * @since 2.0.0
   */
  constructor(config) {
    super({
      name: 'anthropic',
      displayName: 'Anthropic (Claude)',
      description: 'Anthropic\'s Claude models including Claude 3 Opus, Sonnet, and Haiku',
      supportedFeatures: ['text-generation', 'chat', 'streaming', 'long-context'],
      ...config
    });

    this.baseURL = config.baseURL || 'https://api.anthropic.com/v1';
    this.apiKey = config.apiKey || null;
    this.anthropicVersion = config.anthropicVersion || '2023-06-01';
    
    // Default models
    this.defaultModel = 'claude-3-sonnet-20240229';
    this.availableModels = [
      'claude-3-opus-20240229',
      'claude-3-sonnet-20240229',
      'claude-3-haiku-20240307',
      'claude-2.1',
      'claude-2.0',
      'claude-instant-1.2'
    ];
  }

  /**
   * Authenticates with Anthropic API.
   * 
   * @method authenticate
   * @param {Object} credentials - Authentication credentials
   * @param {string} credentials.apiKey - Anthropic API key
   * @param {string} [credentials.baseURL] - Custom base URL
   * @param {string} [credentials.anthropicVersion] - API version
   * @returns {Promise<boolean>} True if authentication successful
   * @throws {Error} When authentication fails
   * @since 2.0.0
   * @async
   */
  async authenticate(credentials) {
    try {
      this.apiKey = credentials.apiKey;
      this.baseURL = credentials.baseURL || this.baseURL;
      this.anthropicVersion = credentials.anthropicVersion || this.anthropicVersion;

      // Validate API key format
      const validation = ConfigValidator.validateApiKey(this.apiKey, 'anthropic');
      if (!validation.isValid) {
        throw new Error(`Invalid API key: ${validation.errors.join(', ')}`);
      }

      // Test authentication by making a simple request
      const response = await fetch(`${this.baseURL}/messages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey,
          'anthropic-version': this.anthropicVersion
        },
        body: JSON.stringify({
          model: this.defaultModel,
          max_tokens: 10,
          messages: [{ role: 'user', content: 'Hello' }]
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          throw new Error('Invalid API key');
        }
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
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
      const keyValidation = ConfigValidator.validateApiKey(config.apiKey, 'anthropic');
      result.errors.push(...keyValidation.errors);
      result.warnings.push(...keyValidation.warnings);
      if (!keyValidation.isValid) result.isValid = false;
    }

    // Validate base URL if provided
    if (config.baseURL) {
      const urlValidation = ConfigValidator.validateEndpoint(config.baseURL, 'anthropic');
      result.errors.push(...urlValidation.errors);
      result.warnings.push(...urlValidation.warnings);
      if (!urlValidation.isValid) result.isValid = false;
    }

    // Validate model if provided
    if (config.model) {
      const modelValidation = ConfigValidator.validateModel(config.model, 'anthropic');
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
   * Calls the Anthropic API to process text.
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
        max_tokens: maxTokens,
        messages: messages,
        temperature: temperature,
        stream: stream
      };

      const headers = {
        'Content-Type': 'application/json',
        'x-api-key': this.apiKey,
        'anthropic-version': this.anthropicVersion
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
    const response = await fetch(`${this.baseURL}/messages`, {
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
    ApiHelper.validateResponse(data, 'anthropic');
    
    return ApiHelper.extractResponseText(data, 'anthropic');
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
    const response = await fetch(`${this.baseURL}/messages`, {
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
              
              if (parsed.type === 'content_block_delta') {
                const content = parsed.delta?.text;
                if (content) {
                  yield content;
                }
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
    const requestsRemaining = headers.get('anthropic-ratelimit-requests-remaining');
    const tokensRemaining = headers.get('anthropic-ratelimit-tokens-remaining');
    const resetTime = headers.get('anthropic-ratelimit-requests-reset');

    if (requestsRemaining) {
      this.rateLimits.currentRequests = this.rateLimits.requestsPerMinute - parseInt(requestsRemaining);
    }

    if (tokensRemaining) {
      this.rateLimits.currentTokens = this.rateLimits.tokensPerMinute - parseInt(tokensRemaining);
    }

    if (resetTime) {
      // Anthropic provides reset time as ISO string
      this.rateLimits.resetTime = new Date(resetTime).getTime();
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
        description: 'Your Anthropic API key (starts with sk-ant-)',
        placeholder: 'sk-ant-...',
        sensitive: true
      },
      baseURL: {
        type: 'string',
        required: false,
        label: 'Base URL',
        description: 'Custom API base URL (for proxies)',
        placeholder: 'https://api.anthropic.com/v1',
        default: 'https://api.anthropic.com/v1'
      },
      anthropicVersion: {
        type: 'string',
        required: false,
        label: 'API Version',
        description: 'Anthropic API version',
        placeholder: '2023-06-01',
        default: '2023-06-01'
      },
      model: {
        type: 'select',
        required: false,
        label: 'Model',
        description: 'Claude model to use',
        options: this.availableModels.map(model => ({ value: model, label: model })),
        default: this.defaultModel
      }
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { AnthropicProvider };
} else if (typeof window !== 'undefined') {
  window.AnthropicProvider = AnthropicProvider;
}
