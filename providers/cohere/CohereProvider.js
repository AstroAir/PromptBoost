/**
 * @fileoverview Cohere Provider for PromptBoost
 * Implements Cohere API integration with the Provider interface.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

/**
 * Cohere provider implementation.
 * Supports Cohere's language models through their REST API.
 * 
 * @class CohereProvider
 * @extends Provider
 * @since 2.0.0
 */
class CohereProvider extends Provider {
  /**
   * Creates an instance of CohereProvider.
   * 
   * @constructor
   * @param {Object} config - Provider configuration
   * @since 2.0.0
   */
  constructor(config) {
    super({
      name: 'cohere',
      displayName: 'Cohere',
      description: 'Cohere\'s powerful language models for text generation and understanding',
      supportedFeatures: ['text-generation', 'chat', 'summarization', 'classification'],
      ...config
    });

    this.baseURL = 'https://api.cohere.ai/v1';
    this.apiKey = null;
    this.models = [
      {
        id: 'command-r-plus',
        name: 'Command R+',
        description: 'Most powerful model for complex reasoning and long-form generation',
        maxTokens: 128000,
        inputCost: 0.003,  // per 1K tokens
        outputCost: 0.015  // per 1K tokens
      },
      {
        id: 'command-r',
        name: 'Command R',
        description: 'Balanced model for general-purpose tasks',
        maxTokens: 128000,
        inputCost: 0.0005,
        outputCost: 0.0015
      },
      {
        id: 'command',
        name: 'Command',
        description: 'Fast and efficient model for everyday tasks',
        maxTokens: 4096,
        inputCost: 0.0015,
        outputCost: 0.002
      },
      {
        id: 'command-light',
        name: 'Command Light',
        description: 'Lightweight model for simple tasks',
        maxTokens: 4096,
        inputCost: 0.0003,
        outputCost: 0.0006
      }
    ];
  }

  /**
   * Authenticates with Cohere API.
   * 
   * @method authenticate
   * @param {Object} credentials - Authentication credentials
   * @param {string} credentials.apiKey - Cohere API key
   * @returns {Promise<boolean>} True if authentication successful
   * @throws {Error} When authentication fails
   * @since 2.0.0
   * @async
   */
  async authenticate(credentials) {
    try {
      if (!credentials.apiKey) {
        throw new Error('API key is required for Cohere');
      }

      this.apiKey = credentials.apiKey;

      // Test authentication by checking API key validity
      const response = await fetch(`${this.baseURL}/check-api-key`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      if (!data.valid) {
        throw new Error('Invalid API key');
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
   * @param {string} config.apiKey - Cohere API key
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
   * Gets available models for Cohere.
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

      const response = await fetch(`${this.baseURL}/models`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.warn('Failed to fetch live models, returning static list');
        return this.models;
      }

      const data = await response.json();
      
      // Filter and format models for generation tasks
      const liveModels = data.models
        .filter(model => model.endpoints?.includes('generate'))
        .map(model => {
          const staticModel = this.models.find(m => m.id === model.name);
          return {
            id: model.name,
            name: model.name.charAt(0).toUpperCase() + model.name.slice(1),
            description: staticModel?.description || 'Cohere language model',
            maxTokens: staticModel?.maxTokens || 4096,
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
   * Calls the Cohere API to process text.
   * 
   * @method callAPI
   * @param {string} prompt - The prompt to send to the API
   * @param {Object} options - API call options
   * @param {string} [options.model='command'] - Model to use
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

      const model = options.model || 'command';
      const maxTokens = options.maxTokens || 1000;
      const temperature = options.temperature || 0.7;

      // Check rate limits
      if (!this.checkRateLimit(maxTokens)) {
        throw new Error('Rate limit exceeded');
      }

      const requestBody = {
        model: model,
        prompt: prompt,
        max_tokens: maxTokens,
        temperature: temperature,
        k: 0,
        stop_sequences: [],
        return_likelihoods: 'NONE'
      };

      const response = await fetch(`${this.baseURL}/generate`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Extract generated text
      if (!data.generations || data.generations.length === 0) {
        throw new Error('No response generated');
      }

      const generation = data.generations[0];
      if (generation.finish_reason === 'ERROR') {
        throw new Error('Generation failed with error');
      }

      return generation.text || '';
    } catch (error) {
      throw this.handleError(error, 'API call');
    }
  }

  /**
   * Calls the Cohere Chat API for conversational interactions.
   * 
   * @method callChatAPI
   * @param {Array<Object>} messages - Array of message objects
   * @param {Object} options - API call options
   * @returns {Promise<string>} Generated response
   * @since 2.0.0
   * @async
   */
  async callChatAPI(messages, options = {}) {
    try {
      if (!this.isAuthenticated) {
        throw new Error('Provider not authenticated');
      }

      const model = options.model || 'command-r';
      const maxTokens = options.maxTokens || 1000;
      const temperature = options.temperature || 0.7;

      // Convert messages to Cohere format
      const chatHistory = messages.slice(0, -1).map(msg => ({
        role: msg.role === 'assistant' ? 'CHATBOT' : 'USER',
        message: msg.content
      }));

      const lastMessage = messages[messages.length - 1];

      const requestBody = {
        model: model,
        message: lastMessage.content,
        chat_history: chatHistory,
        max_tokens: maxTokens,
        temperature: temperature,
        k: 0,
        p: 0.75,
        frequency_penalty: 0.0,
        presence_penalty: 0.0
      };

      const response = await fetch(`${this.baseURL}/chat`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.text || '';
    } catch (error) {
      throw this.handleError(error, 'Chat API call');
    }
  }

  /**
   * Gets the default model for Cohere.
   * 
   * @method getDefaultModel
   * @returns {string} Default model name
   * @since 2.0.0
   */
  getDefaultModel() {
    return 'command';
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
        description: 'Cohere API key',
        placeholder: 'Enter your Cohere API key',
        sensitive: true
      },
      model: {
        type: 'select',
        required: false,
        label: 'Model',
        description: 'Cohere model to use',
        default: 'command',
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
  module.exports = CohereProvider;
} else if (typeof window !== 'undefined') {
  window.CohereProvider = CohereProvider;
}
