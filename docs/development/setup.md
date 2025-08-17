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
- History management
- UI overlays and notifications

**Main Classes**:

- `PromptBoostContent`: Main content script controller

**Key Methods**:

```javascript
handleKeyDown(event)                     // Keyboard event handling
recordSpacebarPress()                    // Spacebar detection logic
optimizeText(templateId)                 // Text optimization trigger
replaceSelectedText(newText)             // Text replacement
showLoadingOverlay()                     # Loading UI management
```

### Popup Interface (`popup/popup.js`)

**Purpose**: Extension popup for quick access and status display

**Key Responsibilities**:

- Extension toggle functionality
- Status display and updates
- Quick settings access
- API connection testing

**Main Classes**:

- `PromptBoostPopup`: Popup controller

### Options Page (`options/options.js`)

**Purpose**: Comprehensive settings and configuration interface

**Key Responsibilities**:

- Settings management and persistence
- Provider configuration
- Template CRUD operations
- Import/export functionality
- Form validation and error handling

**Main Classes**:

- `PromptBoostOptions`: Options page controller

## Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/new-feature

# Make changes
# ... code changes ...

# Run tests
npm test

# Commit changes
git add .
git commit -m "feat: add new feature"

# Push and create PR
git push origin feature/new-feature
```

### 2. Testing Workflow

```bash
# Run unit tests during development
npm run test:watch

# Run full test suite before commit
npm test

# Check coverage
npm run test:coverage

# Manual testing
# Load extension in browser and test manually
```

### 3. Code Quality

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code (if using Prettier)
npm run format
```

## API Integration

### Adding New LLM Providers

1. **Create Provider Class**:

```javascript
// providers/newprovider/NewProvider.js
class NewProvider extends Provider {
  constructor(config) {
    super(config);
    this.name = 'newprovider';
  }

  async authenticate(credentials) {
    // Implement authentication
  }

  async callAPI(prompt, options) {
    // Implement API calling
  }
}
```

2. **Register Provider**:

```javascript
// In background.js
providerRegistry.register('newprovider', NewProvider);
```

3. **Update UI**:

- Add provider to options page dropdown
- Add configuration fields
- Update validation logic

### Provider Interface Requirements

All providers must implement:

- `authenticate(credentials)`: Authentication with API
- `callAPI(prompt, options)`: Text generation
- `validateConfig(config)`: Configuration validation
- `getDefaultModel()`: Default model selection
- `getAvailableModels()`: Available models list

## Testing Strategy

### Unit Testing

- **Framework**: Jest with Chrome extension mocks
- **Coverage**: Minimum 80% for all components
- **Scope**: Individual functions and classes in isolation

### Integration Testing

- **Framework**: Puppeteer for browser automation
- **Scope**: End-to-end user workflows
- **Environment**: Real browser with loaded extension

### Manual Testing

- **Test Page**: Use `test.html` for controlled testing
- **Real World**: Test on various websites
- **Edge Cases**: Test with different text types and lengths

## Debugging Guide

### Chrome DevTools

```javascript
// Background script debugging
chrome://extensions/ → PromptBoost → "service worker" link

// Content script debugging
F12 → Console (on any webpage)

// Popup debugging
Right-click extension icon → "Inspect popup"

// Options page debugging
Right-click on options page → "Inspect"
```

### Logging

```javascript
// Use built-in logger
const logger = new Logger('ComponentName');
logger.info('Debug message');
logger.error('Error occurred', error);

// Enable debug logging
chrome.storage.sync.set({ debugLogging: true });
```

### Common Issues

1. **Message passing failures**: Check sender/receiver setup
2. **API errors**: Verify API keys and endpoints
3. **Content script not loading**: Check manifest permissions
4. **Storage issues**: Verify Chrome storage permissions

## Performance Considerations

### Memory Management

- Use weak references for DOM elements
- Clean up event listeners on component destruction
- Implement proper garbage collection for large objects

### Network Optimization

- Batch API requests when possible
- Implement request caching for repeated calls
- Use connection pooling for multiple requests

### UI Responsiveness

- Use `requestAnimationFrame` for smooth animations
- Debounce user input to prevent excessive API calls
- Implement progressive loading for large datasets

## Security Guidelines

### API Key Protection

- Never log API keys or include them in error messages
- Store keys in Chrome's secure storage only
- Validate and sanitize all user inputs

### Content Security Policy

- Follow strict CSP guidelines
- Avoid inline scripts and styles
- Use nonce-based CSP where necessary

### Permission Management

- Request minimal necessary permissions
- Explain permission usage to users
- Regularly audit and remove unused permissions

### Data Handling

- Encrypt sensitive data before storage
- Implement proper input validation
- Use HTTPS for all external communications

## Code Style Guidelines

### JavaScript Standards

- Use ES6+ features consistently
- Follow JSDoc documentation standards
- Implement proper error handling
- Use async/await over Promises where possible

### File Organization

- Group related functionality in modules
- Use consistent naming conventions
- Keep files under 500 lines when possible
- Implement proper import/export patterns

### Documentation Standards

- JSDoc for all public APIs
- Inline comments for complex logic
- README files for each major component
- Keep documentation up-to-date with code changes

For more information, see:

- [CONTRIBUTING.md](contributing.md) - Contribution guidelines
- [TESTING.md](testing.md) - Testing documentation
- [README.md](../README.md) - User documentation
