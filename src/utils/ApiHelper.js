/**
 * @fileoverview API Helper Utilities for PromptBoost
 * Provides common HTTP request utilities, response parsing, rate limiting,
 * and authentication helpers for API interactions.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

/**
 * HTTP request utilities and helpers
 * @class ApiHelper
 */
class ApiHelper {
  /**
   * Makes an HTTP request with enhanced error handling and logging
   * 
   * @static
   * @method request
   * @param {string} url - Request URL
   * @param {Object} [options={}] - Request options
   * @param {string} [options.method='GET'] - HTTP method
   * @param {Object} [options.headers={}] - Request headers
   * @param {any} [options.body] - Request body
   * @param {number} [options.timeout=30000] - Request timeout in ms
   * @param {number} [options.retries=3] - Number of retry attempts
   * @param {Function} [options.onProgress] - Progress callback
   * @returns {Promise<Response>} Fetch response
   * @throws {Error} When request fails after all retries
   */
  static async request(url, options = {}) {
    const {
      method = 'GET',
      headers = {},
      body,
      timeout = 30000,
      retries = 3,
      onProgress
    } = options;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const requestOptions = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      },
      signal: controller.signal
    };

    if (body && method !== 'GET') {
      requestOptions.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    let lastError;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const startTime = performance.now();

        if (onProgress) {
          onProgress({ attempt, total: retries + 1, status: 'requesting' });
        }

        const response = await fetch(url, requestOptions);
        const duration = performance.now() - startTime;

        clearTimeout(timeoutId);

        // Log API call details
        if (typeof Logger !== 'undefined') {
          const logger = new Logger('ApiHelper');
          logger.logApiResponse(method, url, response.status, duration);
        }

        if (onProgress) {
          onProgress({
            attempt,
            total: retries + 1,
            status: response.ok ? 'success' : 'error',
            response
          });
        }

        return response;

      } catch (error) {
        lastError = error;

        if (onProgress) {
          onProgress({ attempt, total: retries + 1, status: 'error', error });
        }

        // Don't retry on abort (timeout) or network errors on last attempt
        if (attempt === retries || error.name === 'AbortError') {
          break;
        }

        // Wait before retry with exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt), 10000);
        await this.sleep(delay);
      }
    }

    clearTimeout(timeoutId);
    throw lastError || new Error('Request failed after all retries');
  }

  /**
   * Makes a JSON API request with automatic parsing
   * 
   * @static
   * @method jsonRequest
   * @param {string} url - Request URL
   * @param {Object} [options={}] - Request options
   * @returns {Promise<any>} Parsed JSON response
   * @throws {Error} When request fails or response is not JSON
   */
  static async jsonRequest(url, options = {}) {
    const response = await this.request(url, options);

    if (!response.ok) {
      const errorData = await this.safeJsonParse(response);
      throw new Error(
        errorData?.error?.message ||
        errorData?.message ||
        `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return await this.safeJsonParse(response);
  }

  /**
   * Safely parses JSON response with error handling
   * 
   * @static
   * @method safeJsonParse
   * @param {Response} response - Fetch response
   * @returns {Promise<any>} Parsed JSON or error object
   */
  static async safeJsonParse(response) {
    try {
      return await response.json();
    } catch (error) {
      const text = await response.text().catch(() => '');
      throw new Error(`Invalid JSON response: ${text.substring(0, 100)}`);
    }
  }

  /**
   * Creates authentication headers for different providers
   * 
   * @static
   * @method createAuthHeaders
   * @param {string} provider - Provider name
   * @param {string} apiKey - API key
   * @param {Object} [additionalHeaders={}] - Additional headers
   * @returns {Object} Headers object
   */
  static createAuthHeaders(provider, apiKey, additionalHeaders = {}) {
    const headers = { ...additionalHeaders };

    switch (provider.toLowerCase()) {
      case 'openai':
      case 'openrouter':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;

      case 'anthropic':
        headers['x-api-key'] = apiKey;
        headers['anthropic-version'] = '2023-06-01';
        break;

      case 'cohere':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;

      case 'huggingface':
        headers['Authorization'] = `Bearer ${apiKey}`;
        break;

      case 'gemini':
        // Gemini uses API key in URL parameter
        break;

      default:
        headers['Authorization'] = `Bearer ${apiKey}`;
    }

    return headers;
  }

  /**
   * Builds request body for different providers
   * 
   * @static
   * @method buildRequestBody
   * @param {string} provider - Provider name
   * @param {string} prompt - Text prompt
   * @param {Object} options - Request options
   * @returns {Object} Request body object
   */
  static buildRequestBody(provider, prompt, options = {}) {
    const {
      model = 'default',
      maxTokens = 1000,
      temperature = 0.7,
      stream = false
    } = options;

    switch (provider.toLowerCase()) {
      case 'openai':
      case 'openrouter':
        return {
          model,
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokens,
          temperature,
          stream
        };

      case 'anthropic':
        return {
          model,
          max_tokens: maxTokens,
          messages: [{ role: 'user', content: prompt }],
          temperature,
          stream
        };

      case 'cohere':
        return {
          model,
          message: prompt,
          max_tokens: maxTokens,
          temperature,
          stream
        };

      case 'huggingface':
        return {
          inputs: prompt,
          parameters: {
            max_length: maxTokens,
            temperature,
            do_sample: temperature > 0
          }
        };

      case 'gemini':
        return {
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature
          }
        };

      default:
        return {
          prompt,
          max_tokens: maxTokens,
          temperature,
          stream
        };
    }
  }

  /**
   * Extracts response text from different provider response formats
   * 
   * @static
   * @method extractResponseText
   * @param {Object} responseData - API response data
   * @param {string} provider - Provider name
   * @returns {string} Extracted text
   */
  static extractResponseText(responseData, provider) {
    if (!responseData) return '';

    switch (provider.toLowerCase()) {
      case 'openai':
      case 'openrouter':
        return responseData.choices?.[0]?.message?.content || '';

      case 'anthropic':
        return responseData.content?.[0]?.text || '';

      case 'cohere':
        return responseData.text || '';

      case 'huggingface':
        if (Array.isArray(responseData)) {
          return responseData[0]?.generated_text || '';
        }
        return responseData.generated_text || '';

      case 'gemini':
        return responseData.candidates?.[0]?.content?.parts?.[0]?.text || '';

      default:
        return responseData.text || responseData.response || responseData.output || '';
    }
  }

  /**
   * Validates API response for errors
   * 
   * @static
   * @method validateResponse
   * @param {Object} responseData - API response data
   * @param {string} provider - Provider name
   * @throws {Error} When response contains errors
   */
  static validateResponse(responseData, provider) {
    if (!responseData) {
      throw new Error('Empty response from API');
    }

    // Check for common error patterns
    if (responseData.error) {
      throw new Error(responseData.error.message || responseData.error);
    }

    if (responseData.errors && Array.isArray(responseData.errors)) {
      throw new Error(responseData.errors.map(e => e.message || e).join(', '));
    }

    // Provider-specific error checking
    switch (provider.toLowerCase()) {
      case 'openai':
      case 'openrouter':
        if (!responseData.choices || responseData.choices.length === 0) {
          throw new Error('No response choices returned');
        }
        break;

      case 'anthropic':
        if (!responseData.content || responseData.content.length === 0) {
          throw new Error('No content returned');
        }
        break;

      case 'gemini':
        if (!responseData.candidates || responseData.candidates.length === 0) {
          throw new Error('No candidates returned');
        }
        break;
    }
  }

  /**
   * Implements rate limiting for API requests
   * 
   * @static
   * @method rateLimit
   * @param {string} key - Rate limit key (e.g., provider name)
   * @param {number} maxRequests - Maximum requests per window
   * @param {number} windowMs - Time window in milliseconds
   * @returns {Promise<boolean>} True if request is allowed
   */
  static async rateLimit(key, maxRequests = 60, windowMs = 60000) {
    if (!this.rateLimitStore) {
      this.rateLimitStore = new Map();
    }

    const now = Date.now();
    const windowStart = now - windowMs;

    if (!this.rateLimitStore.has(key)) {
      this.rateLimitStore.set(key, []);
    }

    const requests = this.rateLimitStore.get(key);

    // Remove old requests outside the window
    const validRequests = requests.filter(timestamp => timestamp > windowStart);

    if (validRequests.length >= maxRequests) {
      const oldestRequest = Math.min(...validRequests);
      const waitTime = oldestRequest + windowMs - now;

      if (waitTime > 0) {
        await this.sleep(waitTime);
      }
    }

    // Add current request
    validRequests.push(now);
    this.rateLimitStore.set(key, validRequests);

    return true;
  }

  /**
   * Sleep utility for delays
   * 
   * @static
   * @method sleep
   * @param {number} ms - Milliseconds to sleep
   * @returns {Promise<void>} Promise that resolves after delay
   */
  static sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Sanitizes URL for logging (removes sensitive parameters)
   * 
   * @static
   * @method sanitizeUrlForLogging
   * @param {string} url - URL to sanitize
   * @returns {string} Sanitized URL
   */
  static sanitizeUrlForLogging(url) {
    try {
      const urlObj = new URL(url);
      const sensitiveParams = ['key', 'token', 'auth', 'password', 'secret'];

      sensitiveParams.forEach(param => {
        if (urlObj.searchParams.has(param)) {
          urlObj.searchParams.set(param, '[REDACTED]');
        }
      });

      return urlObj.toString();
    } catch {
      return url.replace(/[?&](key|token|auth|password|secret)=[^&]*/gi, '$1=[REDACTED]');
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ApiHelper };
} else if (typeof window !== 'undefined') {
  window.ApiHelper = ApiHelper;
}
