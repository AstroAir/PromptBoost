/**
 * @fileoverview Base Provider Class for PromptBoost
 * Abstract base class that defines the interface for all LLM providers.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

/**
 * Abstract base class for all LLM providers.
 * Defines the standard interface that all providers must implement.
 * 
 * @abstract
 * @class Provider
 * @since 2.0.0
 */
class Provider {
  /**
   * Creates an instance of Provider.
   * 
   * @constructor
   * @param {Object} config - Provider configuration
   * @param {string} config.name - Provider name
   * @param {string} config.displayName - Human-readable provider name
   * @param {string} config.description - Provider description
   * @param {Array<string>} config.supportedFeatures - List of supported features
   * @since 2.0.0
   */
  constructor(config) {
    if (this.constructor === Provider) {
      throw new Error('Provider is an abstract class and cannot be instantiated directly');
    }

    this.name = config.name;
    this.displayName = config.displayName;
    this.description = config.description;
    this.supportedFeatures = config.supportedFeatures || [];
    this.isAuthenticated = false;
    this.lastError = null;

    // Initialize rate limits with provider-specific or default values
    const providerRateLimits = RATE_LIMITS[this.name.toUpperCase()] || {};
    this.rateLimits = {
      requestsPerMinute: providerRateLimits.REQUESTS_PER_MINUTE || RATE_LIMITS.DEFAULT_REQUESTS_PER_MINUTE,
      tokensPerMinute: providerRateLimits.TOKENS_PER_MINUTE || RATE_LIMITS.DEFAULT_TOKENS_PER_MINUTE,
      currentRequests: 0,
      currentTokens: 0,
      resetTime: Date.now() + RATE_LIMITS.RESET_INTERVAL
    };
  }

  /**
   * Authenticates with the provider using the provided credentials.
   * Must be implemented by concrete provider classes.
   * 
   * @abstract
   * @method authenticate
   * @param {Object} credentials - Authentication credentials
   * @returns {Promise<boolean>} True if authentication successful
   * @throws {Error} When authentication fails
   * @since 2.0.0
   * @async
   */
  async authenticate(_credentials) {
    throw new Error('authenticate() method must be implemented by concrete provider class');
  }

  /**
   * Validates the provider configuration.
   * Must be implemented by concrete provider classes.
   * 
   * @abstract
   * @method validateConfig
   * @param {Object} config - Configuration to validate
   * @returns {Object} Validation result with isValid boolean and errors array
   * @since 2.0.0
   */
  validateConfig(_config) {
    throw new Error('validateConfig() method must be implemented by concrete provider class');
  }

  /**
   * Gets available models for this provider.
   * Must be implemented by concrete provider classes.
   * 
   * @abstract
   * @method getModels
   * @returns {Promise<Array<Object>>} Array of available models
   * @since 2.0.0
   * @async
   */
  async getModels() {
    throw new Error('getModels() method must be implemented by concrete provider class');
  }

  /**
   * Calls the provider's API to process text.
   * Must be implemented by concrete provider classes.
   * 
   * @abstract
   * @method callAPI
   * @param {string} prompt - The prompt to send to the API
   * @param {Object} options - API call options
   * @param {string} options.model - Model to use
   * @param {number} [options.maxTokens=1000] - Maximum tokens to generate
   * @param {number} [options.temperature=0.7] - Temperature for generation
   * @param {boolean} [options.stream=false] - Whether to stream the response
   * @returns {Promise<string|AsyncGenerator<string>>} Generated text or stream
   * @throws {Error} When API call fails
   * @since 2.0.0
   * @async
   */
  async callAPI(_prompt, _options) {
    throw new Error('callAPI() method must be implemented by concrete provider class');
  }

  /**
   * Tests the connection to the provider.
   * 
   * @method testConnection
   * @param {Object} config - Configuration to test
   * @returns {Promise<Object>} Test result with success boolean and details
   * @since 2.0.0
   * @async
   */
  async testConnection(config) {
    try {
      const validation = this.validateConfig(config);
      if (!validation.isValid) {
        return {
          success: false,
          error: 'Invalid configuration',
          details: validation.errors
        };
      }

      await this.authenticate(config);

      // Test with a simple prompt
      const testPrompt = 'Hello, this is a test message.';
      const result = await this.callAPI(testPrompt, {
        model: config.model || this.getDefaultModel(),
        maxTokens: 50,
        temperature: 0.1
      });

      return {
        success: true,
        result: result.substring(0, 100) + (result.length > 100 ? '...' : ''),
        responseTime: Date.now() - Date.now() // Will be properly measured in implementation
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        details: error.stack
      };
    }
  }

  /**
   * Gets the default model for this provider.
   * Can be overridden by concrete provider classes.
   * 
   * @method getDefaultModel
   * @returns {string} Default model name
   * @since 2.0.0
   */
  getDefaultModel() {
    return 'default';
  }

  /**
   * Checks if a feature is supported by this provider.
   * 
   * @method supportsFeature
   * @param {string} feature - Feature to check
   * @returns {boolean} True if feature is supported
   * @since 2.0.0
   */
  supportsFeature(feature) {
    return this.supportedFeatures.includes(feature);
  }

  /**
   * Checks and updates rate limits.
   * 
   * @method checkRateLimit
   * @param {number} tokensUsed - Number of tokens used in the request
   * @returns {boolean} True if request is within rate limits
   * @since 2.0.0
   */
  checkRateLimit(tokensUsed = 0) {
    const now = Date.now();

    // Reset counters if time window has passed
    if (now >= this.rateLimits.resetTime) {
      this.rateLimits.currentRequests = 0;
      this.rateLimits.currentTokens = 0;
      this.rateLimits.resetTime = now + RATE_LIMITS.RESET_INTERVAL;
    }

    // Check if adding this request would exceed limits
    if (this.rateLimits.currentRequests >= this.rateLimits.requestsPerMinute ||
      this.rateLimits.currentTokens + tokensUsed > this.rateLimits.tokensPerMinute) {
      return false;
    }

    // Update counters
    this.rateLimits.currentRequests++;
    this.rateLimits.currentTokens += tokensUsed;

    return true;
  }

  /**
   * Gets rate limit status.
   * 
   * @method getRateLimitStatus
   * @returns {Object} Rate limit status information
   * @since 2.0.0
   */
  getRateLimitStatus() {
    const now = Date.now();
    const timeUntilReset = Math.max(0, this.rateLimits.resetTime - now);

    return {
      requestsRemaining: Math.max(0, this.rateLimits.requestsPerMinute - this.rateLimits.currentRequests),
      tokensRemaining: Math.max(0, this.rateLimits.tokensPerMinute - this.rateLimits.currentTokens),
      resetTime: this.rateLimits.resetTime,
      timeUntilReset: timeUntilReset
    };
  }

  /**
   * Handles errors in a standardized way with enhanced categorization.
   *
   * @method handleError
   * @param {Error|Response} error - The error to handle or HTTP response
   * @param {string} context - Context where the error occurred
   * @param {Object} metadata - Additional error metadata
   * @returns {Error} Standardized error object
   * @since 2.0.0
   */
  handleError(error, context = 'unknown', metadata = {}) {
    let errorMessage = '';
    let errorCode = '';
    let statusCode = null;

    // Handle HTTP Response objects
    if (error instanceof Response) {
      statusCode = error.status;
      errorMessage = `HTTP ${error.status}: ${error.statusText}`;
      errorCode = this.getErrorCodeFromStatus(error.status);
    } else if (error instanceof Error) {
      errorMessage = error.message;
      errorCode = this.categorizeError(error.message);
    } else {
      errorMessage = String(error);
      errorCode = ERROR_CODES.UNKNOWN_ERROR;
    }

    this.lastError = {
      message: errorMessage,
      code: errorCode,
      context: context,
      timestamp: Date.now(),
      provider: this.name,
      statusCode: statusCode,
      metadata: metadata
    };

    // Create standardized error with proper categorization
    const standardizedError = new Error(this.formatErrorMessage(errorMessage, errorCode));
    standardizedError.code = errorCode;
    standardizedError.provider = this.name;
    standardizedError.context = context;
    standardizedError.statusCode = statusCode;

    return standardizedError;
  }

  /**
   * Categorizes error based on message content.
   *
   * @method categorizeError
   * @param {string} message - Error message
   * @returns {string} Error code
   * @since 2.0.0
   */
  categorizeError(message) {
    const lowerMessage = message.toLowerCase();

    if (lowerMessage.includes('unauthorized') ||
        lowerMessage.includes('invalid api key') ||
        lowerMessage.includes('authentication failed')) {
      return ERROR_CODES.INVALID_API_KEY;
    }

    if (lowerMessage.includes('rate limit') ||
        lowerMessage.includes('too many requests')) {
      return ERROR_CODES.RATE_LIMIT_EXCEEDED;
    }

    if (lowerMessage.includes('quota') ||
        lowerMessage.includes('billing') ||
        lowerMessage.includes('insufficient funds')) {
      return ERROR_CODES.QUOTA_EXCEEDED;
    }

    if (lowerMessage.includes('timeout') ||
        lowerMessage.includes('timed out')) {
      return ERROR_CODES.TIMEOUT;
    }

    if (lowerMessage.includes('network') ||
        lowerMessage.includes('connection')) {
      return ERROR_CODES.NETWORK_ERROR;
    }

    return ERROR_CODES.SERVER_ERROR;
  }

  /**
   * Gets error code from HTTP status code.
   *
   * @method getErrorCodeFromStatus
   * @param {number} status - HTTP status code
   * @returns {string} Error code
   * @since 2.0.0
   */
  getErrorCodeFromStatus(status) {
    switch (status) {
      case 401:
      case 403:
        return ERROR_CODES.INVALID_API_KEY;
      case 429:
        return ERROR_CODES.RATE_LIMIT_EXCEEDED;
      case 402:
        return ERROR_CODES.QUOTA_EXCEEDED;
      case 408:
      case 504:
        return ERROR_CODES.TIMEOUT;
      case 500:
      case 502:
      case 503:
        return ERROR_CODES.SERVER_ERROR;
      default:
        return ERROR_CODES.INVALID_REQUEST;
    }
  }

  /**
   * Formats error message for user display.
   *
   * @method formatErrorMessage
   * @param {string} message - Original error message
   * @param {string} code - Error code
   * @returns {string} Formatted error message
   * @since 2.0.0
   */
  formatErrorMessage(message, code) {
    const providerName = this.displayName;

    switch (code) {
      case ERROR_CODES.INVALID_API_KEY:
        return `Authentication failed for ${providerName}. Please check your API key.`;
      case ERROR_CODES.RATE_LIMIT_EXCEEDED:
        return `Rate limit exceeded for ${providerName}. Please wait before making more requests.`;
      case ERROR_CODES.QUOTA_EXCEEDED:
        return `Quota exceeded for ${providerName}. Please check your billing or usage limits.`;
      case ERROR_CODES.TIMEOUT:
        return `Request timeout for ${providerName}. Please try again.`;
      case ERROR_CODES.NETWORK_ERROR:
        return `Network error connecting to ${providerName}. Please check your connection.`;
      case ERROR_CODES.SERVER_ERROR:
        return `${providerName} server error. Please try again later.`;
      default:
        return `${providerName} error: ${message}`;
    }
  }

  /**
   * Processes API response in a standardized way.
   *
   * @method processResponse
   * @param {Response} response - Fetch response object
   * @param {string} context - Context for error handling
   * @returns {Promise<Object>} Parsed response data
   * @since 2.0.0
   * @async
   */
  async processResponse(response, context = 'API call') {
    // Update rate limits from headers if available
    this.updateRateLimitFromHeaders(response.headers);

    if (!response.ok) {
      let errorData = {};
      try {
        errorData = await response.json();
      } catch (e) {
        // Response body is not JSON, use status text
      }

      const error = this.handleError(response, context, { errorData });
      throw error;
    }

    try {
      return await response.json();
    } catch (error) {
      throw this.handleError(new Error('Invalid JSON response'), context);
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
    // Common rate limit headers
    const rateLimitRemaining = headers.get('x-ratelimit-remaining') ||
                              headers.get('x-rate-limit-remaining') ||
                              headers.get('ratelimit-remaining');

    const rateLimitReset = headers.get('x-ratelimit-reset') ||
                          headers.get('x-rate-limit-reset') ||
                          headers.get('ratelimit-reset');

    const rateLimitLimit = headers.get('x-ratelimit-limit') ||
                          headers.get('x-rate-limit-limit') ||
                          headers.get('ratelimit-limit');

    if (rateLimitRemaining !== null) {
      const remaining = parseInt(rateLimitRemaining, 10);
      if (!isNaN(remaining)) {
        this.rateLimits.currentRequests = Math.max(0, this.rateLimits.requestsPerMinute - remaining);
      }
    }

    if (rateLimitReset !== null) {
      const reset = parseInt(rateLimitReset, 10);
      if (!isNaN(reset)) {
        // Convert Unix timestamp to milliseconds if needed
        this.rateLimits.resetTime = reset > 1000000000000 ? reset : reset * 1000;
      }
    }

    if (rateLimitLimit !== null) {
      const limit = parseInt(rateLimitLimit, 10);
      if (!isNaN(limit)) {
        this.rateLimits.requestsPerMinute = limit;
      }
    }
  }

  /**
   * Builds authentication headers for the provider.
   *
   * @method buildAuthHeaders
   * @param {Object} credentials - Authentication credentials
   * @returns {Object} Authentication headers
   * @since 2.0.0
   */
  buildAuthHeaders(credentials) {
    // Default implementation - override in concrete providers
    if (credentials.apiKey) {
      return {
        'Authorization': `Bearer ${credentials.apiKey}`
      };
    }
    return {};
  }

  /**
   * Builds request headers with authentication and common headers.
   *
   * @method buildRequestHeaders
   * @param {Object} credentials - Authentication credentials
   * @param {Object} additionalHeaders - Additional headers
   * @returns {Object} Complete request headers
   * @since 2.0.0
   */
  buildRequestHeaders(credentials, additionalHeaders = {}) {
    return {
      'Content-Type': 'application/json',
      'User-Agent': `PromptBoost/2.0.0 (${this.name})`,
      ...this.buildAuthHeaders(credentials),
      ...additionalHeaders
    };
  }

  /**
   * Gets provider metadata.
   *
   * @method getMetadata
   * @returns {Object} Provider metadata
   * @since 2.0.0
   */
  getMetadata() {
    return {
      name: this.name,
      displayName: this.displayName,
      description: this.description,
      supportedFeatures: this.supportedFeatures,
      isAuthenticated: this.isAuthenticated,
      lastError: this.lastError,
      rateLimitStatus: this.getRateLimitStatus()
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = Provider;
} else if (typeof window !== 'undefined') {
  window.Provider = Provider;
}
