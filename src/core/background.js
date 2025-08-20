/**
 * @fileoverview PromptBoost Background Script
 * Handles LLM API calls, message passing between extension components,
 * and manages extension lifecycle events.
 *
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 1.0.0
 */

// Import required modules and constants
try {
  importScripts(
    '../config/Constants.js',
    '../utils/Logger.js',
    '../utils/ErrorHandler.js',
    '../core/ApplicationContext.js',
    '../core/EventBus.js',
    '../services/TemplateManager.js',
    '../services/ConfigurationManager.js',
    '../providers/base/ProviderRegistry.js',
    '../templates/TemplateVersioning.js',
    '../templates/TemplateTester.js',
    '../core/ApiController.js',
    '../core/AuthenticationManager.js',
    '../core/LifecycleManager.js',
    '../core/MessageRouter.js'
  );
} catch (error) {
  console.error('Failed to import required scripts:', error);
}

/**
 * Safely imports scripts with error handling and graceful fallbacks
 * @param {string[]} scripts - Array of script paths to import
 * @param {string} category - Category name for logging
 * @returns {boolean} - True if all scripts loaded successfully
 */
function safeImportScripts(scripts, category) {
  let allLoaded = true;
  const failedScripts = [];

  for (const script of scripts) {
    try {
      importScripts(script);
      console.log(`✓ Loaded ${category}: ${script}`);
    } catch (error) {
      console.error(`✗ Failed to load ${category}: ${script}`, error);
      failedScripts.push(script);
      allLoaded = false;
    }
  }

  if (failedScripts.length > 0) {
    console.warn(`Failed to load ${failedScripts.length} ${category} scripts:`, failedScripts);
  }

  return allLoaded;
}

// Import core system (critical - extension won't work without these)
try {
  importScripts(
    'ApplicationContext.js',
    'EventBus.js'
  );
  console.log('✓ Core system loaded successfully');
} catch (error) {
  console.error('✗ Critical error: Failed to load core system', error);
  // Core system failure is critical - we can't continue
}

// Import utilities (important but not critical)
safeImportScripts([
  '../utils/ErrorHandler.js',
  '../utils/Logger.js',
  '../utils/ConfigValidator.js',
  '../utils/ApiHelper.js'
], 'utility');

// Import configuration (important but not critical)
safeImportScripts([
  '../config/Constants.js',
  '../config/ConfigSchema.js'
], 'configuration');

// Import services (important but not critical)
safeImportScripts([
  '../services/TemplateManager.js',
  '../services/ConfigurationManager.js'
], 'service');

// Import template modules (optional - extension can work without these)
safeImportScripts([
  '../templates/TemplateVersioning.js',
  '../templates/TemplateTester.js'
], 'template');

// Import provider system (critical for AI functionality)
const providersLoaded = safeImportScripts([
  '../providers/base/Provider.js',
  '../providers/base/ProviderRegistry.js',
  '../providers/openai/OpenAIProvider.js',
  '../providers/anthropic/AnthropicProvider.js',
  '../providers/google/GeminiProvider.js',
  '../providers/cohere/CohereProvider.js',
  '../providers/huggingface/HuggingFaceProvider.js',
  '../providers/local/LocalProvider.js',
  '../providers/openrouter/OpenRouterProvider.js'
], 'provider');

// Import core modules (critical for message handling)
const coreModulesLoaded = safeImportScripts([
  'MessageRouter.js',
  'ApiController.js',
  'LifecycleManager.js',
  'AuthenticationManager.js'
], 'core module');

// Log overall loading status
if (providersLoaded && coreModulesLoaded) {
  console.log('✓ PromptBoost background script loaded successfully');
} else {
  console.warn('⚠ PromptBoost loaded with some missing components - functionality may be limited');
}

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
    // Initialize application context
    this.appContext = ApplicationContext.getInstance();
    this.eventBus = EventBus.getInstance();

    // Initialize logger
    this.logger = new Logger('PromptBoostBackground');

    // Initialize services
    this.initializeServices();

    // Initialize core modules with dependency injection
    this.initializeCoreModules();

    // Register services with application context
    this.registerServices();

    // Setup provider system
    this.setupProviderSystem();
    this.setupEventListeners();
  }

  /**
   * Initializes core services.
   *
   * @method initializeServices
   * @since 2.0.0
   * @private
   */
  async initializeServices() {
    try {
      // Initialize core services with error handling
      this.templateManager = this.safeInitializeService(() => new TemplateManager(), 'TemplateManager');
      this.configManager = this.safeInitializeService(() => new ConfigurationManager(), 'ConfigurationManager');
      this.providerRegistry = this.safeInitializeService(() => new ProviderRegistry(), 'ProviderRegistry');

      // Initialize optional services
      this.templateVersioning = this.safeInitializeService(() => new TemplateVersioning(), 'TemplateVersioning');
      this.templateTester = this.safeInitializeService(() => new TemplateTester(), 'TemplateTester');

      // Initialize services asynchronously with error handling
      if (this.templateManager) {
        try {
          await this.templateManager.initialize();
        } catch (error) {
          console.warn('TemplateManager initialization failed:', error);
        }
      }

      if (this.configManager) {
        try {
          await this.configManager.initialize();
        } catch (error) {
          console.warn('ConfigurationManager initialization failed:', error);
        }
      }

      this.logger.info('Services initialized successfully');
    } catch (error) {
      this.logger.error('Service initialization failed:', error);
      ErrorHandler.handle(error, 'PromptBoostBackground.initializeServices');
    }
  }

  /**
   * Safely initializes a service with error handling
   * @param {Function} serviceFactory - Function that creates the service
   * @param {string} serviceName - Name of the service for logging
   * @returns {Object|null} Service instance or null if failed
   */
  safeInitializeService(serviceFactory, serviceName) {
    try {
      const service = serviceFactory();
      console.log(`✓ ${serviceName} initialized successfully`);
      return service;
    } catch (error) {
      console.error(`✗ Failed to initialize ${serviceName}:`, error);
      return null;
    }
  }

  /**
   * Initializes core modules with dependency injection.
   *
   * @method initializeCoreModules
   * @since 2.0.0
   * @private
   */
  initializeCoreModules() {
    try {
      // Prepare dependencies
      const _dependencies = {
        logger: this.logger,
        templateManager: this.templateManager,
        configManager: this.configManager,
        providerRegistry: this.providerRegistry,
        eventBus: this.eventBus
      };

      // Initialize API controller
      this.apiController = new ApiController({
        logger: this.logger,
        providerRegistry: this.providerRegistry,
        configManager: this.configManager,
        messageRouter: null // Will be set after MessageRouter is created
      });

      // Initialize authentication manager
      this.authManager = new AuthenticationManager({
        logger: this.logger,
        messageRouter: null, // Will be set after MessageRouter is created
        providerRegistry: this.providerRegistry
      });

      // Initialize lifecycle manager
      this.lifecycleManager = new LifecycleManager({
        logger: this.logger,
        configManager: this.configManager,
        templateManager: this.templateManager,
        eventBus: this.eventBus
      });

      // Initialize message router (depends on other modules)
      this.messageRouter = new MessageRouter({
        logger: this.logger,
        apiController: this.apiController,
        templateManager: this.templateManager,
        configManager: this.configManager,
        authManager: this.authManager
      });

      // Set circular dependencies
      this.apiController.messageRouter = this.messageRouter;
      this.authManager.messageRouter = this.messageRouter;

      this.logger.info('Core modules initialized successfully');
    } catch (error) {
      this.logger.error('Core module initialization failed:', error);
      ErrorHandler.handle(error, 'PromptBoostBackground.initializeCoreModules');
    }
  }

  /**
   * Registers services with application context.
   *
   * @method registerServices
   * @since 2.0.0
   * @private
   */
  registerServices() {
    try {
      // Register core services
      this.appContext.register('logger', this.logger);
      this.appContext.register('templateManager', this.templateManager);
      this.appContext.register('configManager', this.configManager);
      this.appContext.register('providerRegistry', this.providerRegistry);
      this.appContext.register('templateVersioning', this.templateVersioning);
      this.appContext.register('templateTester', this.templateTester);

      // Register core modules
      this.appContext.register('messageRouter', this.messageRouter);
      this.appContext.register('apiController', this.apiController);
      this.appContext.register('authManager', this.authManager);
      this.appContext.register('lifecycleManager', this.lifecycleManager);

      this.logger.info('Services registered with application context');
    } catch (error) {
      this.logger.error('Service registration failed:', error);
      ErrorHandler.handle(error, 'PromptBoostBackground.registerServices');
    }
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
      if (!this.providerRegistry) {
        console.warn('ProviderRegistry not available - creating fallback instance');
        this.providerRegistry = { register: () => {}, setDefaultProvider: () => {}, setFallbackProviders: () => {} };
        return;
      }

      // Register providers with individual error handling
      const providers = [
        { id: 'openai', class: 'OpenAIProvider', config: { displayName: 'OpenAI (GPT)', description: 'OpenAI\'s GPT models including GPT-3.5 and GPT-4', category: 'cloud' }},
        { id: 'anthropic', class: 'AnthropicProvider', config: { displayName: 'Anthropic (Claude)', description: 'Anthropic\'s Claude models including Claude 3 Opus, Sonnet, and Haiku', category: 'cloud' }},
        { id: 'gemini', class: 'GeminiProvider', config: { displayName: 'Google Gemini', description: 'Google\'s advanced AI model with multimodal capabilities', category: 'cloud' }},
        { id: 'cohere', class: 'CohereProvider', config: { displayName: 'Cohere', description: 'Cohere\'s powerful language models', category: 'cloud' }},
        { id: 'huggingface', class: 'HuggingFaceProvider', config: { displayName: 'Hugging Face', description: 'Access to thousands of open-source models', category: 'cloud' }},
        { id: 'local', class: 'LocalProvider', config: { displayName: 'Local Models', description: 'Connect to local model servers', category: 'local' }},
        { id: 'openrouter', class: 'OpenRouterProvider', config: { displayName: 'OpenRouter (Multiple Models)', description: 'Access to multiple AI models through OpenRouter\'s unified API', category: 'cloud' }}
      ];

      let registeredProviders = 0;
      providers.forEach(provider => {
        try {
          const ProviderClass = eval(provider.class);
          if (ProviderClass) {
            this.providerRegistry.register(provider.id, ProviderClass, provider.config);
            console.log(`✓ Registered provider: ${provider.id}`);
            registeredProviders++;
          }
        } catch (error) {
          console.warn(`✗ Failed to register provider ${provider.id}:`, error);
        }
      });

      if (registeredProviders === 0) {
        console.error('No providers were successfully registered');
        return;
      }

      // Set default provider (with fallback)
      try {
        this.providerRegistry.setDefaultProvider('openai');
      } catch (error) {
        console.warn('Failed to set default provider, trying fallback');
        try {
          this.providerRegistry.setDefaultProvider('anthropic');
        } catch (fallbackError) {
          console.warn('Failed to set fallback default provider');
        }
      }

      // Set fallback providers
      try {
        this.providerRegistry.setFallbackProviders(['anthropic', 'gemini', 'cohere', 'openrouter']);
      } catch (error) {
        console.warn('Failed to set fallback providers:', error);
      }

      this.logger.info(`Provider system initialized successfully with ${registeredProviders} providers`);
    } catch (error) {
      console.error('Provider system setup failed:', error);
      ErrorHandler.handle(error, 'PromptBoostBackground.setupProviderSystem');
    }
  }

  /**
   * Sets up event listeners for application-wide events.
   *
   * @method setupEventListeners
   * @since 2.0.0
   * @private
   */
  setupEventListeners() {
    // Listen for configuration changes
    this.eventBus.on('configuration.updated', (data) => {
      this.logger.info('Configuration updated:', data);
      // Notify all tabs about configuration changes
      chrome.tabs.query({}, (tabs) => {
        tabs.forEach(tab => {
          chrome.tabs.sendMessage(tab.id, {
            type: 'SETTINGS_UPDATED',
            data
          }).catch(() => {}); // Ignore errors for tabs without content script
        });
      });
    });

    // Listen for template changes
    this.eventBus.on('template.*', (data, event) => {
      this.logger.info(`Template event: ${event}`, data);
    });

    // Listen for provider events
    this.eventBus.on('provider.*', (data, event) => {
      this.logger.info(`Provider event: ${event}`, data);
    });
  }



  // Message handling is now managed by MessageRouter

  // Installation handling is now managed by LifecycleManager

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

  async handleGetSettings(message, sender) {
    try {
      this.logger.debug('Getting settings');
      const config = this.configManager.getCurrentConfiguration();

      // Send response directly to the sender
      if (sender.tab) {
        chrome.tabs.sendMessage(sender.tab.id, {
          type: 'SETTINGS_RESULT',
          success: true,
          data: config
        });
      } else {
        // For popup/options page
        chrome.runtime.sendMessage({
          type: 'SETTINGS_RESULT',
          success: true,
          data: config
        });
      }
    } catch (error) {
      ErrorHandler.handle(error, 'PromptBoostBackground.handleGetSettings');
      const errorResponse = {
        type: 'SETTINGS_ERROR',
        success: false,
        error: error.message
      };

      if (sender.tab) {
        chrome.tabs.sendMessage(sender.tab.id, errorResponse);
      } else {
        chrome.runtime.sendMessage(errorResponse);
      }
    }
  }

  async handleGetTemplates(message, sender) {
    try {
      this.logger.debug('Getting templates');
      const templates = this.templateManager.getAllTemplates(message.filters);

      // Send response directly to the sender
      if (sender.tab) {
        chrome.tabs.sendMessage(sender.tab.id, {
          type: 'TEMPLATES_RESULT',
          success: true,
          data: templates
        });
      } else {
        chrome.runtime.sendMessage({
          type: 'TEMPLATES_RESULT',
          success: true,
          data: templates
        });
      }
    } catch (error) {
      ErrorHandler.handle(error, 'PromptBoostBackground.handleGetTemplates');
      const errorResponse = {
        type: 'TEMPLATES_ERROR',
        success: false,
        error: error.message
      };

      if (sender.tab) {
        chrome.tabs.sendMessage(sender.tab.id, errorResponse);
      } else {
        chrome.runtime.sendMessage(errorResponse);
      }
    }
  }

  async handleSaveTemplate(message, _sender) {
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

  async handleDeleteTemplate(message, _sender) {
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

  async handleTestAPI(message, _sender) {
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
  async handleGetProviders(_message, _sender) {
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
  async handleGetProviderModels(message, _sender) {
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
  async handleTestProvider(message, _sender) {
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
  async handleGetProviderConfigSchema(message, _sender) {
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

  async handleOpenRouterAuth(message, _sender) {
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

        // Build OAuth URL using OpenRouter's PKCE format
        const redirectUri = chrome.identity.getRedirectURL('oauth');
        const authUrl = new URL('https://openrouter.ai/auth');
        authUrl.searchParams.set('callback_url', redirectUri);
        authUrl.searchParams.set('code_challenge', codeChallenge);
        authUrl.searchParams.set('code_challenge_method', 'S256');

        this.logger.info('Starting OpenRouter OAuth flow', {
          redirectUri,
          authUrl: authUrl.toString()
        });

        // Launch OAuth flow
        chrome.identity.launchWebAuthFlow({
          url: authUrl.toString(),
          interactive: true
        }, async (responseUrl) => {
          if (chrome.runtime.lastError) {
            this.logger.error('OAuth flow failed', chrome.runtime.lastError);
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
      this.logger.error('OpenRouter auth error', error);
      chrome.runtime.sendMessage({
        type: 'OPENROUTER_AUTH_ERROR',
        error: error.message
      });
    }
  }

  async handleOAuthCallback(responseUrl, codeVerifier) {
    try {
      this.logger.info('Processing OAuth callback', { responseUrl });

      const url = new URL(responseUrl);
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error');

      if (error) {
        throw new Error(`OAuth error: ${error}`);
      }

      if (!code) {
        throw new Error('No authorization code received');
      }

      // Exchange code for API key using OpenRouter's endpoint
      const tokenResponse = await fetch('https://openrouter.ai/api/v1/auth/keys', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code: code,
          code_verifier: codeVerifier,
          code_challenge_method: 'S256'
        })
      });

      if (!tokenResponse.ok) {
        const errorData = await tokenResponse.json().catch(() => ({}));
        this.logger.error('Token exchange failed', {
          status: tokenResponse.status,
          statusText: tokenResponse.statusText,
          errorData
        });
        throw new Error(errorData.error || errorData.message || `HTTP ${tokenResponse.status}: Failed to exchange code for API key`);
      }

      const tokenData = await tokenResponse.json();
      this.logger.info('Token exchange successful', {
        hasKey: !!tokenData.key,
        userId: tokenData.user_id
      });

      // Clean up stored verifier
      await chrome.storage.local.remove(['openrouter_code_verifier']);

      // Send success message with API key (OpenRouter returns 'key', not 'access_token')
      chrome.runtime.sendMessage({
        type: 'OPENROUTER_AUTH_SUCCESS',
        token: tokenData.key,
        userId: tokenData.user_id
      });

    } catch (error) {
      this.logger.error('OAuth callback error', error);
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
  async handleGetConfiguration(message, _sender) {
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
  async handleUpdateConfiguration(message, _sender) {
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
  async handleResetConfiguration(message, _sender) {
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
  async handleTestTemplate(message, _sender) {
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
