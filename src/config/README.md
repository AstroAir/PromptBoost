# Configuration Directory

This directory contains centralized configuration management for the PromptBoost extension, providing a single source of truth for all configuration-related functionality.

## Files

### `Constants.js`
**Purpose**: Centralized constants and hard-coded values

**Contains**:
- API endpoints for all providers
- Default models and configurations
- Timeout and retry settings
- Rate limiting configurations
- UI constants and interaction settings
- Storage keys for Chrome storage
- Message types for extension communication
- Error categories and codes
- Validation constraints
- Feature flags
- Provider categories and features

### `ConfigSchema.js`
**Purpose**: Configuration schema definition and validation

**Contains**:
- Complete configuration schema with validation rules
- Template schema definition
- Default value extraction utilities
- Type definitions and constraints
- Validation patterns and formats

## Architecture Benefits

### Single Source of Truth
- All configuration defaults defined in one place
- Eliminates duplication across components
- Ensures consistency across the extension

### Type Safety and Validation
- Schema-based configuration validation
- Runtime type checking capabilities
- Clear documentation of all configuration options

### Maintainability
- Easy to add new configuration options
- Centralized location for configuration changes
- Clear separation between constants and schema

## Usage Examples

### Importing Constants
```javascript
import { API_ENDPOINTS, DEFAULT_MODELS, MESSAGE_TYPES } from '../config/Constants.js';

// Use API endpoints
const endpoint = API_ENDPOINTS.OPENAI;

// Use default models
const model = DEFAULT_MODELS.ANTHROPIC;

// Use message types
chrome.runtime.sendMessage({ type: MESSAGE_TYPES.OPTIMIZE_TEXT });
```

### Using Configuration Schema
```javascript
import { CONFIG_SCHEMA, getDefaultConfig } from '../config/ConfigSchema.js';

// Get default configuration
const defaultConfig = getDefaultConfig();

// Validate configuration
function validateConfig(config) {
  // Implementation using CONFIG_SCHEMA
}
```

### Configuration Validation
```javascript
import { VALIDATION_CONSTRAINTS } from '../config/Constants.js';

// Validate API key length
if (apiKey.length < VALIDATION_CONSTRAINTS.API_KEY_MIN_LENGTH) {
  throw new Error('API key too short');
}
```

## Migration Guide

When migrating existing code to use centralized configuration:

1. **Replace hard-coded values** with constants from `Constants.js`
2. **Use schema defaults** instead of inline default objects
3. **Import validation constraints** for input validation
4. **Update storage keys** to use centralized definitions

### Before (Duplicated Configuration)
```javascript
// In multiple files
const defaultSettings = {
  provider: 'openai',
  apiEndpoint: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-3.5-turbo'
};
```

### After (Centralized Configuration)
```javascript
import { getDefaultConfig } from '../config/ConfigSchema.js';
import { API_ENDPOINTS, DEFAULT_MODELS } from '../config/Constants.js';

const defaultSettings = getDefaultConfig();
```

## Best Practices

1. **Always use constants** instead of hard-coded strings
2. **Validate configuration** using the schema before saving
3. **Use default extraction utilities** for consistent defaults
4. **Import only what you need** to minimize bundle size
5. **Update schema** when adding new configuration options

## Integration with Existing Components

This configuration system integrates with:
- **ConfigurationManager**: Uses schema for validation and defaults
- **Provider System**: Uses constants for endpoints and models
- **UI Components**: Uses constants for validation and display
- **Background Script**: Uses message types and error codes
- **Template System**: Uses template schema for validation
