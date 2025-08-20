/**
 * @fileoverview Authentication Manager for PromptBoost Extension
 * Handles OAuth flows, API key management, and provider authentication.
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
 * Manages authentication for various AI providers including OAuth flows and API key validation.
 * Supports PKCE (Proof Key for Code Exchange) for enhanced security.
 * 
 * @class AuthenticationManager
 * @since 2.0.0
 */
class AuthenticationManager {
  /**
   * Creates an instance of AuthenticationManager.
   * 
   * @constructor
   * @param {Object} dependencies - Injected dependencies
   * @param {Logger} dependencies.logger - Logger instance
   * @param {MessageRouter} dependencies.messageRouter - Message router instance
   * @param {ProviderRegistry} dependencies.providerRegistry - Provider registry instance
   */
  constructor(dependencies) {
    this.logger = dependencies.logger;
    this.messageRouter = dependencies.messageRouter;
    this.providerRegistry = dependencies.providerRegistry;

    // OAuth state management
    this.oauthStates = new Map();
  }

  /**
   * Handles OpenRouter OAuth authentication.
   * 
   * @method handleOpenRouterAuth
   * @param {Object} message - Message object containing OAuth action
   * @param {Object} sender - Message sender information
   * @param {Function} sendResponse - Response callback function
   */
  async handleOpenRouterAuth(message, sender, sendResponse) {
    try {
      const { action } = message;
      this.logger.debug('Handling OpenRouter OAuth', { action });

      if (action === 'start') {
        await this.startOpenRouterOAuth(sender, sendResponse);
      } else if (action === 'callback') {
        await this.handleOpenRouterCallback(message, sender, sendResponse);
      } else {
        throw new Error(`Unknown OAuth action: ${action}`);
      }

    } catch (error) {
      this.logger.error('OpenRouter OAuth error:', error);
      
      const errorResponse = {
        type: 'OPENROUTER_AUTH_ERROR',
        success: false,
        error: error.message
      };

      this.messageRouter.sendResponse(sender, errorResponse, sendResponse);
    }
  }

  /**
   * Starts the OpenRouter OAuth flow using PKCE.
   * 
   * @method startOpenRouterOAuth
   * @param {Object} sender - Message sender information
   * @param {Function} sendResponse - Response callback function
   * @private
   */
  async startOpenRouterOAuth(_sender, _sendResponse) {
    // Generate PKCE parameters
    const codeVerifier = this.generateCodeVerifier();
    const codeChallenge = await this.generateCodeChallenge(codeVerifier);

    // Store code verifier securely
    await chrome.storage.local.set({
      [STORAGE_KEYS.OAUTH_STATE]: {
        provider: 'openrouter',
        codeVerifier: codeVerifier,
        timestamp: Date.now()
      }
    });

    // Build OAuth URL using OpenRouter's PKCE format
    const redirectUri = chrome.identity.getRedirectURL('oauth');
    const authUrl = new URL(API_ENDPOINTS.OPENROUTER_AUTH);
    authUrl.searchParams.set('callback_url', redirectUri);
    authUrl.searchParams.set('code_challenge', codeChallenge);
    authUrl.searchParams.set('code_challenge_method', 'S256');

    this.logger.info('Starting OpenRouter OAuth flow', {
      redirectUri,
      authUrl: authUrl.toString()
    });

    try {
      // Launch OAuth flow
      const responseUrl = await chrome.identity.launchWebAuthFlow({
        url: authUrl.toString(),
        interactive: true
      });

      // Parse the response URL
      const urlParams = new URL(responseUrl);
      const code = urlParams.searchParams.get('code');
      const error = urlParams.searchParams.get('error');

      if (error) {
        throw new Error(`OAuth error: ${error}`);
      }

      if (!code) {
        throw new Error('No authorization code received');
      }

      // Exchange code for token
      await this.exchangeCodeForToken(code, codeVerifier);

    } catch (error) {
      // Clean up stored verifier on error
      await chrome.storage.local.remove([STORAGE_KEYS.OAUTH_STATE]);
      throw error;
    }
  }

  /**
   * Exchanges authorization code for access token.
   * 
   * @method exchangeCodeForToken
   * @param {string} code - Authorization code
   * @param {string} codeVerifier - PKCE code verifier
   * @private
   */
  async exchangeCodeForToken(code, codeVerifier) {
    const redirectUri = chrome.identity.getRedirectURL('oauth');
    
    const tokenResponse = await fetch(`${API_ENDPOINTS.OPENROUTER}/auth/keys`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        code: code,
        code_verifier: codeVerifier,
        redirect_uri: redirectUri
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `Token exchange failed: ${tokenResponse.status}`);
    }

    const tokenData = await tokenResponse.json();

    // Clean up stored verifier
    await chrome.storage.local.remove([STORAGE_KEYS.OAUTH_STATE]);

    // Send success message with API key
    const successResponse = {
      type: 'OPENROUTER_AUTH_SUCCESS',
      success: true,
      data: {
        token: tokenData.key,
        userId: tokenData.user_id
      }
    };

    chrome.runtime.sendMessage(successResponse);
  }

  /**
   * Handles OpenRouter OAuth callback.
   * 
   * @method handleOpenRouterCallback
   * @param {Object} message - Message object containing callback data
   * @param {Object} sender - Message sender information
   * @param {Function} sendResponse - Response callback function
   * @private
   */
  async handleOpenRouterCallback(message, _sender, _sendResponse) {
    const { url } = message;
    
    try {
      // Parse callback URL
      const urlParams = new URL(url);
      const code = urlParams.searchParams.get('code');
      const error = urlParams.searchParams.get('error');

      if (error) {
        throw new Error(`OAuth callback error: ${error}`);
      }

      if (!code) {
        throw new Error('No authorization code in callback');
      }

      // Retrieve stored code verifier
      const result = await chrome.storage.local.get([STORAGE_KEYS.OAUTH_STATE]);
      const oauthState = result[STORAGE_KEYS.OAUTH_STATE];

      if (!oauthState || oauthState.provider !== 'openrouter') {
        throw new Error('Invalid OAuth state');
      }

      // Exchange code for token
      await this.exchangeCodeForToken(code, oauthState.codeVerifier);

    } catch (error) {
      // Clean up stored state on error
      await chrome.storage.local.remove([STORAGE_KEYS.OAUTH_STATE]);
      throw error;
    }
  }

  /**
   * Handles generic provider authentication.
   * 
   * @method handleProviderAuth
   * @param {Object} message - Message object containing provider and credentials
   * @param {Object} sender - Message sender information
   * @param {Function} sendResponse - Response callback function
   */
  async handleProviderAuth(message, sender, sendResponse) {
    try {
      const { provider: providerName, credentials, action } = message;
      
      const provider = this.providerRegistry.getProvider(providerName);
      if (!provider) {
        throw new Error(`Provider not found: ${providerName}`);
      }

      let result;
      
      switch (action) {
        case 'validate':
          result = await this.validateCredentials(provider, credentials);
          break;
        case 'authenticate':
          result = await this.authenticateProvider(provider, credentials);
          break;
        case 'refresh':
          result = await this.refreshAuthentication(provider, credentials);
          break;
        default:
          throw new Error(`Unknown authentication action: ${action}`);
      }

      const response = {
        type: 'PROVIDER_AUTH_RESULT',
        success: true,
        data: result
      };

      this.messageRouter.sendResponse(sender, response, sendResponse);

    } catch (error) {
      this.logger.error('Provider authentication error:', error);
      
      const errorResponse = {
        type: 'PROVIDER_AUTH_ERROR',
        success: false,
        error: error.message
      };

      this.messageRouter.sendResponse(sender, errorResponse, sendResponse);
    }
  }

  /**
   * Validates provider credentials.
   * 
   * @method validateCredentials
   * @param {Provider} provider - Provider instance
   * @param {Object} credentials - Credentials to validate
   * @returns {Promise<Object>} Validation result
   * @private
   */
  async validateCredentials(provider, credentials) {
    this.logger.debug(`Validating credentials for ${provider.name}`);

    // Basic validation
    if (!credentials.apiKey) {
      throw new Error('API key is required');
    }

    if (credentials.apiKey.length < VALIDATION_CONSTRAINTS.API_KEY_MIN_LENGTH) {
      throw new Error('API key is too short');
    }

    // Provider-specific validation
    if (provider.validateCredentials) {
      return await provider.validateCredentials(credentials);
    }

    // Default validation - test connection
    return await provider.testConnection(credentials);
  }

  /**
   * Authenticates with a provider.
   * 
   * @method authenticateProvider
   * @param {Provider} provider - Provider instance
   * @param {Object} credentials - Authentication credentials
   * @returns {Promise<Object>} Authentication result
   * @private
   */
  async authenticateProvider(provider, credentials) {
    this.logger.debug(`Authenticating with ${provider.name}`);

    const result = await provider.authenticate(credentials);
    
    if (result.success) {
      this.logger.info(`Successfully authenticated with ${provider.name}`);
    }

    return result;
  }

  /**
   * Refreshes authentication for a provider.
   * 
   * @method refreshAuthentication
   * @param {Provider} provider - Provider instance
   * @param {Object} credentials - Current credentials
   * @returns {Promise<Object>} Refresh result
   * @private
   */
  async refreshAuthentication(provider, credentials) {
    this.logger.debug(`Refreshing authentication for ${provider.name}`);

    if (provider.refreshAuthentication) {
      return await provider.refreshAuthentication(credentials);
    }

    // Fallback to re-authentication
    return await this.authenticateProvider(provider, credentials);
  }

  /**
   * Generates a cryptographically secure code verifier for PKCE.
   * 
   * @method generateCodeVerifier
   * @returns {string} Base64URL-encoded code verifier
   * @private
   */
  generateCodeVerifier() {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Generates a code challenge from a code verifier using SHA256.
   * 
   * @method generateCodeChallenge
   * @param {string} verifier - Code verifier
   * @returns {Promise<string>} Base64URL-encoded code challenge
   * @private
   */
  async generateCodeChallenge(verifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const digest = await crypto.subtle.digest('SHA-256', data);
    return btoa(String.fromCharCode.apply(null, new Uint8Array(digest)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  /**
   * Clears stored OAuth state.
   * 
   * @method clearOAuthState
   * @param {string} provider - Provider name
   */
  async clearOAuthState(provider) {
    const result = await chrome.storage.local.get([STORAGE_KEYS.OAUTH_STATE]);
    const oauthState = result[STORAGE_KEYS.OAUTH_STATE];

    if (oauthState && oauthState.provider === provider) {
      await chrome.storage.local.remove([STORAGE_KEYS.OAUTH_STATE]);
    }
  }
}

// Export the class
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AuthenticationManager;
} else {
  window.AuthenticationManager = AuthenticationManager;
}
