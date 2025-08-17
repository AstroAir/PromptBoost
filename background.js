/**
 * @fileoverview PromptBoost Background Script
 * Handles LLM API calls, message passing between extension components,
 * and manages extension lifecycle events.
 *
 * @author PromptBoost Team
 * @version 1.0.0
 * @since 1.0.0
 */

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
   * Initializes message listeners and install handlers.
   *
   * @constructor
   * @since 1.0.0
   */
  constructor() {
    this.setupMessageListener();
    this.setupInstallListener();
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
      const result = await chrome.storage.sync.get(['templates']);
      const templates = result.templates || this.getDefaultTemplates();

      chrome.runtime.sendMessage({
        type: 'TEMPLATES_RESULT',
        data: templates
      });
    } catch (error) {
      chrome.runtime.sendMessage({
        type: 'TEMPLATES_ERROR',
        error: error.message
      });
    }
  }

  async handleSaveTemplate(message, sender) {
    try {
      const { template } = message;
      const result = await chrome.storage.sync.get(['templates']);
      const templates = result.templates || {};

      // Generate ID if not provided
      if (!template.id) {
        template.id = 'custom_' + Date.now();
      }

      template.isCustom = true;
      template.createdAt = template.createdAt || Date.now();
      template.updatedAt = Date.now();

      templates[template.id] = template;

      await chrome.storage.sync.set({ templates });

      chrome.runtime.sendMessage({
        type: 'TEMPLATE_SAVED',
        data: template
      });
    } catch (error) {
      chrome.runtime.sendMessage({
        type: 'TEMPLATE_SAVE_ERROR',
        error: error.message
      });
    }
  }

  async handleDeleteTemplate(message, sender) {
    try {
      const { templateId } = message;
      const result = await chrome.storage.sync.get(['templates']);
      const templates = result.templates || {};

      if (templates[templateId] && !templates[templateId].isDefault) {
        delete templates[templateId];
        await chrome.storage.sync.set({ templates });

        chrome.runtime.sendMessage({
          type: 'TEMPLATE_DELETED',
          data: { templateId }
        });
      } else {
        throw new Error('Cannot delete default template');
      }
    } catch (error) {
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
    const { provider, apiKey, apiEndpoint, model, promptTemplate } = settings;
    const maxRetries = 3;

    if (!apiKey) {
      throw new Error('API key not configured');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for optimization');
    }

    if (text.length > 10000) {
      throw new Error('Text too long (maximum 10,000 characters)');
    }

    const prompt = promptTemplate.replace('{text}', text);

    try {
      let result;
      switch (provider) {
        case 'openai':
          result = await this.callOpenAI(prompt, apiKey, apiEndpoint, model);
          break;
        case 'anthropic':
          result = await this.callAnthropic(prompt, apiKey, model);
          break;
        case 'openrouter':
          result = await this.callOpenRouter(prompt, apiKey, model);
          break;
        case 'custom':
          result = await this.callCustomAPI(prompt, apiKey, apiEndpoint, model);
          break;
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }

      if (!result || result.trim().length === 0) {
        throw new Error('Empty response from API');
      }

      return result;
    } catch (error) {
      // Retry logic for transient errors
      if (retryCount < maxRetries && this.isRetryableError(error)) {
        console.log(`Retrying API call (attempt ${retryCount + 1}/${maxRetries}):`, error.message);
        await this.delay(Math.pow(2, retryCount) * 1000); // Exponential backoff
        return this.callLLMAPI(text, settings, retryCount + 1);
      }

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

  async callOpenAI(prompt, apiKey, endpoint, model) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  async callAnthropic(prompt, apiKey, model) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model || 'claude-3-sonnet-20240229',
        max_tokens: 1000,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.content[0]?.text || '';
  }

  async callOpenRouter(prompt, apiKey, model) {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': chrome.runtime.getURL(''),
        'X-Title': 'PromptBoost'
      },
      body: JSON.stringify({
        model: model || 'openai/gpt-3.5-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0]?.message?.content || '';
  }

  async callCustomAPI(prompt, apiKey, endpoint, model) {
    // Generic implementation for custom APIs
    // Assumes OpenAI-compatible format
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Try different response formats
    if (data.choices && data.choices[0]?.message?.content) {
      return data.choices[0].message.content;
    } else if (data.content && data.content[0]?.text) {
      return data.content[0].text;
    } else if (data.response) {
      return data.response;
    } else if (data.text) {
      return data.text;
    } else {
      throw new Error('Unexpected API response format');
    }
  }
}

// Initialize background script
new PromptBoostBackground();
