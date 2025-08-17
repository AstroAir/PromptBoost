/**
 * @fileoverview Google Gemini Provider for PromptBoost
 * Implements Google Gemini API integration with the Provider interface.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

/**
 * Google Gemini provider implementation.
 * Supports Google's Gemini models through the Google AI Studio API.
 * 
 * @class GeminiProvider
 * @extends Provider
 * @since 2.0.0
 */
class GeminiProvider extends Provider {
  /**
   * Creates an instance of GeminiProvider.
   * 
   * @constructor
   * @param {Object} config - Provider configuration
   * @since 2.0.0
   */
  constructor(config) {
    super({
      name: 'gemini',
      displayName: 'Google Gemini',
      description: 'Google\'s advanced AI model with multimodal capabilities',
      supportedFeatures: ['text-generation', 'chat', 'multimodal', 'streaming'],
      ...config
    });

    this.baseURL = 'https://generativelanguage.googleapis.com/v1beta';
    this.apiKey = null;
    this.models = [
      {
        id: 'gemini-1.5-pro',
        name: 'Gemini 1.5 Pro',
        description: 'Most capable model for complex reasoning tasks',
        maxTokens: 2097152,
        inputCost: 0.00125, // per 1K tokens
        outputCost: 0.005   // per 1K tokens
      },
      {
        id: 'gemini-1.5-flash',
        name: 'Gemini 1.5 Flash',
        description: 'Fast and efficient model for everyday tasks',
        maxTokens: 1048576,
        inputCost: 0.000075,
        outputCost: 0.0003
      },
      {
        id: 'gemini-pro',
        name: 'Gemini Pro',
        description: 'Best model for text-only tasks',
        maxTokens: 32768,
        inputCost: 0.0005,
        outputCost: 0.0015
      }
    ];
  }

  /**
   * Authenticates with Google Gemini API.
   * 
   * @method authenticate
   * @param {Object} credentials - Authentication credentials
   * @param {string} credentials.apiKey - Google AI Studio API key
   * @returns {Promise<boolean>} True if authentication successful
   * @throws {Error} When authentication fails
   * @since 2.0.0
   * @async
   */
  async authenticate(credentials) {
    try {
      if (!credentials.apiKey) {
        throw new Error('API key is required for Google Gemini');
      }

      this.apiKey = credentials.apiKey;

      // Test authentication by listing models
      const response = await fetch(`${this.baseURL}/models?key=${this.apiKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
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
   * Validates the provider configuration.
   * 
   * @method validateConfig
   * @param {Object} config - Configuration to validate
   * @param {string} config.apiKey - Google AI Studio API key
   * @param {string} [config.model] - Model to use
   * @returns {Object} Validation result with isValid boolean and errors array
   * @since 2.0.0
   */
  validateConfig(config) {
    const errors = [];

    if (!config.apiKey) {
      errors.push('API key is required');
    } else if (typeof config.apiKey !== 'string' || config.apiKey.trim().length === 0) {
      errors.push('API key must be a non-empty string');
    }

    if (config.model && !this.models.find(m => m.id === config.model)) {
      errors.push(`Unsupported model: ${config.model}`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Gets available models for Google Gemini.
   * 
   * @method getModels
   * @returns {Promise<Array<Object>>} Array of available models
   * @since 2.0.0
   * @async
   */
  async getModels() {
    try {
      if (!this.isAuthenticated) {
        return this.models; // Return static list if not authenticated
      }

      const response = await fetch(`${this.baseURL}/models?key=${this.apiKey}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('Failed to fetch live models, returning static list');
        return this.models;
      }

      const data = await response.json();

      // Filter and format models
      const liveModels = data.models
        .filter(model => model.supportedGenerationMethods?.includes('generateContent'))
        .map(model => {
          const staticModel = this.models.find(m => model.name.includes(m.id));
          return {
            id: model.name.split('/').pop(),
            name: model.displayName || model.name,
            description: model.description || 'Google Gemini model',
            maxTokens: staticModel?.maxTokens || 32768,
            inputCost: staticModel?.inputCost || 0.001,
            outputCost: staticModel?.outputCost || 0.002
          };
        });

      return liveModels.length > 0 ? liveModels : this.models;
    } catch (error) {
      console.warn('Error fetching models:', error.message);
      return this.models;
    }
  }

  /**
   * Calls the Google Gemini API to process text.
   * 
   * @method callAPI
   * @param {string} prompt - The prompt to send to the API
   * @param {Object} options - API call options
   * @param {string} [options.model='gemini-pro'] - Model to use
   * @param {number} [options.maxTokens=1000] - Maximum tokens to generate
   * @param {number} [options.temperature=0.7] - Temperature for generation
   * @param {boolean} [options.stream=false] - Whether to stream the response
   * @returns {Promise<string>} Generated text
   * @throws {Error} When API call fails
   * @since 2.0.0
   * @async
   */
  async callAPI(prompt, options = {}) {
    try {
      if (!this.isAuthenticated) {
        throw new Error('Provider not authenticated');
      }

      const model = options.model || 'gemini-pro';
      const maxTokens = options.maxTokens || 1000;
      const temperature = options.temperature || 0.7;

      // Check rate limits
      if (!this.checkRateLimit(maxTokens)) {
        throw new Error('Rate limit exceeded');
      }

      const requestBody = {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          maxOutputTokens: maxTokens,
          temperature: temperature,
          topP: 0.8,
          topK: 40
        },
        safetySettings: [
          {
            category: 'HARM_CATEGORY_HARASSMENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_HATE_SPEECH',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          },
          {
            category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
            threshold: 'BLOCK_MEDIUM_AND_ABOVE'
          }
        ]
      };

      const endpoint = `${this.baseURL}/models/${model}:generateContent?key=${this.apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Handle safety blocks
      if (data.promptFeedback?.blockReason) {
        throw new Error(`Content blocked: ${data.promptFeedback.blockReason}`);
      }

      // Extract generated text
      const candidates = data.candidates;
      if (!candidates || candidates.length === 0) {
        throw new Error('No response generated');
      }

      const candidate = candidates[0];
      if (candidate.finishReason === 'SAFETY') {
        throw new Error('Response blocked by safety filters');
      }

      const parts = candidate.content?.parts;
      if (!parts || parts.length === 0) {
        throw new Error('Empty response from API');
      }

      return parts[0].text || '';
    } catch (error) {
      throw this.handleError(error, 'API call');
    }
  }

  /**
   * Gets the default model for Google Gemini.
   * 
   * @method getDefaultModel
   * @returns {string} Default model name
   * @since 2.0.0
   */
  getDefaultModel() {
    return 'gemini-pro';
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
        description: 'Google AI Studio API key',
        placeholder: 'Enter your Google AI Studio API key',
        sensitive: true
      },
      model: {
        type: 'select',
        required: false,
        label: 'Model',
        description: 'Gemini model to use',
        default: 'gemini-pro',
        options: this.models.map(m => ({ value: m.id, label: m.name }))
      }
    };
  }

  /**
   * Gets usage statistics and costs.
   * 
   * @method getUsageStats
   * @param {number} inputTokens - Number of input tokens
   * @param {number} outputTokens - Number of output tokens
   * @param {string} model - Model used
   * @returns {Object} Usage statistics
   * @since 2.0.0
   */
  getUsageStats(inputTokens, outputTokens, model) {
    const modelInfo = this.models.find(m => m.id === model) || this.models[0];

    const inputCost = (inputTokens / 1000) * modelInfo.inputCost;
    const outputCost = (outputTokens / 1000) * modelInfo.outputCost;
    const totalCost = inputCost + outputCost;

    return {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      inputCost,
      outputCost,
      totalCost,
      model: modelInfo.name
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = GeminiProvider;
} else if (typeof window !== 'undefined') {
  window.GeminiProvider = GeminiProvider;
}
