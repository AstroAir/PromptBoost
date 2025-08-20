/**
 * @fileoverview API Controller for PromptBoost Extension
 * Handles all API-related operations including LLM calls, provider management, and testing.
 *
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

// Import required constants
try {
  if (typeof STORAGE_KEYS === 'undefined') {
    importScripts('../config/Constants.js');
  }
} catch (error) {
  console.error('Failed to import constants:', error);
}

/**
 * Centralized API controller for managing LLM provider interactions.
 * Handles text optimization, provider testing, and model management.
 * 
 * @class ApiController
 * @since 2.0.0
 */
class ApiController {
  /**
   * Creates an instance of ApiController.
   * 
   * @constructor
   * @param {Object} dependencies - Injected dependencies
   * @param {Logger} dependencies.logger - Logger instance
   * @param {ProviderRegistry} dependencies.providerRegistry - Provider registry instance
   * @param {ConfigurationManager} dependencies.configManager - Configuration manager instance
   * @param {MessageRouter} dependencies.messageRouter - Message router instance
   */
  constructor(dependencies) {
    this.logger = dependencies.logger;
    this.providerRegistry = dependencies.providerRegistry;
    this.configManager = dependencies.configManager;
    this.messageRouter = dependencies.messageRouter;
  }

  /**
   * Handles text optimization requests.
   * 
   * @method handleOptimizeText
   * @param {Object} message - Message object containing text and settings
   * @param {Object} sender - Message sender information
   * @param {Function} sendResponse - Response callback function
   */
  async handleOptimizeText(message, sender, sendResponse) {
    try {
      const { text, settings } = message;
      this.logger.debug('Optimizing text', { textLength: text.length, provider: settings.provider });

      const optimizedText = await this.callLLMAPI(text, settings);

      const response = {
        type: 'OPTIMIZE_RESULT',
        success: true,
        data: { optimizedText }
      };

      this.messageRouter.sendResponse(sender, response, sendResponse);
    } catch (error) {
      this.logger.error('Text optimization failed:', error);
      
      const errorResponse = {
        type: 'OPTIMIZATION_ERROR',
        success: false,
        error: error.message
      };

      this.messageRouter.sendResponse(sender, errorResponse, sendResponse);
    }
  }

  /**
   * Handles text optimization with template requests.
   * 
   * @method handleOptimizeWithTemplate
   * @param {Object} message - Message object containing text, template ID, and settings
   * @param {Object} sender - Message sender information
   * @param {Function} sendResponse - Response callback function
   */
  async handleOptimizeWithTemplate(message, sender, sendResponse) {
    try {
      const { text, templateId, settings } = message;

      // Get the specific template
      const result = await chrome.storage.sync.get([STORAGE_KEYS.TEMPLATES]);
      const templates = result[STORAGE_KEYS.TEMPLATES] || {};
      const template = templates[templateId];

      if (!template) {
        throw new Error(`Template not found: ${templateId}`);
      }

      // Use the template's prompt
      const templateSettings = {
        ...settings,
        promptTemplate: template.template
      };

      const optimizedText = await this.callLLMAPI(text, templateSettings);

      const response = {
        type: 'OPTIMIZE_RESULT',
        success: true,
        data: {
          optimizedText,
          templateUsed: template.name
        }
      };

      this.messageRouter.sendResponse(sender, response, sendResponse);
    } catch (error) {
      this.logger.error('Template optimization failed:', error);
      
      const errorResponse = {
        type: 'OPTIMIZATION_ERROR',
        success: false,
        error: error.message
      };

      this.messageRouter.sendResponse(sender, errorResponse, sendResponse);
    }
  }

  /**
   * Handles API testing requests.
   * 
   * @method handleTestAPI
   * @param {Object} message - Message object containing test settings
   * @param {Object} sender - Message sender information
   * @param {Function} sendResponse - Response callback function
   */
  async handleTestAPI(message, sender, sendResponse) {
    try {
      const { settings } = message;
      this.logger.debug('Testing API connection', { provider: settings.provider });

      const provider = this.providerRegistry.getProvider(settings.provider);
      if (!provider) {
        throw new Error(`Provider not found: ${settings.provider}`);
      }

      const testResult = await provider.testConnection(settings);

      const response = {
        type: 'API_TEST_RESULT',
        success: true,
        data: testResult
      };

      this.messageRouter.sendResponse(sender, response, sendResponse);
    } catch (error) {
      this.logger.error('API test failed:', error);
      
      const errorResponse = {
        type: 'API_TEST_ERROR',
        success: false,
        error: error.message
      };

      this.messageRouter.sendResponse(sender, errorResponse, sendResponse);
    }
  }

  /**
   * Handles get providers requests.
   * 
   * @method handleGetProviders
   * @param {Object} message - Message object
   * @param {Object} sender - Message sender information
   * @param {Function} sendResponse - Response callback function
   */
  async handleGetProviders(message, sender, sendResponse) {
    try {
      const providers = this.providerRegistry.getAllProviders();
      
      const response = {
        type: 'PROVIDERS_RESULT',
        success: true,
        data: providers
      };

      this.messageRouter.sendResponse(sender, response, sendResponse);
    } catch (error) {
      this.logger.error('Get providers failed:', error);
      
      const errorResponse = {
        type: 'PROVIDERS_ERROR',
        success: false,
        error: error.message
      };

      this.messageRouter.sendResponse(sender, errorResponse, sendResponse);
    }
  }

  /**
   * Handles get provider models requests.
   * 
   * @method handleGetProviderModels
   * @param {Object} message - Message object containing provider name
   * @param {Object} sender - Message sender information
   * @param {Function} sendResponse - Response callback function
   */
  async handleGetProviderModels(message, sender, sendResponse) {
    try {
      const { provider: providerName } = message;
      const provider = this.providerRegistry.getProvider(providerName);
      
      if (!provider) {
        throw new Error(`Provider not found: ${providerName}`);
      }

      const models = await provider.getModels();
      
      const response = {
        type: 'PROVIDER_MODELS_RESULT',
        success: true,
        data: models
      };

      this.messageRouter.sendResponse(sender, response, sendResponse);
    } catch (error) {
      this.logger.error('Get provider models failed:', error);
      
      const errorResponse = {
        type: 'PROVIDER_MODELS_ERROR',
        success: false,
        error: error.message
      };

      this.messageRouter.sendResponse(sender, errorResponse, sendResponse);
    }
  }

  /**
   * Handles test provider requests.
   * 
   * @method handleTestProvider
   * @param {Object} message - Message object containing provider and config
   * @param {Object} sender - Message sender information
   * @param {Function} sendResponse - Response callback function
   */
  async handleTestProvider(message, sender, sendResponse) {
    try {
      const { provider: providerName, config } = message;
      const provider = this.providerRegistry.getProvider(providerName);
      
      if (!provider) {
        throw new Error(`Provider not found: ${providerName}`);
      }

      const testResult = await provider.testConnection(config);
      
      const response = {
        type: 'PROVIDER_TEST_RESULT',
        success: true,
        data: testResult
      };

      this.messageRouter.sendResponse(sender, response, sendResponse);
    } catch (error) {
      this.logger.error('Provider test failed:', error);
      
      const errorResponse = {
        type: 'PROVIDER_TEST_ERROR',
        success: false,
        error: error.message
      };

      this.messageRouter.sendResponse(sender, errorResponse, sendResponse);
    }
  }

  /**
   * Handles get provider config schema requests.
   * 
   * @method handleGetProviderConfigSchema
   * @param {Object} message - Message object containing provider name
   * @param {Object} sender - Message sender information
   * @param {Function} sendResponse - Response callback function
   */
  async handleGetProviderConfigSchema(message, sender, sendResponse) {
    try {
      const { provider: providerName } = message;
      const provider = this.providerRegistry.getProvider(providerName);
      
      if (!provider) {
        throw new Error(`Provider not found: ${providerName}`);
      }

      const schema = provider.getConfigSchema ? provider.getConfigSchema() : {};
      
      const response = {
        type: 'PROVIDER_CONFIG_SCHEMA_RESULT',
        success: true,
        data: schema
      };

      this.messageRouter.sendResponse(sender, response, sendResponse);
    } catch (error) {
      this.logger.error('Get provider config schema failed:', error);
      
      const errorResponse = {
        type: 'PROVIDER_CONFIG_SCHEMA_ERROR',
        success: false,
        error: error.message
      };

      this.messageRouter.sendResponse(sender, errorResponse, sendResponse);
    }
  }

  /**
   * Calls the LLM API with comprehensive error handling and retry logic.
   * 
   * @method callLLMAPI
   * @param {string} text - Text to optimize
   * @param {Object} settings - API settings
   * @param {number} retryCount - Current retry count
   * @returns {Promise<string>} Optimized text
   */
  async callLLMAPI(text, settings, retryCount = 0) {
    const maxRetries = RETRY_CONFIG.MAX_ATTEMPTS;
    const provider = settings.provider || 'openai';

    this.logger.startTiming(`callLLMAPI_${provider}`);

    try {
      // Get provider instance
      const providerInstance = this.providerRegistry.getProvider(provider, settings);
      if (!providerInstance) {
        throw new Error(`Provider not available: ${provider}`);
      }

      // Authenticate if needed
      if (!providerInstance.isAuthenticated) {
        await providerInstance.authenticate(settings);
      }

      // Prepare API call options
      const options = {
        model: settings.model || providerInstance.getDefaultModel(),
        maxTokens: settings.advanced?.maxTokens || 1000,
        temperature: settings.advanced?.temperature || 0.7
      };

      // Make API call
      const result = await providerInstance.callAPI(settings.promptTemplate.replace('{text}', text), options);

      this.logger.endTiming(`callLLMAPI_${provider}`);
      this.logger.info(`API call successful for ${provider}`, {
        textLength: text.length,
        resultLength: result.length,
        retryCount
      });

      return result;

    } catch (error) {
      this.logger.endTiming(`callLLMAPI_${provider}`);

      // Retry logic for transient errors
      if (retryCount < maxRetries && this.isRetryableError(error)) {
        this.logger.warn(`Retrying API call (attempt ${retryCount + 1}/${maxRetries}):`, error.message);
        await this.delay(Math.pow(2, retryCount) * RETRY_CONFIG.INITIAL_DELAY);
        return this.callLLMAPI(text, settings, retryCount + 1);
      }

      // Handle error with centralized error handler
      throw ErrorHandler.handle(error, 'ApiController.callLLMAPI', {
        category: ERROR_CATEGORIES.API,
        metadata: { provider, retryCount }
      });
    }
  }

  /**
   * Checks if an error is retryable.
   * 
   * @method isRetryableError
   * @param {Error} error - Error to check
   * @returns {boolean} True if error is retryable
   */
  isRetryableError(error) {
    const retryableErrors = [
      'timeout',
      'network',
      'rate limit',
      'server error',
      'service unavailable'
    ];

    const errorMessage = error.message.toLowerCase();
    return retryableErrors.some(retryableError => errorMessage.includes(retryableError));
  }

  /**
   * Delays execution for the specified time.
   * 
   * @method delay
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ApiController;
} else {
  window.ApiController = ApiController;
}
