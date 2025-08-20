/**
 * @fileoverview Centralized Constants for PromptBoost Extension
 * Contains all hard-coded values, API endpoints, timeouts, and configuration constants.
 *
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

/**
 * API endpoints and URLs
 */
const API_ENDPOINTS = {
  OPENAI: 'https://api.openai.com/v1/chat/completions',
  ANTHROPIC: 'https://api.anthropic.com/v1/messages',
  GOOGLE: 'https://generativelanguage.googleapis.com/v1beta/models',
  COHERE: 'https://api.cohere.ai/v1/generate',
  HUGGINGFACE: 'https://api-inference.huggingface.co/models',
  OPENROUTER: 'https://openrouter.ai/api/v1/chat/completions',
  OPENROUTER_AUTH: 'https://openrouter.ai/auth'
};

/**
 * Default models for each provider
 */
const DEFAULT_MODELS = {
  OPENAI: 'gpt-3.5-turbo',
  ANTHROPIC: 'claude-3-sonnet-20240229',
  GOOGLE: 'gemini-pro',
  COHERE: 'command',
  HUGGINGFACE: 'microsoft/DialoGPT-medium',
  OPENROUTER: 'openai/gpt-3.5-turbo',
  LOCAL: 'local-model'
};

/**
 * Timeout and retry configurations
 */
const TIMEOUTS = {
  API_REQUEST: 30000,        // 30 seconds
  AUTHENTICATION: 60000,     // 60 seconds
  STORAGE_OPERATION: 5000,   // 5 seconds
  MESSAGE_RESPONSE: 10000    // 10 seconds
};

const RETRY_CONFIG = {
  MAX_ATTEMPTS: 3,
  INITIAL_DELAY: 1000,       // 1 second
  MAX_DELAY: 10000,          // 10 seconds
  BACKOFF_MULTIPLIER: 2
};

/**
 * Rate limiting configurations
 */
const RATE_LIMITS = {
  DEFAULT_REQUESTS_PER_MINUTE: 60,
  DEFAULT_TOKENS_PER_MINUTE: 10000,
  RESET_INTERVAL: 60000,     // 1 minute

  // Provider-specific limits
  OPENAI: {
    REQUESTS_PER_MINUTE: 60,
    TOKENS_PER_MINUTE: 10000
  },
  ANTHROPIC: {
    REQUESTS_PER_MINUTE: 50,
    TOKENS_PER_MINUTE: 8000
  },
  GOOGLE: {
    REQUESTS_PER_MINUTE: 60,
    TOKENS_PER_MINUTE: 12000
  }
};

/**
 * UI and interaction constants
 */
const UI_CONSTANTS = {
  SPACEBAR_TIME_WINDOW: 1000,        // 1 second
  NOTIFICATION_DURATION: 4000,       // 4 seconds
  POPUP_WIDTH: 400,
  POPUP_HEIGHT: 600,
  MAX_HISTORY_ITEMS: 100,
  AUTO_SAVE_DELAY: 2000              // 2 seconds
};

/**
 * Storage keys
 */
const STORAGE_KEYS = {
  SETTINGS: 'settings',
  TEMPLATES: 'templates',
  PER_PAGE_SETTINGS: 'perPageSettings',
  CONFIG_VERSION: 'configVersion',
  OPTIMIZATION_HISTORY: 'optimizationHistory',
  PROVIDER_CACHE: 'providerCache',
  OAUTH_STATE: 'oauthState'
};

/**
 * Message types for extension communication
 */
const MESSAGE_TYPES = {
  // Content script to background
  OPTIMIZE_TEXT: 'OPTIMIZE_TEXT',
  OPTIMIZE_WITH_TEMPLATE: 'OPTIMIZE_WITH_TEMPLATE',
  GET_SETTINGS: 'GET_SETTINGS',
  GET_TEMPLATES: 'GET_TEMPLATES',
  TEST_API: 'TEST_API',
  
  // Background to content script
  OPTIMIZE_RESULT: 'OPTIMIZE_RESULT',
  OPTIMIZATION_ERROR: 'OPTIMIZATION_ERROR',
  SETTINGS_LOADED: 'SETTINGS_LOADED',
  TEMPLATES_LOADED: 'TEMPLATES_LOADED',
  
  // UI communication
  SAVE_SETTINGS: 'SAVE_SETTINGS',
  SAVE_TEMPLATE: 'SAVE_TEMPLATE',
  DELETE_TEMPLATE: 'DELETE_TEMPLATE',
  IMPORT_TEMPLATES: 'IMPORT_TEMPLATES',
  EXPORT_TEMPLATES: 'EXPORT_TEMPLATES',
  
  // Provider system
  PROVIDER_AUTH: 'PROVIDER_AUTH',
  PROVIDER_TEST: 'PROVIDER_TEST',
  PROVIDER_STATUS: 'PROVIDER_STATUS'
};

/**
 * Error categories and codes
 */
const ERROR_CATEGORIES = {
  AUTHENTICATION: 'AUTHENTICATION',
  API: 'API',
  CONFIGURATION: 'CONFIGURATION',
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  STORAGE: 'STORAGE',
  TEMPLATE: 'TEMPLATE',
  PROVIDER: 'PROVIDER'
};

const ERROR_CODES = {
  // Authentication errors
  INVALID_API_KEY: 'INVALID_API_KEY',
  OAUTH_FAILED: 'OAUTH_FAILED',
  TOKEN_EXPIRED: 'TOKEN_EXPIRED',

  // API errors
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  QUOTA_EXCEEDED: 'QUOTA_EXCEEDED',
  SERVER_ERROR: 'SERVER_ERROR',
  INVALID_REQUEST: 'INVALID_REQUEST',

  // Configuration errors
  INVALID_CONFIG: 'INVALID_CONFIG',
  MISSING_REQUIRED_FIELD: 'MISSING_REQUIRED_FIELD',
  INVALID_PROVIDER: 'INVALID_PROVIDER',

  // Network errors
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
  CONNECTION_FAILED: 'CONNECTION_FAILED'
};

/**
 * Validation constraints
 */
const VALIDATION_CONSTRAINTS = {
  API_KEY_MIN_LENGTH: 10,
  API_KEY_MAX_LENGTH: 200,
  TEMPLATE_NAME_MAX_LENGTH: 100,
  TEMPLATE_DESCRIPTION_MAX_LENGTH: 500,
  PROMPT_MAX_LENGTH: 10000,
  MAX_TOKENS_MIN: 1,
  MAX_TOKENS_MAX: 8000,
  TEMPERATURE_MIN: 0,
  TEMPERATURE_MAX: 2,
  TIME_WINDOW_MIN: 100,
  TIME_WINDOW_MAX: 5000
};

/**
 * Feature flags
 */
const FEATURES = {
  OAUTH_AUTHENTICATION: true,
  TEMPLATE_VERSIONING: true,
  TEMPLATE_TESTING: true,
  PER_PAGE_CONFIGURATION: true,
  OPTIMIZATION_HISTORY: true,
  PROVIDER_HEALTH_MONITORING: true,
  ADVANCED_LOGGING: false,
  BETA_FEATURES: false
};

/**
 * Provider categories
 */
const PROVIDER_CATEGORIES = {
  CLOUD: 'cloud',
  LOCAL: 'local',
  HYBRID: 'hybrid'
};

/**
 * Supported features by providers
 */
const PROVIDER_FEATURES = {
  CHAT_COMPLETION: 'chat_completion',
  STREAMING: 'streaming',
  FUNCTION_CALLING: 'function_calling',
  VISION: 'vision',
  EMBEDDINGS: 'embeddings',
  FINE_TUNING: 'fine_tuning'
};

/**
 * Configuration version for migration
 */
const CONFIG_VERSION = 2;

/**
 * Default keyboard shortcuts
 */
const KEYBOARD_SHORTCUTS = {
  OPTIMIZE_TEXT: 'Ctrl+Shift+Space',
  QUICK_TEMPLATE: 'Ctrl+Shift+T',
  UNDO_OPTIMIZATION: 'Ctrl+Shift+Z'
};

/**
 * Template categories
 */
const TEMPLATE_CATEGORIES = {
  GENERAL: 'general',
  WRITING: 'writing',
  CODING: 'coding',
  BUSINESS: 'business',
  ACADEMIC: 'academic',
  CREATIVE: 'creative',
  TECHNICAL: 'technical'
};

// Export all constants
if (typeof module !== 'undefined' && module.exports) {
  // Node.js/CommonJS environment
  module.exports = {
    API_ENDPOINTS,
    DEFAULT_MODELS,
    TIMEOUTS,
    RETRY_CONFIG,
    RATE_LIMITS,
    UI_CONSTANTS,
    STORAGE_KEYS,
    MESSAGE_TYPES,
    ERROR_CATEGORIES,
    ERROR_CODES,
    VALIDATION_CONSTRAINTS,
    FEATURES,
    PROVIDER_CATEGORIES,
    PROVIDER_FEATURES,
    CONFIG_VERSION,
    KEYBOARD_SHORTCUTS,
    TEMPLATE_CATEGORIES
  };
} else {
  // Browser environment - make constants globally available
  window.API_ENDPOINTS = API_ENDPOINTS;
  window.DEFAULT_MODELS = DEFAULT_MODELS;
  window.TIMEOUTS = TIMEOUTS;
  window.RETRY_CONFIG = RETRY_CONFIG;
  window.RATE_LIMITS = RATE_LIMITS;
  window.UI_CONSTANTS = UI_CONSTANTS;
  window.STORAGE_KEYS = STORAGE_KEYS;
  window.MESSAGE_TYPES = MESSAGE_TYPES;
  window.ERROR_CATEGORIES = ERROR_CATEGORIES;
  window.ERROR_CODES = ERROR_CODES;
  window.VALIDATION_CONSTRAINTS = VALIDATION_CONSTRAINTS;
  window.FEATURES = FEATURES;
  window.PROVIDER_CATEGORIES = PROVIDER_CATEGORIES;
  window.PROVIDER_FEATURES = PROVIDER_FEATURES;
  window.CONFIG_VERSION = CONFIG_VERSION;
  window.KEYBOARD_SHORTCUTS = KEYBOARD_SHORTCUTS;
  window.TEMPLATE_CATEGORIES = TEMPLATE_CATEGORIES;
}
