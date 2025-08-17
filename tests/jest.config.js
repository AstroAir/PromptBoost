/**
 * Jest configuration for PromptBoost v2.0 tests
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

module.exports = {
  // Test environment
  testEnvironment: 'jsdom',

  // Test file patterns
  testMatch: [
    '<rootDir>/tests/**/*.test.js',
    '<rootDir>/tests/**/*.spec.js'
  ],

  // Setup files
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup.js'
  ],

  // Module paths
  moduleDirectories: [
    'node_modules',
    '<rootDir>'
  ],

  // Coverage configuration
  collectCoverage: true,
  coverageDirectory: '<rootDir>/tests/coverage',
  coverageReporters: [
    'text',
    'lcov',
    'html',
    'json'
  ],

  // Files to collect coverage from
  collectCoverageFrom: [
    'utils/**/*.js',
    'services/**/*.js',
    'providers/**/*.js',
    'templates/**/*.js',
    'background.js',
    'options/options.js',
    '!**/*.test.js',
    '!**/*.spec.js',
    '!**/node_modules/**',
    '!tests/**'
  ],

  // Coverage thresholds
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    },
    './utils/': {
      branches: 90,
      functions: 90,
      lines: 90,
      statements: 90
    },
    './services/': {
      branches: 85,
      functions: 85,
      lines: 85,
      statements: 85
    }
  },

  // Transform configuration
  transform: {
    '^.+\\.js$': 'babel-jest'
  },

  // Module name mapping
  moduleNameMapping: {
    '^@/(.*)$': '<rootDir>/$1',
    '^@utils/(.*)$': '<rootDir>/utils/$1',
    '^@services/(.*)$': '<rootDir>/services/$1',
    '^@providers/(.*)$': '<rootDir>/providers/$1',
    '^@templates/(.*)$': '<rootDir>/templates/$1'
  },

  // Global variables
  globals: {
    'chrome': {},
    'browser': {}
  },

  // Test timeout
  testTimeout: 10000,

  // Verbose output
  verbose: true,

  // Clear mocks between tests
  clearMocks: true,

  // Restore mocks after each test
  restoreMocks: true,

  // Error handling
  errorOnDeprecated: true,

  // Test result processor
  testResultsProcessor: '<rootDir>/tests/processors/results-processor.js'
};
