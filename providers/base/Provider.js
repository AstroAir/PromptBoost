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
    this.rateLimits = {
      requestsPerMinute: 60,
      tokensPerMinute: 10000,
      currentRequests: 0,
      currentTokens: 0,
      resetTime: Date.now() + 60000
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
  async authenticate(credentials) {
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
  validateConfig(config) {
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
  async callAPI(prompt, options) {
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
      this.rateLimits.resetTime = now + 60000; // Reset in 1 minute
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
   * Handles errors in a standardized way.
   * 
   * @method handleError
   * @param {Error} error - The error to handle
   * @param {string} context - Context where the error occurred
   * @returns {Error} Standardized error object
   * @since 2.0.0
   */
  handleError(error, context = 'unknown') {
    this.lastError = {
      message: error.message,
      context: context,
      timestamp: Date.now(),
      provider: this.name
    };

    // Standardize common error types
    if (error.message.toLowerCase().includes('unauthorized') || 
        error.message.toLowerCase().includes('invalid api key')) {
      return new Error(`Authentication failed for ${this.displayName}: ${error.message}`);
    }
    
    if (error.message.toLowerCase().includes('rate limit')) {
      return new Error(`Rate limit exceeded for ${this.displayName}: ${error.message}`);
    }
    
    if (error.message.toLowerCase().includes('quota')) {
      return new Error(`Quota exceeded for ${this.displayName}: ${error.message}`);
    }

    return new Error(`${this.displayName} error: ${error.message}`);
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
