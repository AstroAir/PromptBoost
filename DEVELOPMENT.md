# PromptBoost Development Guide

This document provides comprehensive information for developers working on the PromptBoost browser extension.

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Development Setup](#development-setup)
- [Project Structure](#project-structure)
- [Core Components](#core-components)
- [Development Workflow](#development-workflow)
- [API Integration](#api-integration)
- [Testing Strategy](#testing-strategy)
- [Debugging Guide](#debugging-guide)
- [Performance Considerations](#performance-considerations)
- [Security Guidelines](#security-guidelines)

## Architecture Overview

PromptBoost follows the standard Chrome extension architecture with Manifest V3:

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Popup UI      │    │  Options Page   │    │  Content Script │
│   (popup.js)    │    │  (options.js)   │    │  (content.js)   │
└─────────┬───────┘    └─────────┬───────┘    └─────────┬───────┘
          │                      │                      │
          │              Message Passing                │
          │                      │                      │
          └──────────────────────┼──────────────────────┘
                                 │
                    ┌─────────────▼───────────┐
                    │   Background Script    │
                    │   (background.js)      │
                    │                        │
                    │ • API Calls            │
                    │ • Message Routing      │
                    │ • Settings Management  │
                    │ • Template System      │
                    └────────────────────────┘
```

### Key Principles
- **Separation of Concerns**: Each component has a specific responsibility
- **Message-Driven Communication**: Components communicate via Chrome's message passing API
- **Centralized API Management**: All LLM API calls handled by background script
- **Persistent Settings**: Configuration stored in Chrome's sync storage
- **Progressive Enhancement**: Graceful degradation when features are unavailable

## Development Setup

### Prerequisites
- Node.js 16+ and npm
- Chrome or Chromium-based browser
- Git for version control
- Code editor with JavaScript support (VS Code recommended)

### Initial Setup
```bash
# Clone repository
git clone https://github.com/your-repo/promptboost.git
cd promptboost

# Install development dependencies
npm install

# Load extension in Chrome
# 1. Open chrome://extensions/
# 2. Enable "Developer mode"
# 3. Click "Load unpacked"
# 4. Select the project directory
```

### Development Commands
```bash
# Run tests
npm test
npm run test:watch
npm run test:coverage

# Code quality
npm run lint
npm run lint:fix

# Development utilities
npm run dev:reload    # Reload extension in browser
npm run dev:logs      # View extension logs
```

## Project Structure

```
PromptBoost/
├── manifest.json              # Extension manifest (Manifest V3)
├── background.js              # Background service worker
├── content.js                 # Content script for web pages
├── content.css                # Styles for injected UI elements
├── test.html                  # Manual testing page
├── popup/                     # Extension popup
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── options/                   # Settings page
│   ├── options.html
│   ├── options.js
│   └── options.css
├── icons/                     # Extension icons
├── tests/                     # Test suite
│   ├── unit/                  # Unit tests
│   ├── integration/           # Integration tests
│   ├── mocks/                 # Mock implementations
│   ├── fixtures/              # Test data
│   └── setup/                 # Test configuration
├── docs/                      # Additional documentation
├── package.json               # Node.js dependencies and scripts
├── README.md                  # Main documentation
├── CONTRIBUTING.md            # Contribution guidelines
├── TESTING.md                 # Testing documentation
└── DEVELOPMENT.md             # This file
```

## Core Components

### Background Script (`background.js`)
**Purpose**: Service worker handling API calls and inter-component communication

**Key Responsibilities**:
- LLM API integration (OpenAI, Anthropic, Custom)
- Message routing between components
- Settings and template management
- Extension lifecycle management

**Main Classes**:
- `PromptBoostBackground`: Main controller class

**Key Methods**:
```javascript
handleOptimizeText(message, sender)      // Process optimization requests
handleOptimizeWithTemplate(message, sender) // Template-based optimization
callLLMAPI(text, settings)               // Generic API call handler
callOpenAI(prompt, apiKey, endpoint, model) // OpenAI-specific API calls
callAnthropic(prompt, apiKey, model)     // Anthropic-specific API calls
```

### Content Script (`content.js`)
**Purpose**: Handles user interactions and text manipulation on web pages

**Key Responsibilities**:
- Triple spacebar detection
- Text selection and replacement
- Undo functionality
- UI overlay management
- History tracking

**Main Classes**:
- `PromptBoostContent`: Main content script controller

**Key Methods**:
```javascript
handleKeyDown(event)                     // Keyboard event handling
recordSpacebarPress()                    // Spacebar detection logic
triggerOptimization(templateId)          // Initiate text optimization
replaceSelectedText(newText)             // Text replacement logic
showLoadingOverlay()                     // UI feedback
```

### Popup Interface (`popup/popup.js`)
**Purpose**: Quick access interface for extension control

**Key Responsibilities**:
- Extension enable/disable toggle
- Status display and updates
- Settings access
- API connection testing

**Main Classes**:
- `PromptBoostPopup`: Popup controller

### Options Page (`options/options.js`)
**Purpose**: Comprehensive settings and configuration interface

**Key Responsibilities**:
- Settings management and persistence
- Template CRUD operations
- Provider configuration
- Import/export functionality

**Main Classes**:
- `PromptBoostOptions`: Options page controller

## Development Workflow

### Feature Development Process
1. **Planning**: Create GitHub issue with detailed requirements
2. **Branch**: Create feature branch from main
3. **Development**: Implement feature with tests
4. **Testing**: Run unit and integration tests
5. **Documentation**: Update relevant documentation
6. **Review**: Submit pull request for code review
7. **Deployment**: Merge to main after approval

### Code Organization Patterns
```javascript
// Class-based organization
class ComponentName {
  constructor() {
    this.init();
  }
  
  async init() {
    await this.loadSettings();
    this.setupEventListeners();
    this.setupMessageListener();
  }
  
  // Private methods prefixed with underscore
  _privateMethod() {
    // Implementation
  }
  
  // Public API methods
  publicMethod() {
    // Implementation
  }
}
```

### Message Passing Patterns
```javascript
// Sending messages
chrome.runtime.sendMessage({
  type: 'MESSAGE_TYPE',
  data: { /* payload */ }
});

// Receiving messages
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'MESSAGE_TYPE':
      this.handleMessage(message.data);
      break;
  }
});
```

## API Integration

### Supported Providers
- **OpenAI**: GPT-3.5, GPT-4 models
- **Anthropic**: Claude models
- **OpenRouter**: Multiple model access
- **Custom**: User-defined API endpoints

### Adding New Providers
1. **Background Script**: Add provider case in `callLLMAPI()`
2. **API Method**: Implement provider-specific API call method
3. **Options UI**: Add provider to options page
4. **Validation**: Add API key and endpoint validation
5. **Tests**: Write comprehensive tests for new provider
6. **Documentation**: Update provider documentation

### API Call Pattern
```javascript
async callNewProvider(prompt, apiKey, model) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: model,
      messages: [{ role: 'user', content: prompt }]
    })
  });
  
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }
  
  const data = await response.json();
  return this.extractResponseText(data);
}
```

## Testing Strategy

### Test Pyramid
```
    ┌─────────────────┐
    │  Integration    │  ← End-to-end workflows
    │     Tests       │
    ├─────────────────┤
    │   Unit Tests    │  ← Component isolation
    │                 │
    └─────────────────┘
```

### Unit Testing Approach
- **Isolation**: Test components in isolation with mocks
- **Coverage**: Maintain 80%+ code coverage
- **Fast Execution**: Unit tests should run quickly
- **Deterministic**: Tests should produce consistent results

### Integration Testing Approach
- **Real Browser**: Test in actual Chrome environment
- **User Workflows**: Test complete user scenarios
- **Cross-Component**: Verify component communication
- **Performance**: Include timing and performance assertions

## Debugging Guide

### Chrome DevTools
```javascript
// Background script debugging
// Open chrome://extensions/ → PromptBoost → "service worker"

// Content script debugging
// Right-click page → Inspect → Console
// Content script logs appear in page console

// Popup debugging
// Right-click extension icon → Inspect popup
```

### Logging Patterns
```javascript
// Structured logging
console.log('[PromptBoost]', 'Component:', 'Action:', data);

// Error logging with context
console.error('[PromptBoost] Error in component:', error, { context });

// Debug logging (removable in production)
if (DEBUG) {
  console.debug('[PromptBoost] Debug info:', debugData);
}
```

### Common Issues and Solutions

**Extension Not Loading**
- Check manifest.json syntax
- Verify file permissions
- Check browser console for errors

**Message Passing Failures**
- Verify message listener setup
- Check sender/receiver component state
- Validate message format

**API Call Issues**
- Verify API key configuration
- Check network connectivity
- Validate request format
- Review API provider documentation

## Performance Considerations

### Optimization Strategies
- **Lazy Loading**: Load components only when needed
- **Debouncing**: Prevent excessive API calls
- **Caching**: Cache frequently used data
- **Memory Management**: Clean up event listeners and timers

### Performance Monitoring
```javascript
// Measure operation timing
const startTime = performance.now();
await performOperation();
const duration = performance.now() - startTime;
console.log(`Operation took ${duration}ms`);

// Memory usage monitoring
console.log('Memory usage:', performance.memory);
```

### Best Practices
- Minimize DOM manipulation in content scripts
- Use efficient event delegation
- Implement proper cleanup in component destructors
- Optimize API request batching where possible

## Security Guidelines

### Data Protection
- **API Keys**: Store securely in Chrome's encrypted storage
- **User Data**: Never log or transmit user text unnecessarily
- **HTTPS Only**: All API communications over HTTPS
- **Input Sanitization**: Sanitize all user inputs

### Chrome Extension Security
- **Content Security Policy**: Follow strict CSP guidelines
- **Permissions**: Request minimal necessary permissions
- **Cross-Origin**: Validate all cross-origin requests
- **Code Injection**: Prevent XSS and code injection attacks

### Security Checklist
- [ ] API keys stored in `chrome.storage.sync` (encrypted)
- [ ] No hardcoded credentials in source code
- [ ] All external requests use HTTPS
- [ ] User input properly sanitized
- [ ] CSP headers properly configured
- [ ] Minimal permission set in manifest

## Code Style and Standards

### JavaScript Standards
- ES6+ features preferred
- Async/await over Promises where possible
- Consistent naming conventions (camelCase)
- JSDoc comments for all public methods
- Error handling for all async operations

### File Organization
- One class per file where possible
- Logical grouping of related functions
- Clear separation of concerns
- Consistent file naming conventions

### Documentation Standards
- JSDoc for all public APIs
- Inline comments for complex logic
- README files for each major component
- Keep documentation up-to-date with code changes

For more information, see:
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [TESTING.md](TESTING.md) - Testing documentation
- [README.md](README.md) - User documentation
