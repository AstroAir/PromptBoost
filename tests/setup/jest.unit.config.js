/**
 * Jest configuration specifically for unit tests
 * Extends the base configuration with unit test specific settings
 */

const baseConfig = require('./jest.config.js');

module.exports = {
  ...baseConfig,
  
  // Only run unit tests
  testMatch: [
    '<rootDir>/tests/unit/**/*.test.js'
  ],
  
  // Unit test specific setup
  setupFilesAfterEnv: [
    '<rootDir>/tests/setup/test-setup.js',
    '<rootDir>/tests/setup/unit-test-setup.js'
  ],
  
  // Faster for unit tests
  testTimeout: 5000,
  
  // Mock all modules by default for unit tests
  automock: false,
  
  // Clear all mocks between tests
  clearMocks: true,
  
  // Reset module registry between tests
  resetModules: true
};
