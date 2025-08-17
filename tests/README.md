# PromptBoost Testing Suite

This directory contains comprehensive unit and integration tests for the PromptBoost v2.0 browser extension.

## Overview

The testing suite is built with Jest to provide thorough coverage of all extension functionality, including:

- **Unit Tests**: Test individual components and functions in isolation
- **Integration Tests**: Test service interactions and cross-component functionality
- **Provider Tests**: Test AI provider implementations and authentication
- **Service Tests**: Test centralized services (TemplateManager, ConfigurationManager)
- **Chrome API Mocking**: Comprehensive mocks for Chrome extension APIs
- **Template Testing**: Automated template validation and quality assessment

## Directory Structure

```
tests/
├── unit/                    # Unit tests for individual components
│   ├── background.test.js   # Background script tests
│   ├── content.test.js      # Content script tests
│   ├── popup.test.js        # Popup component tests
│   └── options.test.js      # Options page tests
├── integration/             # End-to-end integration tests
│   └── extension-flow.test.js # Full extension workflow tests
├── mocks/                   # Mock implementations
│   ├── chrome-api.js        # Chrome extension API mocks
│   └── dom-helpers.js       # DOM testing utilities
├── fixtures/                # Test data and fixtures
│   └── test-data.js         # Sample data for tests
├── setup/                   # Test configuration
│   ├── jest.config.js       # Main Jest configuration
│   ├── jest.unit.config.js  # Unit test specific config
│   ├── jest.integration.config.js # Integration test config
│   ├── test-setup.js        # Global test setup
│   ├── unit-test-setup.js   # Unit test specific setup
│   └── integration-test-setup.js # Integration test setup
└── coverage/                # Coverage reports (generated)
```

## Running Tests

### Prerequisites

Install dependencies:
```bash
npm install
```

### Available Commands

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run only unit tests
npm run test:unit

# Run only integration tests
npm run test:integration

# Generate coverage report
npm run test:coverage
```

### Test Configuration

The test suite uses multiple Jest configurations:

- **jest.config.js**: Main configuration for all tests
- **jest.unit.config.js**: Optimized for fast unit testing
- **jest.integration.config.js**: Configured for browser automation

## Unit Tests

Unit tests focus on testing individual components in isolation with comprehensive mocking.

### Background Script Tests (`background.test.js`)

Tests for the `PromptBoostBackground` class:
- Message handling between components
- LLM API calls (OpenAI, Anthropic, Custom)
- Template management
- Error handling and retry logic
- Settings management

### Content Script Tests (`content.test.js`)

Tests for the `PromptBoostContent` class:
- Triple spacebar detection
- Text selection and replacement
- Undo functionality
- History management
- UI overlays and notifications
- DOM manipulation

### Popup Tests (`popup.test.js`)

Tests for the `PromptBoostPopup` class:
- Extension toggle functionality
- Status display and updates
- API connection testing
- Navigation to options and help pages
- Message handling

### Options Tests (`options.test.js`)

Tests for the `PromptBoostOptions` class:
- Settings management and persistence
- Provider configuration
- Template CRUD operations
- Import/export functionality
- Form validation and error handling

## Integration Tests

Integration tests use Puppeteer to test the extension in a real browser environment.

### Extension Flow Tests (`extension-flow.test.js`)

End-to-end tests covering:
- Extension loading and initialization
- Cross-component communication
- User interaction workflows
- Error handling scenarios
- Performance characteristics

## Mocks and Utilities

### Chrome API Mocks (`chrome-api.js`)

Comprehensive mocks for Chrome extension APIs:
- `chrome.storage` - Settings and data persistence
- `chrome.runtime` - Message passing and extension lifecycle
- `chrome.tabs` - Tab management and communication
- `chrome.scripting` - Content script injection
- `chrome.action` - Extension icon and badge management

### DOM Helpers (`dom-helpers.js`)

Utilities for DOM testing:
- Mock input elements with selection capabilities
- Text selection simulation
- Event creation and dispatching
- DOM manipulation helpers

### Test Data (`test-data.js`)

Sample data for consistent testing:
- Text samples of various lengths and types
- Settings configurations for different providers
- Template definitions
- API response examples
- History entries

## Coverage Requirements

The test suite maintains high coverage standards:

- **Branches**: 80% minimum
- **Functions**: 80% minimum
- **Lines**: 80% minimum
- **Statements**: 80% minimum

Coverage reports are generated in the `tests/coverage/` directory with multiple formats:
- HTML report for detailed analysis
- LCOV format for CI/CD integration
- JSON format for programmatic access

## Writing Tests

### Unit Test Guidelines

1. **Isolation**: Each test should be independent and not rely on other tests
2. **Mocking**: Mock all external dependencies (Chrome APIs, network calls)
3. **Descriptive Names**: Use clear, descriptive test names
4. **Arrange-Act-Assert**: Follow the AAA pattern for test structure
5. **Edge Cases**: Test both happy path and error conditions

### Integration Test Guidelines

1. **Real Browser**: Tests run in actual browser environment
2. **User Workflows**: Test complete user scenarios
3. **Cross-Component**: Verify communication between components
4. **Performance**: Include performance assertions where relevant
5. **Cleanup**: Ensure proper cleanup after each test

### Example Unit Test

```javascript
describe('PromptBoostBackground', () => {
  let background;

  beforeEach(() => {
    global.chromeTestUtils.resetMocks();
    background = new PromptBoostBackground();
  });

  test('should handle optimize text message', async () => {
    const message = { type: 'OPTIMIZE_TEXT', text: 'test text', settings: {} };
    const sender = { tab: { id: 1 } };

    await background.handleOptimizeText(message, sender);

    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
      1,
      expect.objectContaining({ type: 'OPTIMIZE_RESULT' })
    );
  });
});
```

### Example Integration Test

```javascript
test('should optimize text end-to-end', async () => {
  await global.integrationTestUtils.selectText('textarea', 'test text');
  await global.integrationTestUtils.tripleSpacebar();
  
  await global.integrationTestUtils.waitForElement('.notification.success');
  
  const optimizedText = await page.$eval('textarea', el => el.value);
  expect(optimizedText).not.toBe('test text');
});
```

## Debugging Tests

### Common Issues

1. **Chrome API Mocks**: Ensure mocks are properly reset between tests
2. **Async Operations**: Use proper async/await patterns
3. **DOM State**: Clean up DOM between tests
4. **Timing Issues**: Use appropriate waits in integration tests

### Debug Commands

```bash
# Run tests with verbose output
npm test -- --verbose

# Run specific test file
npm test -- background.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should handle"

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand
```

## Continuous Integration

The test suite is designed to run in CI/CD environments:

- All tests run in headless mode by default
- Coverage reports are generated in CI-friendly formats
- Integration tests can be disabled in environments without display
- Parallel test execution is supported for faster builds

## Contributing

When adding new features:

1. Write unit tests for new functions/methods
2. Add integration tests for new user workflows
3. Update test data fixtures as needed
4. Maintain coverage requirements
5. Follow existing test patterns and conventions

For more information about the PromptBoost extension, see the main [README.md](../README.md).
