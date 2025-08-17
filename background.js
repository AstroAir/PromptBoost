/**
 * @fileoverview PromptBoost Background Script
 * Handles LLM API calls, message passing between extension components,
 * and manages extension lifecycle events.
 *
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 1.0.0
 */

// Import utilities
importScripts(
  'utils/ErrorHandler.js',
  'utils/Logger.js',
  'utils/ConfigValidator.js',
  'utils/ApiHelper.js'
);

// Import services
importScripts(
  'services/TemplateManager.js',
  'services/ConfigurationManager.js'
);

// Import template modules
importScripts(
  'templates/TemplateVersioning.js',
  'templates/TemplateTester.js'
);

// Import provider system
importScripts(
  'providers/base/Provider.js',
  'providers/base/ProviderRegistry.js',
  'providers/openai/OpenAIProvider.js',
  'providers/anthropic/AnthropicProvider.js',
  'providers/google/GeminiProvider.js',
  'providers/cohere/CohereProvider.js',
  'providers/huggingface/HuggingFaceProvider.js',
  'providers/local/LocalProvider.js',
  'providers/openrouter/OpenRouterProvider.js'
);

/**
 * Main background service worker class for PromptBoost extension.
 * Manages API calls to various LLM providers, handles inter-component communication,
 * and manages extension settings and templates.
 *
 * @class PromptBoostBackground
 * @since 1.0.0
 */
class PromptBoostBackground {
  /**
   * Creates an instance of PromptBoostBackground.
   * Initializes message listeners, install handlers, and provider system.
   *
   * @constructor
   * @since 1.0.0
   */
  constructor() {
    // Initialize logger
    this.logger = new Logger('PromptBoostBackground');

    // Initialize services
    this.templateManager = TemplateManager.getInstance();
    this.configManager = ConfigurationManager.getInstance();

    this.setupProviderSystem();
    this.setupMessageListener();
    this.setupInstallListener();

    // Initialize services asynchronously
    this.initializeServices();
  }

  /**
   * Sets up the provider system with all available providers.
   *
   * @method setupProviderSystem
   * @since 2.0.0
   * @private
   */
  setupProviderSystem() {
    try {
      // Register all providers
      providerRegistry.register('openai', OpenAIProvider, {
        displayName: 'OpenAI (GPT)',
        description: 'OpenAI\'s GPT models including GPT-3.5 and GPT-4',
        category: 'cloud'
      });

      providerRegistry.register('anthropic', AnthropicProvider, {
        displayName: 'Anthropic (Claude)',
        description: 'Anthropic\'s Claude models including Claude 3 Opus, Sonnet, and Haiku',
        category: 'cloud'
      });

      providerRegistry.register('gemini', GeminiProvider, {
        displayName: 'Google Gemini',
        description: 'Google\'s advanced AI model with multimodal capabilities',
        category: 'cloud'
      });

      providerRegistry.register('cohere', CohereProvider, {
        displayName: 'Cohere',
        description: 'Cohere\'s powerful language models',
        category: 'cloud'
      });

      providerRegistry.register('huggingface', HuggingFaceProvider, {
        displayName: 'Hugging Face',
        description: 'Access to thousands of open-source models',
        category: 'cloud'
      });

      providerRegistry.register('local', LocalProvider, {
        displayName: 'Local Models',
        description: 'Connect to local model servers',
        category: 'local'
      });

      providerRegistry.register('openrouter', OpenRouterProvider, {
        displayName: 'OpenRouter (Multiple Models)',
        description: 'Access to multiple AI models through OpenRouter\'s unified API',
        category: 'cloud'
      });

      // Set default provider
      providerRegistry.setDefaultProvider('openai');

      // Set fallback providers
      providerRegistry.setFallbackProviders(['anthropic', 'gemini', 'cohere', 'openrouter']);

      this.logger.info('Provider system initialized successfully');
    } catch (error) {
      ErrorHandler.handle(error, 'PromptBoostBackground.setupProviderSystem');
    }
  }

  /**
   * Initializes services asynchronously.
   *
   * @method initializeServices
   * @since 2.0.0
   * @private
   * @async
   */
  async initializeServices() {
    try {
      this.logger.startTiming('initializeServices');

      // Initialize services
      await this.templateManager.initialize();
      await this.configManager.initialize();

      this.logger.endTiming('initializeServices');
      this.logger.info('Services initialized successfully');
    } catch (error) {
      ErrorHandler.handle(error, 'PromptBoostBackground.initializeServices');
    }
  }

  /**
   * Sets up the message listener for handling communication between extension components.
   * Listens for messages from content scripts, popup, and options pages.
   *
   * @method setupMessageListener
   * @since 1.0.0
   * @private
   */
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case 'OPTIMIZE_TEXT':
          this.handleOptimizeText(message, sender);
          break;
        case 'OPTIMIZE_WITH_TEMPLATE':
          this.handleOptimizeWithTemplate(message, sender);
          break;
        case 'TEST_API':
          this.handleTestAPI(message, sender);
          break;
        case 'GET_TEMPLATES':
          this.handleGetTemplates(message, sender);
          break;
        case 'SAVE_TEMPLATE':
          this.handleSaveTemplate(message, sender);
          break;
        case 'DELETE_TEMPLATE':
          this.handleDeleteTemplate(message, sender);
          break;
        case 'OPENROUTER_AUTH':
          this.handleOpenRouterAuth(message, sender);
          break;
        // New provider system handlers
        case 'GET_PROVIDERS':
          this.handleGetProviders(message, sender);
          break;
        case 'GET_PROVIDER_MODELS':
          this.handleGetProviderModels(message, sender);
          break;
        case 'TEST_PROVIDER':
          this.handleTestProvider(message, sender);
          break;
        case 'GET_PROVIDER_CONFIG_SCHEMA':
          this.handleGetProviderConfigSchema(message, sender);
          break;
        // Configuration management handlers
        case 'GET_CONFIGURATION':
          this.handleGetConfiguration(message, sender);
          break;
        case 'UPDATE_CONFIGURATION':
          this.handleUpdateConfiguration(message, sender);
          break;
        case 'RESET_CONFIGURATION':
          this.handleResetConfiguration(message, sender);
          break;
        case 'TEST_TEMPLATE':
          this.handleTestTemplate(message, sender);
          break;
      }
    });
  }

  /**
   * Sets up the extension install listener to initialize default settings.
   * Runs when the extension is first installed or updated.
   *
   * @method setupInstallListener
   * @since 1.0.0
   * @private
   */
  setupInstallListener() {
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        // Set default settings with template system
        chrome.storage.sync.set({
          enabled: true,
          timeWindow: 1000,
          provider: 'openai',
          apiKey: '',
          apiEndpoint: 'https://api.openai.com/v1/chat/completions',
          model: 'gpt-3.5-turbo',
          promptTemplate: 'Please improve and optimize the following text while maintaining its original meaning and tone:\n\n{text}',
          keyboardShortcut: 'Ctrl+Shift+Space',
          selectedTemplate: 'general',
          quickTemplateSelection: true,
          templates: this.getDefaultTemplates()
        });

        // Open options page
        chrome.runtime.openOptionsPage();
      }
    });
  }

  getDefaultTemplates() {
    return {
      'general': {
        id: 'general',
        name: 'General Improvement',
        category: 'General',
        description: 'Improve text while maintaining meaning and tone',
        template: 'Please improve and optimize the following text while maintaining its original meaning and tone:\n\n{text}',
        isDefault: true,
        isCustom: false,
        createdAt: Date.now()
      },
      'professional': {
        id: 'professional',
        name: 'Professional Tone',
        category: 'Business',
        description: 'Make text more professional and formal',
        template: 'Please rewrite the following text to make it more professional, formal, and suitable for business communication:\n\n{text}',
        isDefault: true,
        isCustom: false,
        createdAt: Date.now()
      },
      'casual': {
        id: 'casual',
        name: 'Casual & Friendly',
        category: 'General',
        description: 'Make text more casual and approachable',
        template: 'Please rewrite the following text to make it more casual, friendly, and conversational:\n\n{text}',
        isDefault: true,
        isCustom: false,
        createdAt: Date.now()
      },
      'concise': {
        id: 'concise',
        name: 'Make Concise',
        category: 'Editing',
        description: 'Shorten text while keeping key information',
        template: 'Please make the following text more concise and to the point while preserving all important information:\n\n{text}',
        isDefault: true,
        isCustom: false,
        createdAt: Date.now()
      },
      'expand': {
        id: 'expand',
        name: 'Expand & Detail',
        category: 'Editing',
        description: 'Add more detail and explanation',
        template: 'Please expand the following text with more details, examples, and explanations to make it more comprehensive:\n\n{text}',
        isDefault: true,
        isCustom: false,
        createdAt: Date.now()
      },
      'creative': {
        id: 'creative',
        name: 'Creative Writing',
        category: 'Creative',
        description: 'Enhance creativity and engagement',
        template: 'Please rewrite the following text to make it more creative, engaging, and vivid while maintaining the core message:\n\n{text}',
        isDefault: true,
        isCustom: false,
        createdAt: Date.now()
      },
      'technical': {
        id: 'technical',
        name: 'Technical Documentation',
        category: 'Technical',
        description: 'Improve technical clarity and precision',
        template: 'Please improve the following technical text for clarity, precision, and proper technical documentation standards:\n\n{text}',
        isDefault: true,
        isCustom: false,
        createdAt: Date.now()
      },
      'grammar': {
        id: 'grammar',
        name: 'Grammar & Style',
        category: 'Editing',
        description: 'Fix grammar, spelling, and style issues',
        template: 'Please correct any grammar, spelling, punctuation, and style issues in the following text while maintaining its original meaning:\n\n{text}',
        isDefault: true,
        isCustom: false,
        createdAt: Date.now()
      }
    };
  }

  /**
   * Handles text optimization requests using the default template.
   * Processes the text through the configured LLM API and sends the result back to the content script.
   *
   * @method handleOptimizeText
   * @param {Object} message - The message object containing text and settings
   * @param {string} message.text - The text to be optimized
   * @param {Object} message.settings - Extension settings including API configuration
   * @param {Object} sender - Chrome extension sender object containing tab information
   * @returns {Promise<void>} Resolves when the optimization is complete
   * @since 1.0.0
   * @async
   */
  async handleOptimizeText(message, sender) {
    try {
      const { text, settings } = message;
      const optimizedText = await this.callLLMAPI(text, settings);

      chrome.tabs.sendMessage(sender.tab.id, {
        type: 'OPTIMIZE_RESULT',
        data: { optimizedText }
      });
    } catch (error) {
      chrome.tabs.sendMessage(sender.tab.id, {
        type: 'OPTIMIZATION_ERROR',
        error: error.message
      });
    }
  }

  /**
   * Handles text optimization requests using a specific template.
   * Retrieves the specified template and uses it to optimize the text.
   *
   * @method handleOptimizeWithTemplate
   * @param {Object} message - The message object containing text, template ID, and settings
   * @param {string} message.text - The text to be optimized
   * @param {string} message.templateId - The ID of the template to use
   * @param {Object} message.settings - Extension settings including API configuration
   * @param {Object} sender - Chrome extension sender object containing tab information
   * @returns {Promise<void>} Resolves when the optimization is complete
   * @throws {Error} When the specified template is not found
   * @since 1.0.0
   * @async
   */
  async handleOptimizeWithTemplate(message, sender) {
    try {
      const { text, templateId, settings } = message;

      // Get the specific template
      const result = await chrome.storage.sync.get(['templates']);
      const templates = result.templates || {};
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

      chrome.tabs.sendMessage(sender.tab.id, {
        type: 'OPTIMIZE_RESULT',
        data: {
          optimizedText,
          templateUsed: template.name
        }
      });
    } catch (error) {
      chrome.tabs.sendMessage(sender.tab.id, {
        type: 'OPTIMIZATION_ERROR',
        error: error.message
      });
    }
  }

  async handleGetTemplates(message, sender) {
    try {
      this.logger.debug('Getting templates');
      const templates = this.templateManager.getAllTemplates(message.filters);

      chrome.runtime.sendMessage({
        type: 'TEMPLATES_RESULT',
        data: templates
      });
    } catch (error) {
      ErrorHandler.handle(error, 'PromptBoostBackground.handleGetTemplates');
      chrome.runtime.sendMessage({
        type: 'TEMPLATES_ERROR',
        error: error.message
      });
    }
  }

  async handleSaveTemplate(message, sender) {
    try {
      const { template } = message;
      this.logger.debug('Saving template:', template.name);

      let savedTemplate;
      if (template.id && this.templateManager.getTemplate(template.id)) {
        // Update existing template
        savedTemplate = await this.templateManager.updateTemplate(template.id, template);
      } else {
        // Create new template
        savedTemplate = await this.templateManager.createTemplate(template);
      }

      chrome.runtime.sendMessage({
        type: 'TEMPLATE_SAVED',
        data: savedTemplate
      });
    } catch (error) {
      ErrorHandler.handle(error, 'PromptBoostBackground.handleSaveTemplate');
      chrome.runtime.sendMessage({
        type: 'TEMPLATE_SAVE_ERROR',
        error: error.message
      });
    }
  }

  async handleDeleteTemplate(message, sender) {
    try {
      const { templateId } = message;
      this.logger.debug('Deleting template:', templateId);

      await this.templateManager.deleteTemplate(templateId);

      chrome.runtime.sendMessage({
        type: 'TEMPLATE_DELETED',
        data: { templateId }
      });
    } catch (error) {
      ErrorHandler.handle(error, 'PromptBoostBackground.handleDeleteTemplate');
      chrome.runtime.sendMessage({
        type: 'TEMPLATE_DELETE_ERROR',
        error: error.message
      });
    }
  }

  async handleTestAPI(message, sender) {
    try {
      const testText = "This is a test message.";
      const result = await this.callLLMAPI(testText, message.settings);
      
      chrome.runtime.sendMessage({
        type: 'API_TEST_RESULT',
        success: true,
        result
      });
    } catch (error) {
      chrome.runtime.sendMessage({
        type: 'API_TEST_RESULT',
        success: false,
        error: error.message
      });
    }
  }

  /**
   * Calls the configured LLM API to optimize text.
   * Supports multiple providers including OpenAI, Anthropic, OpenRouter, and custom APIs.
   * Includes retry logic and comprehensive error handling.
   *
   * @method callLLMAPI
   * @param {string} text - The text to be optimized
   * @param {Object} settings - API configuration settings
   * @param {string} settings.provider - The LLM provider ('openai', 'anthropic', 'openrouter', 'custom')
   * @param {string} settings.apiKey - The API key for the provider
   * @param {string} settings.apiEndpoint - The API endpoint URL (for OpenAI and custom providers)
   * @param {string} settings.model - The model name to use
   * @param {string} settings.promptTemplate - The prompt template with {text} placeholder
   * @param {number} [retryCount=0] - Current retry attempt count
   * @returns {Promise<string>} The optimized text from the API
   * @throws {Error} When API key is missing, text is invalid, or API call fails
   * @since 1.0.0
   * @async
   */
  async callLLMAPI(text, settings, retryCount = 0) {
    const { provider, promptTemplate } = settings;
    const maxRetries = 3;

    try {
      this.logger.startTiming(`callLLMAPI_${provider}`);

      // Validate input
      if (!text || text.trim().length === 0) {
        throw ErrorHandler.createError('No text provided for optimization', ErrorCategory.VALIDATION);
      }

      if (text.length > 10000) {
        throw ErrorHandler.createError('Text too long (maximum 10,000 characters)', ErrorCategory.VALIDATION);
      }

      // Prepare prompt
      const prompt = promptTemplate.replace('{text}', text);

      // Use new provider system exclusively
      const result = await this.callNewProviderAPI(provider, prompt, settings);

      if (!result || result.trim().length === 0) {
        throw ErrorHandler.createError('Empty response from API', ErrorCategory.API);
      }

      this.logger.endTiming(`callLLMAPI_${provider}`);
      return result;

    } catch (error) {
      this.logger.endTiming(`callLLMAPI_${provider}`);

      // Retry logic for transient errors
      if (retryCount < maxRetries && this.isRetryableError(error)) {
        this.logger.warn(`Retrying API call (attempt ${retryCount + 1}/${maxRetries}):`, error.message);
        await this.delay(Math.pow(2, retryCount) * 1000); // Exponential backoff
        return this.callLLMAPI(text, settings, retryCount + 1);
      }

      // Handle error with centralized error handler
      throw ErrorHandler.handle(error, 'PromptBoostBackground.callLLMAPI', {
        category: ErrorCategory.API,
        metadata: { provider, retryCount }
      });
    }
  }

  /**
   * Calls the new provider system API.
   *
   * @method callNewProviderAPI
   * @param {string} providerName - Name of the provider
   * @param {string} prompt - The prompt to send
   * @param {Object} settings - Provider settings
   * @returns {Promise<string>} Generated text
   * @since 2.0.0
   * @async
   */
  async callNewProviderAPI(providerName, prompt, settings) {
    try {
      // Get provider with fallback support
      const provider = providerRegistry.getProviderWithFallback(providerName, settings);

      if (!provider) {
        throw ErrorHandler.createError(
          `Provider '${providerName}' not available`,
          ErrorCategory.PROVIDER,
          { providerName, availableProviders: providerRegistry.getProviderNames() }
        );
      }

      // Authenticate if not already authenticated
      if (!provider.isAuthenticated) {
        this.logger.debug(`Authenticating provider: ${providerName}`);
        await provider.authenticate(settings);
      }

      // Call the provider API
      this.logger.debug(`Calling API for provider: ${providerName}`);
      const result = await provider.callAPI(prompt, {
        model: settings.model,
        maxTokens: settings.maxTokens || 1000,
        temperature: settings.temperature || 0.7
      });

      this.logger.debug(`API call successful for provider: ${providerName}`);
      return result;

    } catch (error) {
      this.logger.error(`Error calling provider API for ${providerName}:`, error);
      throw error;
    }
  }

  isRetryableError(error) {
    const retryableMessages = [
      'network error',
      'timeout',
      'rate limit',
      'server error',
      'service unavailable',
      'internal server error'
    ];

    const message = error.message.toLowerCase();
    return retryableMessages.some(msg => message.includes(msg)) ||
           (error.status >= 500 && error.status < 600);
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Handles requests to get available providers.
   *
   * @method handleGetProviders
   * @param {Object} message - The message object
   * @param {Object} sender - Chrome extension sender object
   * @since 2.0.0
   * @async
   */
  async handleGetProviders(message, sender) {
    try {
      const providers = providerRegistry.getProvidersMetadata();

      chrome.runtime.sendMessage({
        type: 'PROVIDERS_RESULT',
        data: providers
      });
    } catch (error) {
      chrome.runtime.sendMessage({
        type: 'PROVIDERS_ERROR',
        error: error.message
      });
    }
  }

  /**
   * Handles requests to get models for a specific provider.
   *
   * @method handleGetProviderModels
   * @param {Object} message - The message object
   * @param {string} message.provider - Provider name
   * @param {Object} message.config - Provider configuration
   * @param {Object} sender - Chrome extension sender object
   * @since 2.0.0
   * @async
   */
  async handleGetProviderModels(message, sender) {
    try {
      const { provider: providerName, config } = message;
      const provider = providerRegistry.getProvider(providerName, config);

      if (!provider) {
        throw new Error(`Provider '${providerName}' not found`);
      }

      // Authenticate if needed
      if (!provider.isAuthenticated && config) {
        await provider.authenticate(config);
      }

      const models = await provider.getModels();

      chrome.runtime.sendMessage({
        type: 'PROVIDER_MODELS_RESULT',
        data: { provider: providerName, models }
      });
    } catch (error) {
      chrome.runtime.sendMessage({
        type: 'PROVIDER_MODELS_ERROR',
        error: error.message
      });
    }
  }

  /**
   * Handles requests to test a provider connection.
   *
   * @method handleTestProvider
   * @param {Object} message - The message object
   * @param {string} message.provider - Provider name
   * @param {Object} message.config - Provider configuration
   * @param {Object} sender - Chrome extension sender object
   * @since 2.0.0
   * @async
   */
  async handleTestProvider(message, sender) {
    try {
      const { provider: providerName, config } = message;
      const provider = providerRegistry.getProvider(providerName, config);

      if (!provider) {
        throw new Error(`Provider '${providerName}' not found`);
      }

      const result = await provider.testConnection(config);

      chrome.runtime.sendMessage({
        type: 'PROVIDER_TEST_RESULT',
        data: { provider: providerName, ...result }
      });
    } catch (error) {
      chrome.runtime.sendMessage({
        type: 'PROVIDER_TEST_ERROR',
        error: error.message
      });
    }
  }

  /**
   * Handles requests to get provider configuration schema.
   *
   * @method handleGetProviderConfigSchema
   * @param {Object} message - The message object
   * @param {string} message.provider - Provider name
   * @param {Object} sender - Chrome extension sender object
   * @since 2.0.0
   * @async
   */
  async handleGetProviderConfigSchema(message, sender) {
    try {
      const { provider: providerName } = message;
      const provider = providerRegistry.getProvider(providerName);

      if (!provider) {
        throw new Error(`Provider '${providerName}' not found`);
      }

      const schema = provider.getConfigSchema ? provider.getConfigSchema() : {};

      chrome.runtime.sendMessage({
        type: 'PROVIDER_CONFIG_SCHEMA_RESULT',
        data: { provider: providerName, schema }
      });
    } catch (error) {
      chrome.runtime.sendMessage({
        type: 'PROVIDER_CONFIG_SCHEMA_ERROR',
        error: error.message
      });
    }
  }

  async handleOpenRouterAuth(message, sender) {
    try {
      const { action } = message;

      if (action === 'start') {
        // Generate PKCE parameters
        const codeVerifier = this.generateCodeVerifier();
        const codeChallenge = await this.generateCodeChallenge(codeVerifier);

        // Store code verifier
        await chrome.storage.local.set({
          openrouter_code_verifier: codeVerifier
        });

        // Build OAuth URL
        const redirectUri = chrome.identity.getRedirectURL('oauth');
        const authUrl = new URL('https://openrouter.ai/auth');
        authUrl.searchParams.set('response_type', 'code');
        authUrl.searchParams.set('client_id', 'promptboost-extension');
        authUrl.searchParams.set('redirect_uri', redirectUri);
        authUrl.searchParams.set('scope', 'read write');
        authUrl.searchParams.set('code_challenge', codeChallenge);
        authUrl.searchParams.set('code_challenge_method', 'S256');
        authUrl.searchParams.set('state', 'promptboost-auth');

        // Launch OAuth flow
        chrome.identity.launchWebAuthFlow({
          url: authUrl.toString(),
          interactive: true
        }, async (responseUrl) => {
          if (chrome.runtime.lastError) {
            chrome.runtime.sendMessage({
              type: 'OPENROUTER_AUTH_ERROR',
              error: chrome.runtime.lastError.message
            });
            return;
          }

          await this.handleOAuthCallback(responseUrl, codeVerifier);
        });

      }
    } catch (error) {
      chrome.runtime.sendMessage({
        type: 'OPENROUTER_AUTH_ERROR',
        error: error.message
      });
    }
  }

  async handleOAuthCallback(responseUrl, codeVerifier) {
    try {
      const url = new URL(responseUrl);
      const code = url.searchParams.get('code');
      const state = url.searchParams.get('state');
      const error = url.searchParams.get('error');

      if (error) {
        throw new Error(`OAuth error: ${error}`);
      }

      if (!code || state !== 'promptboost-auth') {
        throw new Error('Invalid OAuth response');
      }

      // Exchange code for token
      const redirectUri = chrome.identity.getRedirectURL('oauth');
      const tokenResponse = await fetch('https://openrouter.ai/api/v1/auth/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'authorization_code',
          client_id: 'promptboost-extension',
          code: code,
          redirect_uri: redirectUri,
          code_verifier: codeVerifier
        })
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json().catch(() => ({}));
        throw new Error(errorData.error_description || 'Failed to exchange code for token');
      }

      const tokenData = await tokenResponse.json();

      // Clean up stored verifier
      await chrome.storage.local.remove(['openrouter_code_verifier']);

      // Send success message with token
      chrome.runtime.sendMessage({
        type: 'OPENROUTER_AUTH_SUCCESS',
        token: tokenData.access_token
      });

    } catch (error) {
      chrome.runtime.sendMessage({
        type: 'OPENROUTER_AUTH_ERROR',
        error: error.message
      });
    }
  }

  /**
   * Handles configuration retrieval requests
   *
   * @method handleGetConfiguration
   * @param {Object} message - Message object
   * @param {Object} sender - Sender information
   * @since 2.0.0
   * @async
   */
  async handleGetConfiguration(message, sender) {
    try {
      const { domain } = message;
      const config = this.configManager.getConfiguration(domain);

      chrome.runtime.sendMessage({
        type: 'CONFIGURATION_LOADED',
        data: config
      });
    } catch (error) {
      ErrorHandler.handle(error, 'PromptBoostBackground.handleGetConfiguration');
      chrome.runtime.sendMessage({
        type: 'CONFIGURATION_LOAD_ERROR',
        error: error.message
      });
    }
  }

  /**
   * Handles configuration update requests
   *
   * @method handleUpdateConfiguration
   * @param {Object} message - Message object
   * @param {Object} sender - Sender information
   * @since 2.0.0
   * @async
   */
  async handleUpdateConfiguration(message, sender) {
    try {
      const { updates, domain } = message;
      const updatedConfig = await this.configManager.updateConfiguration(updates, domain);

      chrome.runtime.sendMessage({
        type: 'CONFIGURATION_UPDATED',
        data: updatedConfig
      });
    } catch (error) {
      ErrorHandler.handle(error, 'PromptBoostBackground.handleUpdateConfiguration');
      chrome.runtime.sendMessage({
        type: 'CONFIGURATION_UPDATE_ERROR',
        error: error.message
      });
    }
  }

  /**
   * Handles configuration reset requests
   *
   * @method handleResetConfiguration
   * @param {Object} message - Message object
   * @param {Object} sender - Sender information
   * @since 2.0.0
   * @async
   */
  async handleResetConfiguration(message, sender) {
    try {
      const { domain } = message;
      const resetConfig = await this.configManager.resetConfiguration(domain);

      chrome.runtime.sendMessage({
        type: 'CONFIGURATION_RESET',
        data: resetConfig
      });
    } catch (error) {
      ErrorHandler.handle(error, 'PromptBoostBackground.handleResetConfiguration');
      chrome.runtime.sendMessage({
        type: 'CONFIGURATION_RESET_ERROR',
        error: error.message
      });
    }
  }

  /**
   * Handles template testing requests
   *
   * @method handleTestTemplate
   * @param {Object} message - Message object
   * @param {Object} sender - Sender information
   * @since 2.0.0
   * @async
   */
  async handleTestTemplate(message, sender) {
    try {
      const { template, testOptions } = message;
      this.logger.debug('Testing template:', template.name);

      const tester = new TemplateTester();
      const testResults = await tester.runTests(template, testOptions);

      chrome.runtime.sendMessage({
        type: 'TEMPLATE_TEST_RESULT',
        data: testResults
      });
    } catch (error) {
      ErrorHandler.handle(error, 'PromptBoostBackground.handleTestTemplate');
      chrome.runtime.sendMessage({
        type: 'TEMPLATE_TEST_ERROR',
        error: error.message
      });
    }
  }

  generateCodeVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  async generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  // Legacy provider methods removed - now using unified provider system
}

// Initialize background script
new PromptBoostBackground();
