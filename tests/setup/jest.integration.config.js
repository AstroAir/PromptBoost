/**
 * Jest configuration specifically for integration tests
 * Extends the base configuration with integration test specific settings
 */

const baseConfig = require('./jest.config.js');

module.exports = {
  ...baseConfig,

  // Only run integration tests
  testMatch: [
    '<rootDir>/tests/integration/**/*.test.js'
  ],

  // Integration test specific setup
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/test-setup.js',
    '<rootDir>/tests/setup/integration-test-setup.js'
  ],

  // Longer timeout for integration tests
  testTimeout: 30000,

  // Don't mock modules for integration tests
  automock: false,

  // Run tests serially for integration tests
  maxWorkers: 1,

  // Additional test environment options for integration tests
  testEnvironmentOptions: {
    url: 'http://localhost:3000'
  }
};
