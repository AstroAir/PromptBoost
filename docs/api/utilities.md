# Utilities API

The Utilities layer provides shared functionality used throughout the PromptBoost extension. These modules handle common tasks like error handling, logging, validation, and API communication.

## ErrorHandler

Centralized error handling system that provides consistent error management across the extension.

### Getting Instance

```javascript
import { ErrorHandler } from '../utils/ErrorHandler.js';
const errorHandler = ErrorHandler.getInstance();
```

### Core Methods

#### handleError(error, context)

Processes and categorizes errors with appropriate user messaging.

**Parameters:**

- `error` (Error|string): The error to handle
- `context` (Object, optional): Additional context information
  - `component` (string): Component where error occurred
  - `operation` (string): Operation being performed
  - `userFacing` (boolean): Whether to show user-friendly message

**Returns:** Object with error details and user message

**Example:**

```javascript
try {
  await apiCall();
} catch (error) {
  const handled = errorHandler.handleError(error, {
    component: 'PromptBoostBackground',
    operation: 'API_CALL',
    userFacing: true
  });
  
  // handled.userMessage contains user-friendly message
  // handled.category contains error category (API, NETWORK, etc.)
}
```

#### categorizeError(error)

Categorizes errors into predefined types for consistent handling.

**Parameters:**

- `error` (Error): Error to categorize

**Returns:** Object with category and severity information

**Categories:**

- `VALIDATION`: Input validation errors
- `API`: API-related errors  
- `NETWORK`: Network connectivity issues
- `AUTHENTICATION`: Authentication failures
- `RATE_LIMIT`: Rate limiting errors
- `CONFIGURATION`: Configuration errors

#### createUserMessage(error, category)

Creates user-friendly error messages from technical errors.

**Parameters:**

- `error` (Error): Original error
- `category` (string): Error category

**Returns:** string - User-friendly error message

### Error Recovery

#### suggestRecovery(error, category)

Suggests recovery actions for different error types.

**Parameters:**

- `error` (Error): Original error
- `category` (string): Error category

**Returns:** Array<string> - List of suggested recovery actions

## Logger

Unified logging system with configurable levels and output formatting.

### Getting Instance

```javascript
import { Logger } from '../utils/Logger.js';
const logger = new Logger('ComponentName');
```

### Core Methods

#### debug(message, data)

Logs debug information (only in debug mode).

**Parameters:**

- `message` (string): Log message
- `data` (any, optional): Additional data to log

#### info(message, data)

Logs informational messages.

**Parameters:**

- `message` (string): Log message
- `data` (any, optional): Additional data to log

#### warn(message, data)

Logs warning messages.

**Parameters:**

- `message` (string): Warning message
- `data` (any, optional): Additional data to log

#### error(message, error)

Logs error messages with stack traces.

**Parameters:**

- `message` (string): Error description
- `error` (Error, optional): Error object with stack trace

### Performance Logging

#### startTiming(operation)

Starts timing an operation for performance monitoring.

**Parameters:**

- `operation` (string): Operation name

#### endTiming(operation)

Ends timing and logs the duration.

**Parameters:**

- `operation` (string): Operation name

**Returns:** number - Duration in milliseconds

**Example:**

```javascript
logger.startTiming('template_validation');
await validateTemplate(template);
const duration = logger.endTiming('template_validation');
// Logs: "template_validation completed in 45.23ms"
```

### Log Configuration

#### setLevel(level)

Sets the minimum log level to output.

**Parameters:**

- `level` (string): Log level ('debug', 'info', 'warn', 'error')

#### enableDebug(enabled)

Enables or disables debug logging.

**Parameters:**

- `enabled` (boolean): Whether to enable debug logging

## ConfigValidator

Validates configuration objects against defined schemas.

### Core Methods

#### validateConfiguration(config, schema)

Validates a configuration object against a schema.

**Parameters:**

- `config` (Object): Configuration to validate
- `schema` (Object): Validation schema

**Returns:** Object with validation results

- `isValid` (boolean): Whether configuration is valid
- `errors` (Array<string>): List of validation errors
- `warnings` (Array<string>): List of validation warnings

**Example:**

```javascript
const schema = {
  apiKey: { required: true, type: 'string', minLength: 10 },
  provider: { required: true, enum: ['openai', 'anthropic'] },
  maxTokens: { type: 'number', min: 1, max: 4000 }
};

const result = ConfigValidator.validateConfiguration(config, schema);
if (!result.isValid) {
  console.error('Configuration errors:', result.errors);
}
```

#### validateApiKey(apiKey, provider)

Validates API key format for specific providers.

**Parameters:**

- `apiKey` (string): API key to validate
- `provider` (string): Provider name

**Returns:** Object with validation result

#### validateTemplate(template)

Validates template structure and content.

**Parameters:**

- `template` (Object): Template to validate

**Returns:** Object with validation result

## ApiHelper

Common utilities for API communication and request handling.

### Core Methods

#### makeRequest(url, options)

Makes HTTP requests with built-in error handling and retry logic.

**Parameters:**

- `url` (string): Request URL
- `options` (Object): Request options
  - `method` (string): HTTP method
  - `headers` (Object): Request headers
  - `body` (string): Request body
  - `timeout` (number): Request timeout in ms
  - `retries` (number): Number of retry attempts

**Returns:** Promise<Response> - Fetch response object

**Example:**

```javascript
const response = await ApiHelper.makeRequest('https://api.example.com/data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(data),
  timeout: 30000,
  retries: 3
});
```

#### handleApiError(response, context)

Processes API error responses into standardized error objects.

**Parameters:**

- `response` (Response): Fetch response object
- `context` (Object): Request context information

**Returns:** Error object with categorized information

#### buildHeaders(apiKey, provider, additionalHeaders)

Builds appropriate headers for different API providers.

**Parameters:**

- `apiKey` (string): API key
- `provider` (string): Provider name
- `additionalHeaders` (Object, optional): Additional headers

**Returns:** Object with complete headers

### Request Utilities

#### withTimeout(promise, timeoutMs)

Adds timeout functionality to promises.

**Parameters:**

- `promise` (Promise): Promise to add timeout to
- `timeoutMs` (number): Timeout in milliseconds

**Returns:** Promise that rejects on timeout

#### withRetry(fn, options)

Adds retry logic to functions.

**Parameters:**

- `fn` (Function): Function to retry
- `options` (Object): Retry options
  - `retries` (number): Number of retry attempts
  - `delay` (number): Delay between retries in ms
  - `backoff` (boolean): Use exponential backoff

**Returns:** Promise with retry logic

## Storage Utilities

### StorageHelper

Utilities for Chrome storage operations.

#### get(keys)

Gets values from Chrome storage.

**Parameters:**

- `keys` (string|Array<string>|Object): Keys to retrieve

**Returns:** Promise<Object> - Retrieved values

#### set(items)

Sets values in Chrome storage.

**Parameters:**

- `items` (Object): Key-value pairs to store

**Returns:** Promise<void>

#### remove(keys)

Removes values from Chrome storage.

**Parameters:**

- `keys` (string|Array<string>): Keys to remove

**Returns:** Promise<void>

#### clear()

Clears all values from Chrome storage.

**Returns:** Promise<void>

### Migration Utilities

#### migrateSettings(currentVersion, targetVersion)

Migrates settings between versions.

**Parameters:**

- `currentVersion` (number): Current settings version
- `targetVersion` (number): Target settings version

**Returns:** Promise<Object> - Migrated settings

## Text Processing Utilities

### TextProcessor

Utilities for text processing and manipulation.

#### sanitizeText(text)

Sanitizes text input for safe processing.

**Parameters:**

- `text` (string): Text to sanitize

**Returns:** string - Sanitized text

#### truncateText(text, maxLength)

Truncates text to specified length with ellipsis.

**Parameters:**

- `text` (string): Text to truncate
- `maxLength` (number): Maximum length

**Returns:** string - Truncated text

#### countTokens(text, model)

Estimates token count for different AI models.

**Parameters:**

- `text` (string): Text to count tokens for
- `model` (string): AI model name

**Returns:** number - Estimated token count

#### extractPlaceholders(template)

Extracts placeholders from template text.

**Parameters:**

- `template` (string): Template text

**Returns:** Array<string> - List of placeholders found

## DOM Utilities

### DomHelper

Utilities for DOM manipulation and interaction.

#### isEditableElement(element)

Checks if an element is editable.

**Parameters:**

- `element` (Element): DOM element to check

**Returns:** boolean - Whether element is editable

#### getSelectedText()

Gets currently selected text from the page.

**Returns:** string - Selected text

#### replaceSelectedText(newText)

Replaces selected text with new text.

**Parameters:**

- `newText` (string): Text to replace selection with

**Returns:** boolean - Whether replacement was successful

#### createNotification(message, type)

Creates notification elements.

**Parameters:**

- `message` (string): Notification message
- `type` (string): Notification type ('info', 'success', 'error', 'warning')

**Returns:** Element - Notification DOM element

## Usage Examples

### Error Handling Workflow

```javascript
import { ErrorHandler } from '../utils/ErrorHandler.js';
import { Logger } from '../utils/Logger.js';

const errorHandler = ErrorHandler.getInstance();
const logger = new Logger('ApiService');

async function callApi(prompt, settings) {
  try {
    logger.startTiming('api_call');
    const response = await fetch(/* ... */);
    logger.endTiming('api_call');
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    const handled = errorHandler.handleError(error, {
      component: 'ApiService',
      operation: 'API_CALL',
      userFacing: true
    });
    
    logger.error('API call failed', error);
    throw new Error(handled.userMessage);
  }
}
```

### Configuration Validation

```javascript
import { ConfigValidator } from '../utils/ConfigValidator.js';

const providerSchema = {
  provider: { required: true, enum: ['openai', 'anthropic', 'gemini'] },
  apiKey: { required: true, type: 'string', minLength: 10 },
  model: { required: true, type: 'string' },
  maxTokens: { type: 'number', min: 1, max: 4000, default: 1000 }
};

function validateProviderConfig(config) {
  const result = ConfigValidator.validateConfiguration(config, providerSchema);
  
  if (!result.isValid) {
    throw new Error(`Invalid configuration: ${result.errors.join(', ')}`);
  }
  
  if (result.warnings.length > 0) {
    console.warn('Configuration warnings:', result.warnings);
  }
  
  return result.config; // Config with defaults applied
}
```

### Storage Operations

```javascript
import { StorageHelper } from '../utils/StorageHelper.js';

async function saveUserSettings(settings) {
  try {
    await StorageHelper.set({ userSettings: settings });
    console.log('Settings saved successfully');
  } catch (error) {
    console.error('Failed to save settings:', error);
  }
}

async function loadUserSettings() {
  try {
    const data = await StorageHelper.get('userSettings');
    return data.userSettings || getDefaultSettings();
  } catch (error) {
    console.error('Failed to load settings:', error);
    return getDefaultSettings();
  }
}
```

For more information, see:

- [Background Script API](background.md)
- [Services API](services.md)
- [Development Guide](../development/setup.md)
