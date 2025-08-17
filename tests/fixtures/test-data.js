/**
 * Test Data Fixtures
 * Common test data used across PromptBoost tests
 */

/**
 * Sample text data for testing
 */
export const sampleTexts = {
  short: 'This is a short text.',
  medium: 'This is a medium length text that could be improved with AI optimization. It contains multiple sentences and provides a good test case for the extension functionality.',
  long: 'This is a very long text that exceeds the typical length of most user inputs. It contains multiple paragraphs and sentences, providing a comprehensive test case for the AI optimization functionality. The text includes various punctuation marks, different sentence structures, and complex vocabulary that will help test the robustness of the text processing algorithms. This type of content is commonly found in professional documents, academic papers, and detailed communications that users might want to optimize using the PromptBoost extension.',
  empty: '',
  whitespace: '   \n\t   ',
  special: 'Text with special characters: @#$%^&*()_+-=[]{}|;:,.<>?',
  unicode: 'Text with unicode: 🚀 ✨ 💡 Hello 世界 café naïve résumé',
  html: '<p>Text with <strong>HTML</strong> tags and <em>formatting</em></p>',
  code: 'function test() { return "code snippet"; }',
  maxLength: 'x'.repeat(10000) // Maximum allowed length
};

/**
 * Sample settings configurations
 */
export const sampleSettings = {
  default: {
    enabled: true,
    timeWindow: 1000,
    provider: 'openai',
    apiKey: 'test-api-key',
    apiEndpoint: 'https://api.openai.com/v1/chat/completions',
    model: 'gpt-3.5-turbo',
    promptTemplate: 'Please improve and optimize the following text while maintaining its original meaning and tone:\n\n{text}',
    keyboardShortcut: 'Ctrl+Shift+Space',
    selectedTemplate: 'general',
    quickTemplateSelection: true
  },

  anthropic: {
    enabled: true,
    timeWindow: 1000,
    provider: 'anthropic',
    apiKey: 'test-anthropic-key',
    model: 'claude-3-sonnet-20240229',
    promptTemplate: 'Improve this text: {text}'
  },

  custom: {
    enabled: true,
    timeWindow: 1500,
    provider: 'custom',
    apiKey: 'custom-api-key',
    apiEndpoint: 'https://custom-api.example.com/v1/chat',
    model: 'custom-model',
    promptTemplate: 'Optimize: {text}'
  },

  disabled: {
    enabled: false,
    timeWindow: 1000,
    provider: 'openai',
    apiKey: '',
    model: 'gpt-3.5-turbo'
  }
};

/**
 * Sample template data
 */
export const sampleTemplates = {
  general: {
    id: 'general',
    name: 'General Improvement',
    description: 'Enhance text while maintaining tone',
    template: 'Please improve and optimize the following text while maintaining its original meaning and tone:\n\n{text}',
    category: 'General',
    isDefault: true
  },

  professional: {
    id: 'professional',
    name: 'Professional Tone',
    description: 'Make text more formal and business-appropriate',
    template: 'Please rewrite the following text to make it more professional and business-appropriate:\n\n{text}',
    category: 'Business'
  },

  casual: {
    id: 'casual',
    name: 'Casual & Friendly',
    description: 'Make text more conversational',
    template: 'Please rewrite the following text to make it more casual and friendly:\n\n{text}',
    category: 'General'
  },

  concise: {
    id: 'concise',
    name: 'Make Concise',
    description: 'Shorten text while keeping key information',
    template: 'Please make the following text more concise while preserving all key information:\n\n{text}',
    category: 'Editing'
  }
};

/**
 * Sample API responses
 */
export const sampleApiResponses = {
  openai: {
    success: {
      choices: [{
        message: {
          content: 'This is an improved and optimized version of your text.'
        }
      }]
    },
    error: {
      error: {
        message: 'Invalid API key',
        type: 'invalid_request_error'
      }
    }
  },

  anthropic: {
    success: {
      content: [{
        text: 'This is an enhanced version of your text with better clarity and flow.'
      }]
    },
    error: {
      error: {
        type: 'authentication_error',
        message: 'Invalid API key'
      }
    }
  },

  custom: {
    success: {
      response: 'Custom API optimized text response.'
    },
    error: {
      error: 'Custom API error message'
    }
  }
};

/**
 * Sample Chrome extension messages
 */
export const sampleMessages = {
  optimizeText: {
    type: 'OPTIMIZE_TEXT',
    text: sampleTexts.medium,
    settings: sampleSettings.default
  },

  optimizeWithTemplate: {
    type: 'OPTIMIZE_WITH_TEMPLATE',
    text: sampleTexts.short,
    templateId: 'professional',
    settings: sampleSettings.default
  },

  testApi: {
    type: 'TEST_API',
    settings: sampleSettings.default
  },

  optimizeResult: {
    type: 'OPTIMIZE_RESULT',
    data: {
      optimizedText: 'This is the optimized text result.',
      templateUsed: 'General Improvement'
    }
  },

  optimizationError: {
    type: 'OPTIMIZATION_ERROR',
    error: 'API request failed'
  }
};

/**
 * Sample DOM elements for testing
 */
export const sampleElements = {
  textInput: {
    tagName: 'input',
    type: 'text',
    value: sampleTexts.short
  },

  textarea: {
    tagName: 'textarea',
    value: sampleTexts.medium
  },

  contentEditable: {
    tagName: 'div',
    contentEditable: 'true',
    textContent: sampleTexts.short
  }
};

/**
 * Sample history entries
 */
export const sampleHistory = [
  {
    id: '1',
    originalText: sampleTexts.short,
    optimizedText: 'This is an improved short text.',
    templateUsed: 'General Improvement',
    timestamp: Date.now() - 3600000, // 1 hour ago
    url: 'https://example.com',
    domain: 'example.com'
  },
  {
    id: '2',
    originalText: sampleTexts.medium,
    optimizedText: 'This is an enhanced medium-length text with better clarity.',
    templateUsed: 'Professional Tone',
    timestamp: Date.now() - 7200000, // 2 hours ago
    url: 'https://test.com',
    domain: 'test.com'
  }
];

/**
 * Test utility functions
 */
export const testUtils = {
  /**
   * Create a deep copy of an object
   * @param {Object} obj - Object to copy
   * @returns {Object} Deep copy
   */
  deepCopy: (obj) => JSON.parse(JSON.stringify(obj)),

  /**
   * Generate random text of specified length
   * @param {number} length - Text length
   * @returns {string} Random text
   */
  generateRandomText: (length) => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';
    return Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  },

  /**
   * Create a mock timestamp
   * @param {number} offsetMs - Offset from current time in milliseconds
   * @returns {number} Timestamp
   */
  createTimestamp: (offsetMs = 0) => Date.now() + offsetMs
};
