/**
 * @fileoverview Local Model Provider for PromptBoost
 * Implements local model integration supporting Ollama, LM Studio, and other local APIs.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

/**
 * Local model provider implementation.
 * Supports local model servers like Ollama, LM Studio, and custom local APIs.
 * 
 * @class LocalProvider
 * @extends Provider
 * @since 2.0.0
 */
class LocalProvider extends Provider {
  /**
   * Creates an instance of LocalProvider.
   * 
   * @constructor
   * @param {Object} config - Provider configuration
   * @since 2.0.0
   */
  constructor(config) {
    super({
      name: 'local',
      displayName: 'Local Models',
      description: 'Connect to local model servers like Ollama, LM Studio, or custom APIs',
      supportedFeatures: ['text-generation', 'chat', 'streaming', 'custom-endpoints'],
      ...config
    });

    this.baseURL = config.baseURL || 'http://localhost:11434'; // Default Ollama port
    this.serverType = config.serverType || 'ollama'; // ollama, lmstudio, custom
    this.apiKey = null; // Some local servers might require auth
    this.availableModels = [];
    this.serverInfo = null;
  }

  /**
   * Authenticates with the local model server.
   * 
   * @method authenticate
   * @param {Object} credentials - Authentication credentials
   * @param {string} [credentials.apiKey] - API key if required by local server
   * @param {string} [credentials.baseURL] - Base URL of the local server
   * @param {string} [credentials.serverType] - Type of server (ollama, lmstudio, custom)
   * @returns {Promise<boolean>} True if authentication successful
   * @throws {Error} When authentication fails
   * @since 2.0.0
   * @async
   */
  async authenticate(credentials) {
    try {
      this.apiKey = credentials.apiKey || null;
      this.baseURL = credentials.baseURL || this.baseURL;
      this.serverType = credentials.serverType || this.serverType;

      // Test connection by checking server health
      const healthEndpoint = this.getHealthEndpoint();
      const response = await fetch(healthEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        }
      });

      if (!response.ok) {
        throw new Error(`Server not accessible: HTTP ${response.status}`);
      }

      // Try to get server info
      await this.getServerInfo();

      this.isAuthenticated = true;
      return true;
    } catch (error) {
      this.isAuthenticated = false;
      throw this.handleError(error, 'authentication');
    }
  }

  /**
   * Gets the health check endpoint based on server type.
   * 
   * @method getHealthEndpoint
   * @returns {string} Health check endpoint URL
   * @since 2.0.0
   */
  getHealthEndpoint() {
    switch (this.serverType) {
      case 'ollama':
        return `${this.baseURL}/api/tags`; // Ollama's model list endpoint
      case 'lmstudio':
        return `${this.baseURL}/v1/models`; // LM Studio uses OpenAI-compatible API
      case 'custom':
        return `${this.baseURL}/health`; // Assume custom servers have health endpoint
      default:
        return `${this.baseURL}/api/tags`;
    }
  }

  /**
   * Gets server information.
   * 
   * @method getServerInfo
   * @returns {Promise<Object>} Server information
   * @since 2.0.0
   * @async
   */
  async getServerInfo() {
    try {
      let endpoint, response;

      switch (this.serverType) {
        case 'ollama':
          endpoint = `${this.baseURL}/api/version`;
          response = await fetch(endpoint);
          if (response.ok) {
            this.serverInfo = await response.json();
          }
          break;
        case 'lmstudio':
          // LM Studio doesn't have a version endpoint, so we'll use models endpoint
          endpoint = `${this.baseURL}/v1/models`;
          response = await fetch(endpoint, {
            headers: {
              ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
            }
          });
          if (response.ok) {
            const data = await response.json();
            this.serverInfo = { type: 'lmstudio', models: data.data?.length || 0 };
          }
          break;
        default:
          this.serverInfo = { type: this.serverType, status: 'connected' };
      }

      return this.serverInfo;
    } catch (error) {
      console.warn('Could not get server info:', error.message);
      return null;
    }
  }

  /**
   * Validates the provider configuration.
   * 
   * @method validateConfig
   * @param {Object} config - Configuration to validate
   * @param {string} config.baseURL - Base URL of the local server
   * @param {string} [config.serverType] - Type of server
   * @param {string} [config.apiKey] - API key if required
   * @returns {Object} Validation result with isValid boolean and errors array
   * @since 2.0.0
   */
  validateConfig(config) {
    const errors = [];

    if (!config.baseURL) {
      errors.push('Base URL is required for local model server');
    } else {
      try {
        new URL(config.baseURL);
      } catch {
        errors.push('Base URL must be a valid URL');
      }
    }

    if (config.serverType && !['ollama', 'lmstudio', 'custom'].includes(config.serverType)) {
      errors.push('Server type must be one of: ollama, lmstudio, custom');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Gets available models from the local server.
   * 
   * @method getModels
   * @returns {Promise<Array<Object>>} Array of available models
   * @since 2.0.0
   * @async
   */
  async getModels() {
    try {
      if (!this.isAuthenticated) {
        return [];
      }

      let endpoint, response, models = [];

      switch (this.serverType) {
        case 'ollama':
          endpoint = `${this.baseURL}/api/tags`;
          response = await fetch(endpoint);
          if (response.ok) {
            const data = await response.json();
            models = data.models?.map(model => ({
              id: model.name,
              name: model.name,
              description: `Ollama model - ${model.details?.family || 'Unknown family'}`,
              size: model.size,
              modified: model.modified_at,
              maxTokens: 4096 // Default, could be model-specific
            })) || [];
          }
          break;

        case 'lmstudio':
          endpoint = `${this.baseURL}/v1/models`;
          response = await fetch(endpoint, {
            headers: {
              ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
            }
          });
          if (response.ok) {
            const data = await response.json();
            models = data.data?.map(model => ({
              id: model.id,
              name: model.id,
              description: `LM Studio model - ${model.object || 'model'}`,
              created: model.created,
              maxTokens: 4096
            })) || [];
          }
          break;

        case 'custom':
          // Try OpenAI-compatible endpoint first
          endpoint = `${this.baseURL}/v1/models`;
          response = await fetch(endpoint, {
            headers: {
              ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
            }
          });
          if (response.ok) {
            const data = await response.json();
            models = data.data?.map(model => ({
              id: model.id,
              name: model.id,
              description: `Custom model - ${model.object || 'model'}`,
              maxTokens: 4096
            })) || [];
          } else {
            // Fallback to custom endpoint
            endpoint = `${this.baseURL}/models`;
            response = await fetch(endpoint, {
              headers: {
                ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
              }
            });
            if (response.ok) {
              const data = await response.json();
              models = Array.isArray(data) ? data.map(model => ({
                id: typeof model === 'string' ? model : model.id,
                name: typeof model === 'string' ? model : model.name || model.id,
                description: 'Custom local model',
                maxTokens: 4096
              })) : [];
            }
          }
          break;
      }

      this.availableModels = models;
      return models;
    } catch (error) {
      console.warn('Error fetching models:', error.message);
      return this.availableModels;
    }
  }

  /**
   * Calls the local model API to process text.
   * 
   * @method callAPI
   * @param {string} prompt - The prompt to send to the API
   * @param {Object} options - API call options
   * @param {string} [options.model] - Model to use
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

      const model = options.model || this.getDefaultModel();
      const maxTokens = options.maxTokens || 1000;
      const temperature = options.temperature || 0.7;

      let endpoint, requestBody, response;

      switch (this.serverType) {
        case 'ollama':
          endpoint = `${this.baseURL}/api/generate`;
          requestBody = {
            model: model,
            prompt: prompt,
            stream: false,
            options: {
              num_predict: maxTokens,
              temperature: temperature
            }
          };
          break;

        case 'lmstudio':
        case 'custom':
          endpoint = `${this.baseURL}/v1/chat/completions`;
          requestBody = {
            model: model,
            messages: [{ role: 'user', content: prompt }],
            max_tokens: maxTokens,
            temperature: temperature,
            stream: false
          };
          break;
      }

      response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(this.apiKey && { 'Authorization': `Bearer ${this.apiKey}` })
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || errorData.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();

      // Extract response based on server type
      switch (this.serverType) {
        case 'ollama':
          return data.response || '';
        case 'lmstudio':
        case 'custom':
          return data.choices?.[0]?.message?.content || '';
        default:
          return data.response || data.text || '';
      }
    } catch (error) {
      throw this.handleError(error, 'API call');
    }
  }

  /**
   * Gets the default model for the local server.
   * 
   * @method getDefaultModel
   * @returns {string} Default model name
   * @since 2.0.0
   */
  getDefaultModel() {
    if (this.availableModels.length > 0) {
      return this.availableModels[0].id;
    }
    return 'llama2'; // Common default for Ollama
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
      baseURL: {
        type: 'string',
        required: true,
        label: 'Server URL',
        description: 'Base URL of your local model server',
        placeholder: 'http://localhost:11434',
        default: 'http://localhost:11434'
      },
      serverType: {
        type: 'select',
        required: true,
        label: 'Server Type',
        description: 'Type of local model server',
        default: 'ollama',
        options: [
          { value: 'ollama', label: 'Ollama' },
          { value: 'lmstudio', label: 'LM Studio' },
          { value: 'custom', label: 'Custom API' }
        ]
      },
      apiKey: {
        type: 'string',
        required: false,
        label: 'API Key',
        description: 'API key if required by your local server',
        placeholder: 'Enter API key (if required)',
        sensitive: true
      },
      model: {
        type: 'string',
        required: false,
        label: 'Model Name',
        description: 'Name of the model to use (will be auto-detected if available)',
        placeholder: 'e.g., llama2, codellama, mistral'
      }
    };
  }

  /**
   * Tests the connection to the local server.
   * 
   * @method testConnection
   * @param {Object} config - Configuration to test
   * @returns {Promise<Object>} Test result
   * @since 2.0.0
   * @async
   */
  async testConnection(config) {
    try {
      const tempProvider = new LocalProvider(config);
      await tempProvider.authenticate(config);

      const models = await tempProvider.getModels();
      const serverInfo = await tempProvider.getServerInfo();

      return {
        success: true,
        serverInfo,
        modelsFound: models.length,
        models: models.slice(0, 5).map(m => m.name) // Show first 5 models
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LocalProvider;
} else if (typeof window !== 'undefined') {
  window.LocalProvider = LocalProvider;
}
