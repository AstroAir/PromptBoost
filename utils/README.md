# Utils Directory

This directory contains shared utility modules that provide common functionality across the PromptBoost extension.

For detailed utility documentation, see:
- **[Utilities API Reference](../docs/api/utilities.md)** - Complete API documentation
- **[Development Guide](../docs/development/setup.md)** - Development information
- **[Architecture Overview](../docs/architecture/overview.md)** - System architecture details

## Modules

### ErrorHandler.js
Centralized error handling system that provides:
- Consistent error formatting and logging
- Error categorization and severity levels
- User-friendly error messages
- Error reporting and analytics

### Logger.js
Unified logging system that provides:
- Consistent log formatting
- Log level management (debug, info, warn, error)
- Performance logging
- Development vs production logging modes

### ConfigValidator.js
Configuration validation utilities that provide:
- API key validation
- Endpoint URL validation
- Model parameter validation
- Settings schema validation

### ApiHelper.js
Common API utilities that provide:
- HTTP request helpers
- Response parsing utilities
- Rate limiting helpers
- Authentication utilities

## Usage

Import utilities in your modules:

```javascript
// Import specific utilities
import { ErrorHandler } from '../utils/ErrorHandler.js';
import { Logger } from '../utils/Logger.js';
import { ConfigValidator } from '../utils/ConfigValidator.js';
import { ApiHelper } from '../utils/ApiHelper.js';

// Use in your code
const logger = new Logger('MyModule');
logger.info('Module initialized');

try {
  // Some operation
} catch (error) {
  ErrorHandler.handle(error, 'MyModule');
}
```

## Design Principles

- **Consistency**: All utilities follow the same patterns and conventions
- **Reusability**: Utilities are designed to be used across multiple modules
- **Testability**: All utilities are easily testable with clear interfaces
- **Performance**: Utilities are optimized for browser extension environment
- **Security**: Utilities handle sensitive data (API keys) securely
