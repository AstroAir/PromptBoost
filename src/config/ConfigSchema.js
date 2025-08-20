/**
 * @fileoverview Configuration Schema for PromptBoost Extension
 * Defines the complete configuration structure, validation rules, and default values.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

/**
 * Configuration schema definition with validation rules and default values
 */
const CONFIG_SCHEMA = {
  // Extension core settings
  enabled: {
    type: 'boolean',
    default: true,
    description: 'Whether the extension is enabled'
  },
  
  configVersion: {
    type: 'number',
    default: 2,
    description: 'Configuration version for migration purposes'
  },

  // Provider settings
  provider: {
    type: 'string',
    default: 'openai',
    enum: ['openai', 'anthropic', 'google', 'cohere', 'huggingface', 'local', 'openrouter'],
    description: 'Selected AI provider'
  },

  apiKey: {
    type: 'string',
    default: '',
    minLength: 10,
    maxLength: 200,
    description: 'API key for the selected provider'
  },

  apiEndpoint: {
    type: 'string',
    default: 'https://api.openai.com/v1/chat/completions',
    format: 'url',
    description: 'API endpoint URL'
  },

  model: {
    type: 'string',
    default: 'gpt-3.5-turbo',
    description: 'Selected model for the provider'
  },
  
  // Template settings
  promptTemplate: {
    type: 'string',
    default: 'Please improve and optimize the following text while maintaining its original meaning and tone:\n\n{text}',
    maxLength: 10000,
    description: 'Default prompt template'
  },

  selectedTemplate: {
    type: 'string',
    default: 'general',
    description: 'Currently selected template ID'
  },

  quickTemplateSelection: {
    type: 'boolean',
    default: true,
    description: 'Enable quick template selection'
  },

  // UI and interaction settings
  keyboardShortcut: {
    type: 'string',
    default: 'Ctrl+Shift+Space',
    description: 'Keyboard shortcut for text optimization'
  },

  timeWindow: {
    type: 'number',
    default: 1000,
    min: 100,
    max: 5000,
    description: 'Time window for triple spacebar detection (ms)'
  },

  // Advanced settings
  advanced: {
    type: 'object',
    default: {
      enableLogging: false,
      autoSaveHistory: true,
      maxHistoryItems: 100,
      requestTimeout: 30,
      retryAttempts: 3,
      showNotifications: true,
      notificationDuration: 4,
      maxTokens: 1000,
      temperature: 0.7
    },
    properties: {
      enableLogging: {
        type: 'boolean',
        default: false,
        description: 'Enable detailed logging'
      },
      autoSaveHistory: {
        type: 'boolean',
        default: true,
        description: 'Automatically save optimization history'
      },
      maxHistoryItems: {
        type: 'number',
        default: 100,
        min: 10,
        max: 1000,
        description: 'Maximum number of history items to keep'
      },
      requestTimeout: {
        type: 'number',
        default: 30,
        min: 5,
        max: 300,
        description: 'API request timeout in seconds'
      },
      retryAttempts: {
        type: 'number',
        default: 3,
        min: 0,
        max: 10,
        description: 'Number of retry attempts for failed requests'
      },
      showNotifications: {
        type: 'boolean',
        default: true,
        description: 'Show notification messages'
      },
      notificationDuration: {
        type: 'number',
        default: 4,
        min: 1,
        max: 30,
        description: 'Notification display duration in seconds'
      },
      maxTokens: {
        type: 'number',
        default: 1000,
        min: 1,
        max: 8000,
        description: 'Maximum tokens to generate'
      },
      temperature: {
        type: 'number',
        default: 0.7,
        min: 0,
        max: 2,
        description: 'Temperature for text generation'
      }
    }
  },
  
  // Per-page configurations
  perPage: {
    type: 'object',
    default: {},
    description: 'Per-page configuration overrides',
    additionalProperties: {
      type: 'object',
      properties: {
        provider: { type: 'string' },
        model: { type: 'string' },
        promptTemplate: { type: 'string' },
        selectedTemplate: { type: 'string' },
        enabled: { type: 'boolean' }
      }
    }
  }
};

/**
 * Template schema definition
 */
const TEMPLATE_SCHEMA = {
  id: {
    type: 'string',
    required: true,
    description: 'Unique template identifier'
  },
  
  name: {
    type: 'string',
    required: true,
    maxLength: 100,
    description: 'Template display name'
  },

  description: {
    type: 'string',
    default: '',
    maxLength: 500,
    description: 'Template description'
  },

  template: {
    type: 'string',
    required: true,
    maxLength: 10000,
    description: 'Template content with placeholders'
  },

  category: {
    type: 'string',
    default: 'general',
    enum: ['general', 'writing', 'coding', 'business', 'academic', 'creative', 'technical'],
    description: 'Template category'
  },
  
  tags: {
    type: 'array',
    default: [],
    items: { type: 'string' },
    description: 'Template tags for organization'
  },
  
  version: {
    type: 'string',
    default: '1.0.0',
    pattern: '^\\d+\\.\\d+\\.\\d+$',
    description: 'Template version (semantic versioning)'
  },
  
  author: {
    type: 'string',
    default: '',
    description: 'Template author'
  },
  
  createdAt: {
    type: 'string',
    format: 'date-time',
    description: 'Template creation timestamp'
  },
  
  updatedAt: {
    type: 'string',
    format: 'date-time',
    description: 'Template last update timestamp'
  },
  
  isBuiltIn: {
    type: 'boolean',
    default: false,
    description: 'Whether this is a built-in template'
  },
  
  isActive: {
    type: 'boolean',
    default: true,
    description: 'Whether the template is active'
  },
  
  variables: {
    type: 'array',
    default: [],
    items: {
      type: 'object',
      properties: {
        name: { type: 'string', required: true },
        type: { type: 'string', enum: ['text', 'number', 'boolean', 'select'] },
        description: { type: 'string' },
        default: { type: 'string' },
        options: { type: 'array', items: { type: 'string' } }
      }
    },
    description: 'Template variable definitions'
  }
};

/**
 * Gets the default configuration object
 * 
 * @returns {Object} Default configuration
 */
function getDefaultConfig() {
  const config = {};
  
  function extractDefaults(schema, target = config) {
    for (const [key, definition] of Object.entries(schema)) {
      if (definition.type === 'object' && definition.properties) {
        target[key] = {};
        extractDefaults(definition.properties, target[key]);
      } else if (Object.prototype.hasOwnProperty.call(definition, 'default')) {
        target[key] = definition.default;
      }
    }
  }
  
  extractDefaults(CONFIG_SCHEMA);
  return config;
}

/**
 * Gets the default template object
 * 
 * @returns {Object} Default template
 */
function getDefaultTemplate() {
  const template = {};
  
  for (const [key, definition] of Object.entries(TEMPLATE_SCHEMA)) {
    if (Object.prototype.hasOwnProperty.call(definition, 'default')) {
      template[key] = definition.default;
    }
  }
  
  return template;
}

// Export functions and schemas
if (typeof module !== 'undefined' && module.exports) {
  // Node.js/CommonJS environment
  module.exports = {
    CONFIG_SCHEMA,
    TEMPLATE_SCHEMA,
    getDefaultConfig,
    getDefaultTemplate
  };
} else {
  // Browser environment - make functions globally available
  window.CONFIG_SCHEMA = CONFIG_SCHEMA;
  window.TEMPLATE_SCHEMA = TEMPLATE_SCHEMA;
  window.getDefaultConfig = getDefaultConfig;
  window.getDefaultTemplate = getDefaultTemplate;
}
