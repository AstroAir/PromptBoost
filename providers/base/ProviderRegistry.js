/**
 * @fileoverview Provider Registry for PromptBoost
 * Manages registration, discovery, and instantiation of LLM providers.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

/**
 * Registry for managing LLM providers.
 * Provides centralized provider management, discovery, and instantiation.
 * 
 * @class ProviderRegistry
 * @since 2.0.0
 */
class ProviderRegistry {
  /**
   * Creates an instance of ProviderRegistry.
   * 
   * @constructor
   * @since 2.0.0
   */
  constructor() {
    this.providers = new Map();
    this.instances = new Map();
    this.defaultProvider = null;
    this.fallbackProviders = [];
  }

  /**
   * Registers a provider class with the registry.
   * 
   * @method register
   * @param {string} name - Provider name
   * @param {Function} providerClass - Provider class constructor
   * @param {Object} [metadata={}] - Additional provider metadata
   * @returns {boolean} True if registration successful
   * @throws {Error} When provider name is already registered
   * @since 2.0.0
   */
  register(name, providerClass, metadata = {}) {
    if (this.providers.has(name)) {
      throw new Error(`Provider '${name}' is already registered`);
    }

    if (typeof providerClass !== 'function') {
      throw new Error('Provider class must be a constructor function');
    }

    this.providers.set(name, {
      name,
      class: providerClass,
      metadata: {
        ...metadata,
        registeredAt: Date.now()
      }
    });

    console.log(`Provider '${name}' registered successfully`);
    return true;
  }

  /**
   * Unregisters a provider from the registry.
   * 
   * @method unregister
   * @param {string} name - Provider name to unregister
   * @returns {boolean} True if unregistration successful
   * @since 2.0.0
   */
  unregister(name) {
    if (!this.providers.has(name)) {
      return false;
    }

    // Clean up any existing instances
    if (this.instances.has(name)) {
      this.instances.delete(name);
    }

    // Remove from fallback providers if present
    this.fallbackProviders = this.fallbackProviders.filter(p => p !== name);

    // Reset default provider if it's being unregistered
    if (this.defaultProvider === name) {
      this.defaultProvider = null;
    }

    this.providers.delete(name);
    console.log(`Provider '${name}' unregistered successfully`);
    return true;
  }

  /**
   * Gets a provider instance, creating it if necessary.
   * 
   * @method getProvider
   * @param {string} name - Provider name
   * @param {Object} [config={}] - Provider configuration
   * @returns {Object|null} Provider instance or null if not found
   * @since 2.0.0
   */
  getProvider(name, config = {}) {
    if (!this.providers.has(name)) {
      console.warn(`Provider '${name}' not found in registry`);
      return null;
    }

    // Return existing instance if available and config hasn't changed
    if (this.instances.has(name)) {
      const instance = this.instances.get(name);
      // Simple config comparison - in production, you might want a deeper comparison
      if (JSON.stringify(instance._config) === JSON.stringify(config)) {
        return instance;
      }
    }

    // Create new instance
    try {
      const providerInfo = this.providers.get(name);
      const ProviderClass = providerInfo.class;

      const instance = new ProviderClass({
        name,
        ...providerInfo.metadata,
        ...config
      });

      instance._config = config; // Store config for comparison
      this.instances.set(name, instance);

      return instance;
    } catch (error) {
      console.error(`Failed to create provider instance for '${name}':`, error);
      return null;
    }
  }

  /**
   * Gets all registered provider names.
   * 
   * @method getProviderNames
   * @returns {Array<string>} Array of provider names
   * @since 2.0.0
   */
  getProviderNames() {
    return Array.from(this.providers.keys());
  }

  /**
   * Gets metadata for all registered providers.
   * 
   * @method getProvidersMetadata
   * @returns {Array<Object>} Array of provider metadata
   * @since 2.0.0
   */
  getProvidersMetadata() {
    return Array.from(this.providers.values()).map(provider => ({
      name: provider.name,
      ...provider.metadata
    }));
  }

  /**
   * Checks if a provider is registered.
   * 
   * @method hasProvider
   * @param {string} name - Provider name to check
   * @returns {boolean} True if provider is registered
   * @since 2.0.0
   */
  hasProvider(name) {
    return this.providers.has(name);
  }

  /**
   * Sets the default provider.
   * 
   * @method setDefaultProvider
   * @param {string} name - Provider name to set as default
   * @returns {boolean} True if default provider set successfully
   * @throws {Error} When provider is not registered
   * @since 2.0.0
   */
  setDefaultProvider(name) {
    if (!this.providers.has(name)) {
      throw new Error(`Cannot set default provider: '${name}' is not registered`);
    }

    this.defaultProvider = name;
    return true;
  }

  /**
   * Gets the default provider instance.
   * 
   * @method getDefaultProvider
   * @param {Object} [config={}] - Provider configuration
   * @returns {Object|null} Default provider instance or null if not set
   * @since 2.0.0
   */
  getDefaultProvider(config = {}) {
    if (!this.defaultProvider) {
      return null;
    }

    return this.getProvider(this.defaultProvider, config);
  }

  /**
   * Sets fallback providers for error handling.
   * 
   * @method setFallbackProviders
   * @param {Array<string>} providers - Array of provider names in fallback order
   * @returns {boolean} True if fallback providers set successfully
   * @throws {Error} When any provider is not registered
   * @since 2.0.0
   */
  setFallbackProviders(providers) {
    // Validate all providers are registered
    for (const provider of providers) {
      if (!this.providers.has(provider)) {
        throw new Error(`Cannot set fallback provider: '${provider}' is not registered`);
      }
    }

    this.fallbackProviders = [...providers];
    return true;
  }

  /**
   * Gets a provider with fallback support.
   * Tries the primary provider first, then fallback providers in order.
   * 
   * @method getProviderWithFallback
   * @param {string} primaryProvider - Primary provider name
   * @param {Object} [config={}] - Provider configuration
   * @returns {Object|null} Provider instance or null if all fail
   * @since 2.0.0
   */
  getProviderWithFallback(primaryProvider, config = {}) {
    // Try primary provider first
    let provider = this.getProvider(primaryProvider, config);
    if (provider) {
      return provider;
    }

    // Try fallback providers
    for (const fallbackName of this.fallbackProviders) {
      provider = this.getProvider(fallbackName, config);
      if (provider) {
        console.warn(`Using fallback provider '${fallbackName}' instead of '${primaryProvider}'`);
        return provider;
      }
    }

    // Try default provider as last resort
    if (this.defaultProvider && this.defaultProvider !== primaryProvider) {
      provider = this.getDefaultProvider(config);
      if (provider) {
        console.warn(`Using default provider '${this.defaultProvider}' as last resort`);
        return provider;
      }
    }

    return null;
  }

  /**
   * Tests all registered providers.
   * 
   * @method testAllProviders
   * @param {Object} [configs={}] - Configuration for each provider
   * @returns {Promise<Object>} Test results for all providers
   * @since 2.0.0
   * @async
   */
  async testAllProviders(configs = {}) {
    const results = {};

    for (const providerName of this.getProviderNames()) {
      try {
        const provider = this.getProvider(providerName, configs[providerName] || {});
        if (provider) {
          results[providerName] = await provider.testConnection(configs[providerName] || {});
        } else {
          results[providerName] = {
            success: false,
            error: 'Failed to create provider instance'
          };
        }
      } catch (error) {
        results[providerName] = {
          success: false,
          error: error.message
        };
      }
    }

    return results;
  }

  /**
   * Clears all provider instances (forces recreation on next access).
   * 
   * @method clearInstances
   * @since 2.0.0
   */
  clearInstances() {
    this.instances.clear();
  }

  /**
   * Gets registry statistics.
   * 
   * @method getStats
   * @returns {Object} Registry statistics
   * @since 2.0.0
   */
  getStats() {
    return {
      totalProviders: this.providers.size,
      activeInstances: this.instances.size,
      defaultProvider: this.defaultProvider,
      fallbackProviders: this.fallbackProviders.length,
      providerNames: this.getProviderNames()
    };
  }
}

// Create singleton instance
const providerRegistry = new ProviderRegistry();

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ProviderRegistry, providerRegistry };
} else if (typeof window !== 'undefined') {
  window.ProviderRegistry = ProviderRegistry;
  window.providerRegistry = providerRegistry;
}
