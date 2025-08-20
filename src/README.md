# PromptBoost Source Code

This directory contains all the source code for the PromptBoost browser extension, organized into logical modules for better maintainability and development experience.

## Directory Structure

### `/core`
Contains the main extension entry points and core functionality:
- `background.js` - Service worker handling API calls and message routing
- `content.js` - Content script for user interaction and text manipulation
- `content.css` - Styles for content script UI elements

### `/ui`
User interface components organized by context:
- `/popup` - Extension popup interface (quick settings and status)
- `/options` - Comprehensive settings and configuration page

### `/services`
Business logic services following singleton pattern:
- `ConfigurationManager.js` - Centralized settings management
- `TemplateManager.js` - Template CRUD operations and management

### `/providers`
AI provider system with modular architecture:
- `/base` - Abstract base classes and registry
- Provider-specific implementations (OpenAI, Anthropic, etc.)

### `/templates`
Template system components:
- Template validation, versioning, and testing
- Template editor and management utilities

### `/utils`
Shared utility functions and helpers:
- Error handling, logging, validation, and API helpers

### `/lib`
Third-party integrations and libraries:
- CodeMirror integration for template editing

## Architecture Principles

1. **Separation of Concerns**: Each directory has a specific responsibility
2. **Modular Design**: Components are loosely coupled and highly cohesive
3. **Dependency Injection**: Services use singleton pattern with proper initialization
4. **Event-Driven**: Components communicate through events and message passing
5. **Error Handling**: Centralized error management with user-friendly messaging

## Development Guidelines

- Follow the established directory structure when adding new files
- Use relative imports within the same module, absolute imports across modules
- Maintain README files in each directory explaining their purpose
- Add comprehensive tests for new functionality
- Follow the existing coding patterns and conventions
