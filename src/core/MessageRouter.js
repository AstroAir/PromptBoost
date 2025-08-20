/**
 * @fileoverview Message Router for PromptBoost Extension
 * Handles all message routing between extension components with proper error handling and logging.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

/**
 * Centralized message routing system for the PromptBoost extension.
 * Manages communication between content scripts, popup, options page, and background script.
 * 
 * @class MessageRouter
 * @since 2.0.0
 */
class MessageRouter {
  /**
   * Creates an instance of MessageRouter.
   * 
   * @constructor
   * @param {Object} dependencies - Injected dependencies
   * @param {Logger} dependencies.logger - Logger instance
   * @param {ApiController} dependencies.apiController - API controller instance
   * @param {TemplateManager} dependencies.templateManager - Template manager instance
   * @param {ConfigurationManager} dependencies.configManager - Configuration manager instance
   * @param {AuthenticationManager} dependencies.authManager - Authentication manager instance
   */
  constructor(dependencies) {
    this.logger = dependencies.logger;
    this.apiController = dependencies.apiController;
    this.templateManager = dependencies.templateManager;
    this.configManager = dependencies.configManager;
    this.authManager = dependencies.authManager;

    // Message handlers map
    this.messageHandlers = new Map();
    this.setupMessageHandlers();
    this.setupMessageListener();
  }

  /**
   * Sets up message handlers for different message types.
   * 
   * @method setupMessageHandlers
   * @private
   */
  setupMessageHandlers() {
    // Text optimization handlers
    this.messageHandlers.set('OPTIMIZE_TEXT', this.handleOptimizeText.bind(this));
    this.messageHandlers.set('OPTIMIZE_WITH_TEMPLATE', this.handleOptimizeWithTemplate.bind(this));
    this.messageHandlers.set('TEST_API', this.handleTestAPI.bind(this));

    // Configuration handlers
    this.messageHandlers.set('GET_SETTINGS', this.handleGetSettings.bind(this));
    this.messageHandlers.set('SAVE_SETTINGS', this.handleSaveSettings.bind(this));
    this.messageHandlers.set('GET_CONFIGURATION', this.handleGetConfiguration.bind(this));
    this.messageHandlers.set('UPDATE_CONFIGURATION', this.handleUpdateConfiguration.bind(this));
    this.messageHandlers.set('RESET_CONFIGURATION', this.handleResetConfiguration.bind(this));

    // Template handlers
    this.messageHandlers.set('GET_TEMPLATES', this.handleGetTemplates.bind(this));
    this.messageHandlers.set('SAVE_TEMPLATE', this.handleSaveTemplate.bind(this));
    this.messageHandlers.set('DELETE_TEMPLATE', this.handleDeleteTemplate.bind(this));
    this.messageHandlers.set('TEST_TEMPLATE', this.handleTestTemplate.bind(this));
    this.messageHandlers.set('IMPORT_TEMPLATES', this.handleImportTemplates.bind(this));
    this.messageHandlers.set('EXPORT_TEMPLATES', this.handleExportTemplates.bind(this));

    // Provider system handlers
    this.messageHandlers.set('GET_PROVIDERS', this.handleGetProviders.bind(this));
    this.messageHandlers.set('GET_PROVIDER_MODELS', this.handleGetProviderModels.bind(this));
    this.messageHandlers.set('TEST_PROVIDER', this.handleTestProvider.bind(this));
    this.messageHandlers.set('GET_PROVIDER_CONFIG_SCHEMA', this.handleGetProviderConfigSchema.bind(this));

    // Authentication handlers
    this.messageHandlers.set('OPENROUTER_AUTH', this.handleOpenRouterAuth.bind(this));
    this.messageHandlers.set('PROVIDER_AUTH', this.handleProviderAuth.bind(this));
  }

  /**
   * Sets up the main message listener.
   * 
   * @method setupMessageListener
   * @private
   */
  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.routeMessage(message, sender, sendResponse);
      return true; // Keep message channel open for async responses
    });
  }

  /**
   * Routes incoming messages to appropriate handlers.
   * 
   * @method routeMessage
   * @param {Object} message - The message object
   * @param {Object} sender - Message sender information
   * @param {Function} sendResponse - Response callback function
   */
  async routeMessage(message, sender, sendResponse) {
    try {
      const { type } = message;
      
      if (!type) {
        throw new Error('Message type is required');
      }

      this.logger.debug(`Routing message: ${type}`, { sender: sender.tab?.url || 'extension' });

      const handler = this.messageHandlers.get(type);
      if (!handler) {
        throw new Error(`Unknown message type: ${type}`);
      }

      // Call the handler
      await handler(message, sender, sendResponse);

    } catch (error) {
      this.logger.error(`Message routing error for type ${message.type}:`, error);
      
      // Send error response
      const errorResponse = {
        type: `${message.type}_ERROR`,
        success: false,
        error: error.message
      };

      if (sender.tab) {
        chrome.tabs.sendMessage(sender.tab.id, errorResponse).catch(() => {});
      } else {
        sendResponse(errorResponse);
      }
    }
  }

  /**
   * Sends a response message to the appropriate destination.
   * 
   * @method sendResponse
   * @param {Object} sender - Original message sender
   * @param {Object} response - Response object
   * @param {Function} sendResponseCallback - Response callback function
   */
  sendResponse(sender, response, sendResponseCallback) {
    if (sender.tab) {
      // Send to content script
      chrome.tabs.sendMessage(sender.tab.id, response).catch((error) => {
        this.logger.warn('Failed to send message to tab:', error);
      });
    } else {
      // Send to popup/options page
      if (sendResponseCallback) {
        sendResponseCallback(response);
      } else {
        chrome.runtime.sendMessage(response).catch((error) => {
          this.logger.warn('Failed to send runtime message:', error);
        });
      }
    }
  }

  /**
   * Broadcasts a message to all tabs.
   * 
   * @method broadcastToTabs
   * @param {Object} message - Message to broadcast
   */
  broadcastToTabs(message) {
    chrome.tabs.query({}, (tabs) => {
      tabs.forEach(tab => {
        chrome.tabs.sendMessage(tab.id, message).catch(() => {
          // Ignore errors for tabs without content script
        });
      });
    });
  }

  // Message handler methods (delegating to appropriate controllers)

  async handleOptimizeText(message, sender, sendResponse) {
    return this.apiController.handleOptimizeText(message, sender, sendResponse);
  }

  async handleOptimizeWithTemplate(message, sender, sendResponse) {
    return this.apiController.handleOptimizeWithTemplate(message, sender, sendResponse);
  }

  async handleTestAPI(message, sender, sendResponse) {
    return this.apiController.handleTestAPI(message, sender, sendResponse);
  }

  async handleGetSettings(message, sender, sendResponse) {
    return this.configManager.handleGetSettings(message, sender, sendResponse);
  }

  async handleSaveSettings(message, sender, sendResponse) {
    return this.configManager.handleSaveSettings(message, sender, sendResponse);
  }

  async handleGetConfiguration(message, sender, sendResponse) {
    return this.configManager.handleGetConfiguration(message, sender, sendResponse);
  }

  async handleUpdateConfiguration(message, sender, sendResponse) {
    return this.configManager.handleUpdateConfiguration(message, sender, sendResponse);
  }

  async handleResetConfiguration(message, sender, sendResponse) {
    return this.configManager.handleResetConfiguration(message, sender, sendResponse);
  }

  async handleGetTemplates(message, sender, sendResponse) {
    return this.templateManager.handleGetTemplates(message, sender, sendResponse);
  }

  async handleSaveTemplate(message, sender, sendResponse) {
    return this.templateManager.handleSaveTemplate(message, sender, sendResponse);
  }

  async handleDeleteTemplate(message, sender, sendResponse) {
    return this.templateManager.handleDeleteTemplate(message, sender, sendResponse);
  }

  async handleTestTemplate(message, sender, sendResponse) {
    return this.templateManager.handleTestTemplate(message, sender, sendResponse);
  }

  async handleImportTemplates(message, sender, sendResponse) {
    return this.templateManager.handleImportTemplates(message, sender, sendResponse);
  }

  async handleExportTemplates(message, sender, sendResponse) {
    return this.templateManager.handleExportTemplates(message, sender, sendResponse);
  }

  async handleGetProviders(message, sender, sendResponse) {
    return this.apiController.handleGetProviders(message, sender, sendResponse);
  }

  async handleGetProviderModels(message, sender, sendResponse) {
    return this.apiController.handleGetProviderModels(message, sender, sendResponse);
  }

  async handleTestProvider(message, sender, sendResponse) {
    return this.apiController.handleTestProvider(message, sender, sendResponse);
  }

  async handleGetProviderConfigSchema(message, sender, sendResponse) {
    return this.apiController.handleGetProviderConfigSchema(message, sender, sendResponse);
  }

  async handleOpenRouterAuth(message, sender, sendResponse) {
    return this.authManager.handleOpenRouterAuth(message, sender, sendResponse);
  }

  async handleProviderAuth(message, sender, sendResponse) {
    return this.authManager.handleProviderAuth(message, sender, sendResponse);
  }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = MessageRouter;
} else {
  window.MessageRouter = MessageRouter;
}
