# PromptBoost Testing Guide

This document provides comprehensive information about testing the PromptBoost browser extension, including setup, execution, and best practices.

## Overview

PromptBoost uses a multi-layered testing approach:

- **Unit Tests**: Test individual components in isolation
- **Integration Tests**: Test end-to-end functionality with browser automation
- **Manual Tests**: Human verification of user workflows
- **Performance Tests**: Validate extension performance characteristics

## Quick Start

### Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Run in watch mode for development
npm run test:watch
```

### Test Types

```bash
# Unit tests only (fast)
npm run test:unit

# Integration tests only (slower, requires browser)
npm run test:integration

# Lint code
npm run lint
```

## Test Structure

### Directory Organization

```
tests/
├── unit/                    # Unit tests
│   ├── background.test.js   # Background script tests
│   ├── content.test.js      # Content script tests
│   ├── popup.test.js        # Popup component tests
│   └── options.test.js      # Options page tests
├── integration/             # Integration tests
│   └── extension-flow.test.js # End-to-end workflow tests
├── mocks/                   # Mock implementations
├── fixtures/                # Test data
└── setup/                   # Test configuration
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

- Extension installation and initialization
- Complete text optimization workflow
- Template selection and usage
- Settings configuration
- Error handling scenarios

### Browser Automation

```javascript
// Example integration test
describe('Text Optimization Flow', () => {
  let browser, page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      args: ['--load-extension=./']
    });
    page = await browser.newPage();
  });

  test('should optimize text with triple spacebar', async () => {
    await page.goto('http://localhost:3000/test.html');
    
    // Select text
    await page.evaluate(() => {
      const textarea = document.querySelector('textarea');
      textarea.select();
    });

    // Trigger optimization
    await page.keyboard.press('Space');
    await page.keyboard.press('Space');
    await page.keyboard.press('Space');

    // Wait for result
    await page.waitForSelector('.optimization-result');
    
    const result = await page.$eval('textarea', el => el.value);
    expect(result).toContain('optimized');
  });
});
```

## Mock System

### Chrome API Mocks (`chrome-api.js`)

Comprehensive mocks for Chrome extension APIs:

- `chrome.storage.sync` - Settings persistence
- `chrome.runtime.sendMessage` - Message passing
- `chrome.tabs.sendMessage` - Tab communication
- `chrome.runtime.onMessage` - Message listeners

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

1. **Real Environment**: Test in actual browser environment
2. **User Workflows**: Focus on complete user journeys
3. **Cross-Browser**: Test on multiple browsers when possible
4. **Performance**: Monitor test execution time
5. **Cleanup**: Properly clean up browser instances

### Test Examples

#### Unit Test Example

```javascript
describe('PromptBoostBackground', () => {
  let background;

  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    background = new PromptBoostBackground();
  });

  test('should handle optimize text message', async () => {
    const message = {
      type: 'OPTIMIZE_TEXT',
      text: 'Hello world',
      settings: { provider: 'openai' }
    };
    const sender = { tab: { id: 123 } };

    await background.handleOptimizeText(message, sender);

    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
      123,
      expect.objectContaining({
        type: 'OPTIMIZE_RESULT'
      })
    );
  });
});
```

#### Integration Test Example

```javascript
describe('Extension Integration', () => {
  test('should complete full optimization workflow', async () => {
    // Load test page
    await page.goto('http://localhost:3000/test.html');
    
    // Configure extension
    await page.evaluate(() => {
      chrome.storage.sync.set({
        enabled: true,
        provider: 'openai',
        apiKey: 'test-key'
      });
    });

    // Perform optimization
    await page.type('textarea', 'test text');
    await page.keyboard.press('Space');
    await page.keyboard.press('Space');
    await page.keyboard.press('Space');

    // Verify result
    await page.waitForFunction(() => {
      return document.querySelector('textarea').value !== 'test text';
    });

    const optimizedText = await page.$eval('textarea', el => el.value);
    expect(optimizedText).not.toBe('test text');
  });
});
```

## Manual Testing

### Test Page (`test.html`)

Use the included test page for manual verification:

- Load `test.html` in browser
- Test various text inputs and scenarios
- Verify UI interactions and feedback
- Test error conditions

### Real-World Testing

Test on actual websites:

- Gmail, Google Docs, Twitter, etc.
- Various input types (textarea, contenteditable, etc.)
- Different text lengths and formats
- Edge cases and error conditions

## Performance Testing

### Metrics to Monitor

- Extension load time
- API response times
- Memory usage
- CPU utilization
- Network requests

### Performance Tests

```javascript
test('should optimize text within performance threshold', async () => {
  const startTime = performance.now();
  
  await background.handleOptimizeText(message, sender);
  
  const endTime = performance.now();
  const duration = endTime - startTime;
  
  expect(duration).toBeLessThan(5000); // 5 second threshold
});
```

## Continuous Integration

### GitHub Actions

The project uses GitHub Actions for automated testing:

- Run tests on multiple Node.js versions
- Test on different operating systems
- Generate and upload coverage reports
- Lint code and check formatting

### Pre-commit Hooks

Set up pre-commit hooks to ensure code quality:

```bash
# Install husky for git hooks
npm install --save-dev husky

# Add pre-commit hook
npx husky add .husky/pre-commit "npm test"
```

## Debugging Tests

### Common Issues

1. **Chrome API mocks not working**: Ensure mocks are properly imported
2. **Async test failures**: Use proper async/await or return promises
3. **DOM manipulation issues**: Ensure proper setup and cleanup
4. **Flaky integration tests**: Add proper waits and assertions

### Debugging Tools

```bash
# Run tests with debugging
npm test -- --verbose

# Run specific test file
npm test -- background.test.js

# Run tests in watch mode
npm run test:watch

# Debug with Node.js inspector
node --inspect-brk node_modules/.bin/jest
```

## Best Practices

### Test Organization

- Group related tests in describe blocks
- Use descriptive test names
- Keep tests focused and atomic
- Avoid test interdependencies

### Mock Management

- Reset mocks between tests
- Use specific mocks for specific scenarios
- Avoid over-mocking (test real behavior when possible)
- Document complex mock setups

### Assertion Quality

- Use specific assertions
- Test both positive and negative cases
- Verify side effects and state changes
- Use custom matchers when helpful

### Maintenance

- Update tests when code changes
- Remove obsolete tests
- Refactor test code for clarity
- Monitor test performance

For more information, see:

- [Development Setup](setup.md)
- [Contributing Guidelines](contributing.md)
- [Architecture Documentation](../architecture/overview.md)
