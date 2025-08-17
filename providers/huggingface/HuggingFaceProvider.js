/**
 * @fileoverview Hugging Face Provider for PromptBoost
 * Implements Hugging Face Inference API integration with the Provider interface.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

/**
 * Hugging Face provider implementation.
 * Supports Hugging Face models through their Inference API.
 * 
 * @class HuggingFaceProvider
 * @extends Provider
 * @since 2.0.0
 */
class HuggingFaceProvider extends Provider {
  /**
   * Creates an instance of HuggingFaceProvider.
   * 
   * @constructor
   * @param {Object} config - Provider configuration
   * @since 2.0.0
   */
  constructor(config) {
    super({
      name: 'huggingface',
      displayName: 'Hugging Face',
      description: 'Access to thousands of open-source models via Hugging Face Inference API',
      supportedFeatures: ['text-generation', 'chat', 'summarization', 'translation', 'classification'],
      ...config
    });

    this.baseURL = 'https://api-inference.huggingface.co/models';
    this.apiKey = null;
    this.models = [
      {
        id: 'microsoft/DialoGPT-large',
        name: 'DialoGPT Large',
        description: 'Conversational AI model for dialogue generation',
        type: 'text-generation',
        maxTokens: 1024,
        free: true
      },
      {
        id: 'gpt2',
        name: 'GPT-2',
        description: 'OpenAI\'s GPT-2 model for text generation',
        type: 'text-generation',
        maxTokens: 1024,
        free: true
      },
      {
        id: 'facebook/blenderbot-400M-distill',
        name: 'BlenderBot 400M',
        description: 'Facebook\'s conversational AI model',
        type: 'text-generation',
        maxTokens: 512,
        free: true
      },
      {
        id: 'microsoft/GODEL-v1_1-large-seq2seq',
        name: 'GODEL Large',
        description: 'Goal-oriented dialogue model',
        type: 'text2text-generation',
        maxTokens: 1024,
        free: true
      },
      {
        id: 'google/flan-t5-large',
        name: 'FLAN-T5 Large',
        description: 'Instruction-tuned T5 model',
        type: 'text2text-generation',
        maxTokens: 512,
        free: true
      },
      {
        id: 'mistralai/Mistral-7B-Instruct-v0.1',
        name: 'Mistral 7B Instruct',
        description: 'Mistral\'s instruction-following model',
        type: 'text-generation',
        maxTokens: 4096,
        free: false
      }
    ];
  }

  /**
   * Authenticates with Hugging Face API.
   * 
   * @method authenticate
   * @param {Object} credentials - Authentication credentials
   * @param {string} [credentials.apiKey] - Hugging Face API token (optional for public models)
   * @returns {Promise<boolean>} True if authentication successful
   * @throws {Error} When authentication fails
   * @since 2.0.0
   * @async
   */
  async authenticate(credentials) {
    try {
      this.apiKey = credentials.apiKey || null;

      // Test authentication by making a simple request
      const testModel = 'gpt2';
      const response = await fetch(`${this.baseURL}/${testModel}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify({
          inputs: 'Hello',
          parameters: {
            max_length: 10,
            do_sample: false
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        if (response.status === 401) {
          throw new Error('Invalid API token');
        }
        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
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
   * @param {string} [config.apiKey] - Hugging Face API token
   * @param {string} [config.model] - Model to use
   * @returns {Object} Validation result with isValid boolean and errors array
   * @since 2.0.0
   */
  validateConfig(config) {
    const errors = [];

    // API key is optional for public models
    if (config.apiKey && (typeof config.apiKey !== 'string' || config.apiKey.trim().length === 0)) {
      errors.push('API token must be a non-empty string if provided');
    }

    if (config.model && !this.models.find(m => m.id === config.model)) {
      // Allow custom models not in our predefined list
      console.warn(`Model ${config.model} not in predefined list, but allowing custom models`);
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Gets available models for Hugging Face.
   * 
   * @method getModels
   * @returns {Promise<Array<Object>>} Array of available models
   * @since 2.0.0
   * @async
   */
  async getModels() {
    // For now, return the predefined list
    // In the future, we could query the Hugging Face Hub API for more models
    return this.models;
  }

  /**
   * Calls the Hugging Face Inference API to process text.
   * 
   * @method callAPI
   * @param {string} prompt - The prompt to send to the API
   * @param {Object} options - API call options
   * @param {string} [options.model='gpt2'] - Model to use
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

      const model = options.model || 'gpt2';
      const maxTokens = Math.min(options.maxTokens || 1000, 1024); // HF has lower limits
      const temperature = options.temperature || 0.7;

      // Check rate limits
      if (!this.checkRateLimit(maxTokens)) {
        throw new Error('Rate limit exceeded');
      }

      const modelInfo = this.models.find(m => m.id === model);
      const modelType = modelInfo?.type || 'text-generation';

      let requestBody;
      let endpoint = `${this.baseURL}/${model}`;

      // Different request formats for different model types
      if (modelType === 'text2text-generation') {
        requestBody = {
          inputs: prompt,
          parameters: {
            max_length: maxTokens,
            temperature: temperature,
            do_sample: temperature > 0
          }
        };
      } else {
        requestBody = {
          inputs: prompt,
          parameters: {
            max_new_tokens: maxTokens,
            temperature: temperature,
            do_sample: temperature > 0,
            return_full_text: false
          }
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        // Handle model loading errors
        if (response.status === 503 && errorData.error?.includes('loading')) {
          throw new Error('Model is currently loading, please try again in a few moments');
        }

        throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Handle different response formats
      if (Array.isArray(data)) {
        if (data.length === 0) {
          throw new Error('Empty response from API');
        }

        const result = data[0];

        // For text-generation models
        if (result.generated_text !== undefined) {
          return result.generated_text;
        }

        // For text2text-generation models
        if (result.generated_text !== undefined) {
          return result.generated_text;
        }

        // For other formats
        if (typeof result === 'string') {
          return result;
        }
      }

      // Handle single object response
      if (data.generated_text !== undefined) {
        return data.generated_text;
      }

      throw new Error('Unexpected response format from Hugging Face API');
    } catch (error) {
      throw this.handleError(error, 'API call');
    }
  }

  /**
   * Gets the default model for Hugging Face.
   * 
   * @method getDefaultModel
   * @returns {string} Default model name
   * @since 2.0.0
   */
  getDefaultModel() {
    return 'gpt2';
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
        required: false,
        label: 'API Token',
        description: 'Hugging Face API token (optional for public models)',
        placeholder: 'Enter your Hugging Face API token (optional)',
        sensitive: true
      },
      model: {
        type: 'select',
        required: false,
        label: 'Model',
        description: 'Hugging Face model to use',
        default: 'gpt2',
        options: this.models.map(m => ({
          value: m.id,
          label: m.name,
          description: m.description
        }))
      },
      customModel: {
        type: 'string',
        required: false,
        label: 'Custom Model',
        description: 'Use a custom model ID from Hugging Face Hub',
        placeholder: 'e.g., microsoft/DialoGPT-medium'
      }
    };
  }

  /**
   * Checks if a model requires authentication.
   * 
   * @method requiresAuth
   * @param {string} model - Model ID to check
   * @returns {boolean} True if model requires authentication
   * @since 2.0.0
   */
  requiresAuth(model) {
    const modelInfo = this.models.find(m => m.id === model);
    return modelInfo ? !modelInfo.free : true; // Assume custom models require auth
  }

  /**
   * Gets usage statistics.
   * Note: Hugging Face doesn't provide detailed token counting, so this is estimated.
   * 
   * @method getUsageStats
   * @param {number} inputTokens - Number of input tokens (estimated)
   * @param {number} outputTokens - Number of output tokens (estimated)
   * @param {string} model - Model used
   * @returns {Object} Usage statistics
   * @since 2.0.0
   */
  getUsageStats(inputTokens, outputTokens, model) {
    const modelInfo = this.models.find(m => m.id === model);

    return {
      inputTokens,
      outputTokens,
      totalTokens: inputTokens + outputTokens,
      inputCost: 0, // Most HF models are free
      outputCost: 0,
      totalCost: 0,
      model: modelInfo?.name || model,
      note: 'Hugging Face Inference API is free for most models'
    };
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = HuggingFaceProvider;
} else if (typeof window !== 'undefined') {
  window.HuggingFaceProvider = HuggingFaceProvider;
}
