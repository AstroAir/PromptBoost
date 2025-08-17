/**
 * @fileoverview Configuration Validation Utilities for PromptBoost
 * Provides comprehensive validation for API keys, endpoints, models,
 * and other configuration settings.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

/**
 * Validation result structure
 * @typedef {Object} ValidationResult
 * @property {boolean} isValid - Whether validation passed
 * @property {Array<string>} errors - List of validation errors
 * @property {Array<string>} warnings - List of validation warnings
 * @property {Object} sanitized - Sanitized configuration values
 */

/**
 * Configuration validation utilities
 * @class ConfigValidator
 */
class ConfigValidator {
  /**
   * Validates API key format and structure
   * 
   * @static
   * @method validateApiKey
   * @param {string} apiKey - API key to validate
   * @param {string} provider - Provider name
   * @returns {ValidationResult} Validation result
   */
  static validateApiKey(apiKey, provider) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitized: apiKey
    };

    if (!apiKey || typeof apiKey !== 'string') {
      result.isValid = false;
      result.errors.push('API key is required');
      return result;
    }

    const trimmedKey = apiKey.trim();
    if (trimmedKey.length === 0) {
      result.isValid = false;
      result.errors.push('API key cannot be empty');
      return result;
    }

    // Provider-specific validation
    switch (provider?.toLowerCase()) {
      case 'openai':
        if (!trimmedKey.startsWith('sk-')) {
          result.warnings.push('OpenAI API keys typically start with "sk-"');
        }
        if (trimmedKey.length < 40) {
          result.warnings.push('OpenAI API keys are typically longer');
        }
        break;

      case 'anthropic':
        if (!trimmedKey.startsWith('sk-ant-')) {
          result.warnings.push('Anthropic API keys typically start with "sk-ant-"');
        }
        break;

      case 'cohere':
        if (trimmedKey.length < 30) {
          result.warnings.push('Cohere API keys are typically longer');
        }
        break;

      case 'huggingface':
        if (!trimmedKey.startsWith('hf_')) {
          result.warnings.push('Hugging Face tokens typically start with "hf_"');
        }
        break;
    }

    // General security checks
    if (trimmedKey.includes(' ')) {
      result.isValid = false;
      result.errors.push('API key should not contain spaces');
    }

    if (trimmedKey.length < 10) {
      result.isValid = false;
      result.errors.push('API key is too short');
    }

    if (trimmedKey.length > 200) {
      result.isValid = false;
      result.errors.push('API key is too long');
    }

    result.sanitized = trimmedKey;
    return result;
  }

  /**
   * Validates API endpoint URL
   * 
   * @static
   * @method validateEndpoint
   * @param {string} endpoint - Endpoint URL to validate
   * @param {string} [provider] - Provider name for specific validation
   * @returns {ValidationResult} Validation result
   */
  static validateEndpoint(endpoint, provider) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitized: endpoint
    };

    if (!endpoint || typeof endpoint !== 'string') {
      result.isValid = false;
      result.errors.push('Endpoint URL is required');
      return result;
    }

    const trimmedEndpoint = endpoint.trim();

    try {
      const url = new URL(trimmedEndpoint);

      // Must use HTTPS in production
      if (url.protocol !== 'https:' && url.protocol !== 'http:') {
        result.isValid = false;
        result.errors.push('Endpoint must use HTTP or HTTPS protocol');
      }

      if (url.protocol === 'http:' && !this.isLocalhost(url.hostname)) {
        result.warnings.push('HTTP endpoints are not secure. Consider using HTTPS.');
      }

      // Provider-specific endpoint validation
      if (provider) {
        this.validateProviderEndpoint(url, provider, result);
      }

      result.sanitized = url.toString();

    } catch (error) {
      result.isValid = false;
      result.errors.push('Invalid URL format');
    }

    return result;
  }

  /**
   * Validates provider-specific endpoint requirements
   * 
   * @static
   * @method validateProviderEndpoint
   * @param {URL} url - Parsed URL object
   * @param {string} provider - Provider name
   * @param {ValidationResult} result - Result object to modify
   */
  static validateProviderEndpoint(url, provider, result) {
    const expectedDomains = {
      openai: ['api.openai.com'],
      anthropic: ['api.anthropic.com'],
      cohere: ['api.cohere.ai'],
      huggingface: ['api-inference.huggingface.co'],
      gemini: ['generativelanguage.googleapis.com'],
      openrouter: ['openrouter.ai']
    };

    const expected = expectedDomains[provider.toLowerCase()];
    if (expected && !expected.includes(url.hostname)) {
      result.warnings.push(`Unexpected domain for ${provider}. Expected: ${expected.join(', ')}`);
    }
  }

  /**
   * Validates model name and parameters
   * 
   * @static
   * @method validateModel
   * @param {string} model - Model name to validate
   * @param {string} provider - Provider name
   * @returns {ValidationResult} Validation result
   */
  static validateModel(model, provider) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitized: model
    };

    if (!model || typeof model !== 'string') {
      result.isValid = false;
      result.errors.push('Model name is required');
      return result;
    }

    const trimmedModel = model.trim();
    if (trimmedModel.length === 0) {
      result.isValid = false;
      result.errors.push('Model name cannot be empty');
      return result;
    }

    // Provider-specific model validation
    const knownModels = this.getKnownModels(provider);
    if (knownModels.length > 0 && !knownModels.includes(trimmedModel)) {
      result.warnings.push(`Unknown model for ${provider}. Known models: ${knownModels.slice(0, 3).join(', ')}${knownModels.length > 3 ? '...' : ''}`);
    }

    result.sanitized = trimmedModel;
    return result;
  }

  /**
   * Gets known models for a provider
   * 
   * @static
   * @method getKnownModels
   * @param {string} provider - Provider name
   * @returns {Array<string>} List of known models
   */
  static getKnownModels(provider) {
    const models = {
      openai: ['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'gpt-3.5-turbo-16k'],
      anthropic: ['claude-3-opus-20240229', 'claude-3-sonnet-20240229', 'claude-3-haiku-20240307'],
      cohere: ['command', 'command-light', 'command-nightly'],
      gemini: ['gemini-pro', 'gemini-pro-vision'],
      huggingface: [] // Too many to list
    };

    return models[provider?.toLowerCase()] || [];
  }

  /**
   * Validates complete provider configuration
   * 
   * @static
   * @method validateProviderConfig
   * @param {Object} config - Configuration object
   * @returns {ValidationResult} Validation result
   */
  static validateProviderConfig(config) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitized: {}
    };

    if (!config || typeof config !== 'object') {
      result.isValid = false;
      result.errors.push('Configuration object is required');
      return result;
    }

    // Validate provider
    if (!config.provider) {
      result.isValid = false;
      result.errors.push('Provider is required');
    } else {
      result.sanitized.provider = config.provider.trim().toLowerCase();
    }

    // Validate API key
    if (config.apiKey) {
      const keyValidation = this.validateApiKey(config.apiKey, config.provider);
      result.errors.push(...keyValidation.errors);
      result.warnings.push(...keyValidation.warnings);
      result.sanitized.apiKey = keyValidation.sanitized;
      if (!keyValidation.isValid) result.isValid = false;
    }

    // Validate endpoint
    if (config.apiEndpoint) {
      const endpointValidation = this.validateEndpoint(config.apiEndpoint, config.provider);
      result.errors.push(...endpointValidation.errors);
      result.warnings.push(...endpointValidation.warnings);
      result.sanitized.apiEndpoint = endpointValidation.sanitized;
      if (!endpointValidation.isValid) result.isValid = false;
    }

    // Validate model
    if (config.model) {
      const modelValidation = this.validateModel(config.model, config.provider);
      result.errors.push(...modelValidation.errors);
      result.warnings.push(...modelValidation.warnings);
      result.sanitized.model = modelValidation.sanitized;
      if (!modelValidation.isValid) result.isValid = false;
    }

    // Validate numeric parameters
    this.validateNumericParams(config, result);

    return result;
  }

  /**
   * Validates numeric parameters
   * 
   * @static
   * @method validateNumericParams
   * @param {Object} config - Configuration object
   * @param {ValidationResult} result - Result object to modify
   */
  static validateNumericParams(config, result) {
    const numericParams = {
      maxTokens: { min: 1, max: 8000, default: 1000 },
      temperature: { min: 0, max: 2, default: 0.7 },
      requestTimeout: { min: 1, max: 300, default: 30 },
      retryAttempts: { min: 0, max: 10, default: 3 }
    };

    Object.entries(numericParams).forEach(([param, constraints]) => {
      if (config[param] !== undefined) {
        const value = Number(config[param]);

        if (isNaN(value)) {
          result.errors.push(`${param} must be a number`);
          result.isValid = false;
        } else if (value < constraints.min || value > constraints.max) {
          result.errors.push(`${param} must be between ${constraints.min} and ${constraints.max}`);
          result.isValid = false;
        } else {
          result.sanitized[param] = value;
        }
      }
    });
  }

  /**
   * Checks if hostname is localhost
   * 
   * @static
   * @method isLocalhost
   * @param {string} hostname - Hostname to check
   * @returns {boolean} True if localhost
   */
  static isLocalhost(hostname) {
    return ['localhost', '127.0.0.1', '::1', '0.0.0.0'].includes(hostname);
  }

  /**
   * Validates template configuration
   * 
   * @static
   * @method validateTemplate
   * @param {Object} template - Template object
   * @returns {ValidationResult} Validation result
   */
  static validateTemplate(template) {
    const result = {
      isValid: true,
      errors: [],
      warnings: [],
      sanitized: {}
    };

    if (!template || typeof template !== 'object') {
      result.isValid = false;
      result.errors.push('Template object is required');
      return result;
    }

    // Validate required fields
    if (!template.name || typeof template.name !== 'string' || template.name.trim().length === 0) {
      result.isValid = false;
      result.errors.push('Template name is required');
    } else {
      result.sanitized.name = template.name.trim();
    }

    if (!template.template || typeof template.template !== 'string' || template.template.trim().length === 0) {
      result.isValid = false;
      result.errors.push('Template content is required');
    } else {
      const content = template.template.trim();
      result.sanitized.template = content;

      // Check for {text} placeholder
      if (!content.includes('{text}')) {
        result.warnings.push('Template should include {text} placeholder');
      }

      // Check template length
      if (content.length > 10000) {
        result.warnings.push('Template is very long and may affect performance');
      }
    }

    // Validate optional fields
    if (template.description) {
      result.sanitized.description = template.description.trim();
    }

    if (template.category) {
      result.sanitized.category = template.category.trim();
    }

    return result;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ConfigValidator };
} else if (typeof window !== 'undefined') {
  window.ConfigValidator = ConfigValidator;
}
