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
- **Jest**: Primary testing framework
- **Puppeteer**: Browser automation for integration tests
- **Chrome API Mocks**: Comprehensive Chrome extension API mocking
- **JSDOM**: DOM environment for unit tests

## Unit Testing

### Background Script Tests
Tests for `PromptBoostBackground` class:

```javascript
describe('PromptBoostBackground', () => {
  test('should handle optimize text message', async () => {
    const message = { type: 'OPTIMIZE_TEXT', text: 'test', settings: {} };
    await background.handleOptimizeText(message, mockSender);
    
    expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
      mockSender.tab.id,
      expect.objectContaining({ type: 'OPTIMIZE_RESULT' })
    );
  });
});
```

**Coverage Areas:**
- Message handling between components
- LLM API calls (OpenAI, Anthropic, Custom)
- Template management operations
- Error handling and retry logic
- Settings persistence

### Content Script Tests
Tests for `PromptBoostContent` class:

```javascript
describe('PromptBoostContent', () => {
  test('should detect triple spacebar press', () => {
    const triggerSpy = jest.spyOn(content, 'triggerOptimization');
    
    // Simulate three spacebar presses
    content.handleKeyDown(spacebarEvent);
    content.handleKeyDown(spacebarEvent);
    content.handleKeyDown(spacebarEvent);
    
    expect(triggerSpy).toHaveBeenCalled();
  });
});
```

**Coverage Areas:**
- Triple spacebar detection logic
- Text selection and replacement
- Undo functionality
- History management
- UI overlay interactions

### Popup Tests
Tests for `PromptBoostPopup` class:

```javascript
describe('PromptBoostPopup', () => {
  test('should toggle extension state', async () => {
    popup.elements.extensionToggle.checked = true;
    await popup.toggleExtension();
    
    expect(chrome.storage.sync.set).toHaveBeenCalledWith({ enabled: true });
  });
});
```

**Coverage Areas:**
- Extension toggle functionality
- Settings synchronization
- API connection testing
- UI state management

### Options Tests
Tests for `PromptBoostOptions` class:

```javascript
describe('PromptBoostOptions', () => {
  test('should save settings successfully', async () => {
    options.elements.provider.value = 'anthropic';
    await options.saveSettings();
    
    expect(chrome.storage.sync.set).toHaveBeenCalledWith(
      expect.objectContaining({ provider: 'anthropic' })
    );
  });
});
```

**Coverage Areas:**
- Settings management and validation
- Template CRUD operations
- Import/export functionality
- Form validation and error handling

## Integration Testing

### Browser Automation
Integration tests use Puppeteer to test the extension in a real browser environment:

```javascript
describe('Extension Integration', () => {
  test('should optimize text end-to-end', async () => {
    await page.goto('file://test.html');
    await selectText('textarea', 'test text');
    await tripleSpacebar();
    
    await waitForElement('.notification.success');
    const optimizedText = await page.$eval('textarea', el => el.value);
    expect(optimizedText).not.toBe('test text');
  });
});
```

**Test Scenarios:**
- Extension loading and initialization
- Cross-component message passing
- User interaction workflows
- Error handling in real browser environment
- Performance under realistic conditions

### Setup Requirements
Integration tests require:
- Chrome or Chromium browser
- Extension loaded in developer mode
- Test HTML page for text manipulation
- Network access for API testing (optional)

## Manual Testing

### Test Page Usage
The included `test.html` provides manual testing scenarios:

1. **Load Test Page**
   ```bash
   # Open in browser
   open test.html
   # or
   python -m http.server 8000
   ```

2. **Test Scenarios**
   - Text input field optimization
   - Textarea content optimization
   - Content-editable div handling
   - Regular text selection on page
   - Error conditions (no API key, no text selected)

### Manual Test Checklist
- [ ] Extension loads without errors
- [ ] Triple spacebar detection works
- [ ] Keyboard shortcuts function correctly
- [ ] Text replacement works in all supported elements
- [ ] Undo functionality operates properly
- [ ] Loading indicators appear and disappear
- [ ] Error messages display appropriately
- [ ] Settings persist across browser sessions
- [ ] Templates can be created, edited, and deleted
- [ ] API connections work for all providers

## Test Data and Mocks

### Chrome API Mocks
Comprehensive mocking of Chrome extension APIs:

```javascript
// Storage API mock
chrome.storage.sync.get.mockResolvedValue({
  enabled: true,
  provider: 'openai',
  apiKey: 'test-key'
});

// Runtime message mock
chrome.runtime.sendMessage.mockResolvedValue({ success: true });
```

### Test Fixtures
Reusable test data in `tests/fixtures/test-data.js`:
- Sample text of various lengths
- Settings configurations for different providers
- Template definitions
- API response examples
- History entries

### DOM Helpers
Utilities for DOM testing:
- Mock input elements with selection capabilities
- Text selection simulation
- Event creation and dispatching
- DOM manipulation helpers

## Coverage Requirements

### Minimum Coverage Thresholds
- **Branches**: 80%
- **Functions**: 80%
- **Lines**: 80%
- **Statements**: 80%

### Coverage Reports
Generated in multiple formats:
- **HTML**: Detailed interactive report (`tests/coverage/lcov-report/index.html`)
- **LCOV**: CI/CD integration format
- **JSON**: Programmatic access
- **Text**: Console summary

### Viewing Coverage
```bash
# Generate and view coverage report
npm run test:coverage
open tests/coverage/lcov-report/index.html
```

## Performance Testing

### Metrics to Monitor
- Extension startup time
- Text processing latency
- Memory usage during operation
- API response times
- UI responsiveness

### Performance Test Examples
```javascript
test('should process text within acceptable time', async () => {
  const startTime = Date.now();
  await optimizeText('sample text');
  const duration = Date.now() - startTime;
  
  expect(duration).toBeLessThan(5000); // 5 second timeout
});
```

## Debugging Tests

### Common Issues and Solutions

**Chrome API Mocks Not Working**
```javascript
// Ensure mocks are reset between tests
beforeEach(() => {
  global.chromeTestUtils.resetMocks();
});
```

**Async Test Failures**
```javascript
// Use proper async/await patterns
test('async operation', async () => {
  await expect(asyncFunction()).resolves.toBe(expectedValue);
});
```

**DOM State Issues**
```javascript
// Clean up DOM between tests
beforeEach(() => {
  document.body.innerHTML = '';
});
```

### Debug Commands
```bash
# Run specific test file
npm test -- background.test.js

# Run tests matching pattern
npm test -- --testNamePattern="should handle"

# Debug with Node inspector
node --inspect-brk node_modules/.bin/jest --runInBand

# Verbose output
npm test -- --verbose
```

## Continuous Integration

### GitHub Actions
The project includes CI configuration for:
- Running all tests on pull requests
- Generating coverage reports
- Linting code quality
- Testing across multiple Node.js versions

### Local CI Simulation
```bash
# Run full CI test suite locally
npm run ci

# Check code quality
npm run lint
npm run test:coverage
```

## Writing New Tests

### Unit Test Guidelines
1. **Test Structure**: Use Arrange-Act-Assert pattern
2. **Descriptive Names**: Use clear, specific test names
3. **Isolation**: Each test should be independent
4. **Mocking**: Mock all external dependencies
5. **Edge Cases**: Test both success and failure scenarios

### Integration Test Guidelines
1. **Real Environment**: Test in actual browser context
2. **User Workflows**: Focus on complete user scenarios
3. **Cross-Component**: Verify component communication
4. **Performance**: Include timing assertions where relevant
5. **Cleanup**: Ensure proper test cleanup

### Test Naming Convention
```javascript
// Good test names
test('should optimize text with OpenAI provider')
test('should handle API timeout gracefully')
test('should preserve text formatting during optimization')

// Poor test names
test('test optimization')
test('API test')
test('it works')
```

## Best Practices

### Test Organization
- Group related tests in describe blocks
- Use consistent test structure across files
- Keep test files focused on single components
- Use helper functions for common operations

### Mock Management
- Reset mocks between tests
- Use realistic mock data
- Mock at appropriate abstraction levels
- Verify mock interactions when relevant

### Assertion Quality
- Use specific assertions over generic ones
- Test behavior, not implementation details
- Include meaningful error messages
- Verify both positive and negative cases

For more information about the PromptBoost extension, see the main [README.md](README.md).
