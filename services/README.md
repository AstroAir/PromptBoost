# Services Directory

This directory contains centralized service modules that manage core functionality of the PromptBoost extension.

For detailed service documentation, see:
- **[Services API Reference](../docs/api/services.md)** - Complete API documentation
- **[Architecture Overview](../docs/architecture/overview.md)** - System architecture details
- **[Development Guide](../docs/development/setup.md)** - Development information

## Services

### TemplateManager.js
Centralized template management service that provides:
- Template CRUD operations (Create, Read, Update, Delete)
- Template versioning and history tracking
- Template validation and testing
- Template import/export functionality
- Template categorization and search
- Template performance metrics

### ConfigurationManager.js
Centralized configuration management service that provides:
- Settings storage and retrieval
- Per-page configuration support
- Configuration validation and migration
- Default settings management
- Configuration backup and restore
- Settings synchronization across extension components

## Architecture

Services follow a consistent pattern:
- **Singleton Pattern**: Each service is a singleton to ensure consistent state
- **Event-Driven**: Services emit events for state changes
- **Async/Await**: All operations are asynchronous for better performance
- **Error Handling**: Comprehensive error handling with the ErrorHandler utility
- **Logging**: Detailed logging with the Logger utility

## Usage

Import and use services in your modules:

```javascript
// Import services
import { TemplateManager } from '../services/TemplateManager.js';
import { ConfigurationManager } from '../services/ConfigurationManager.js';

// Get service instances
const templateManager = TemplateManager.getInstance();
const configManager = ConfigurationManager.getInstance();

// Use service methods
const templates = await templateManager.getAllTemplates();
const settings = await configManager.getSettings();
```

## Service Communication

Services communicate through:
- **Direct method calls**: For synchronous operations
- **Events**: For asynchronous notifications
- **Shared storage**: For persistent data
- **Message passing**: For cross-component communication

## Design Principles

- **Single Responsibility**: Each service has a clear, focused purpose
- **Dependency Injection**: Services can be easily tested and mocked
- **Backward Compatibility**: Services maintain compatibility with existing code
- **Performance**: Services are optimized for browser extension environment
- **Security**: Services handle sensitive data securely
