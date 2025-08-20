module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    webextensions: true,
    jest: true
  },
  extends: [
    'eslint:recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  globals: {
    // Chrome extension globals
    chrome: 'readonly',
    browser: 'readonly',
    importScripts: 'readonly',

    // Constants from Constants.js
    API_ENDPOINTS: 'readonly',
    DEFAULT_MODELS: 'readonly',
    TIMEOUTS: 'readonly',
    RETRY_CONFIG: 'readonly',
    RATE_LIMITS: 'readonly',
    UI_CONSTANTS: 'readonly',
    STORAGE_KEYS: 'readonly',
    MESSAGE_TYPES: 'readonly',
    ERROR_CATEGORIES: 'readonly',
    ERROR_CODES: 'readonly',
    VALIDATION_CONSTRAINTS: 'readonly',
    FEATURES: 'readonly',
    PROVIDER_CATEGORIES: 'readonly',
    PROVIDER_FEATURES: 'readonly',
    CONFIG_VERSION: 'readonly',
    KEYBOARD_SHORTCUTS: 'readonly',
    TEMPLATE_CATEGORIES: 'readonly',

    // Schema functions from ConfigSchema.js
    CONFIG_SCHEMA: 'readonly',
    TEMPLATE_SCHEMA: 'readonly',
    getDefaultConfig: 'readonly',
    getDefaultTemplate: 'readonly',

    // Core classes
    Logger: 'readonly',
    ErrorHandler: 'readonly',
    ApiHelper: 'readonly',
    ApplicationContext: 'readonly',
    EventBus: 'readonly',
    TemplateManager: 'readonly',
    ConfigurationManager: 'readonly',
    ProviderRegistry: 'readonly',
    TemplateVersioning: 'readonly',
    TemplateTester: 'readonly',
    TemplateValidator: 'readonly',
    ApiController: 'readonly',
    AuthenticationManager: 'readonly',
    LifecycleManager: 'readonly',
    MessageRouter: 'readonly',
    LogCollector: 'readonly',
    TemplateEditor: 'readonly',
    LogPanel: 'readonly',
    CodeMirror: 'readonly',

    // Provider classes
    Provider: 'readonly',
    OpenRouterProvider: 'readonly',

    // Additional globals
    ErrorCategory: 'readonly',
    providerRegistry: 'readonly',
    domTestUtils: 'readonly',

    // Test globals
    ConfigValidator: 'readonly',
    PromptBoostBackground: 'readonly',
    PromptBoostContent: 'readonly',
    PromptBoostOptions: 'readonly',
    PromptBoostPopup: 'readonly'
  },
  rules: {
    // Allow unused variables in test files for test parameters
    'no-unused-vars': ['error', {
      'argsIgnorePattern': '^_',
      'varsIgnorePattern': '^_|^(category|metadata|file|index|x|y|selectedText|sampleMessages|sampleTemplates|defaultTemplate|now)$'
    }]
  },
  overrides: [
    {
      files: ['tests/**/*.js', '**/*.test.js', '**/*.spec.js'],
      env: {
        jest: true
      },
      rules: {
        // More lenient rules for test files
        'no-unused-vars': ['error', {
          'argsIgnorePattern': '^_',
          'varsIgnorePattern': '^_|^(category|metadata|file|index|x|y|selectedText|sampleMessages|sampleTemplates|defaultTemplate|now)$'
        }]
      }
    }
  ]
};
