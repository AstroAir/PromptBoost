# Configuration Reference

This document provides a complete reference for all PromptBoost configuration options, settings schemas, and environment variables.

## Configuration Schema

### Global Configuration Object

```javascript
{
  // Core Settings
  "enabled": boolean,                    // Extension enabled/disabled
  "timeWindow": number,                  // Triple spacebar detection window (ms)
  "provider": string,                    // AI provider name
  "apiKey": string,                      // Provider API key
  "apiEndpoint": string,                 // API endpoint URL
  "model": string,                       // AI model name
  "promptTemplate": string,              // Default prompt template
  
  // User Interface
  "keyboardShortcut": string,            // Keyboard shortcut combination
  "quickTemplateSelection": boolean,     // Show template selector
  "selectedTemplate": string,            // Default template ID
  
  // Advanced Settings
  "advanced": {
    "enableLogging": boolean,            // Debug logging
    "autoSaveHistory": boolean,          // Save optimization history
    "maxHistoryItems": number,           // Maximum history entries
    "requestTimeout": number,            // API request timeout (seconds)
    "retryAttempts": number,             // Number of retry attempts
    "showNotifications": boolean,        // Show success notifications
    "notificationDuration": number,      // Notification display time (seconds)
    "maxTokens": number,                 // Maximum AI tokens
    "temperature": number                // AI creativity (0.0-1.0)
  },
  
  // Per-Page Settings
  "perPage": {
    "domain.com": {
      // Any of the above settings can be overridden per domain
    }
  }
}
```

## Core Settings

### enabled

- **Type**: `boolean`
- **Default**: `true`
- **Description**: Master switch for the extension
- **Values**: `true` (enabled), `false` (disabled)

### timeWindow

- **Type**: `number`
- **Default**: `1000`
- **Range**: `500` - `3000`
- **Unit**: milliseconds
- **Description**: Time window for detecting triple spacebar presses
- **Recommendations**:
  - Fast typers: `800`
  - Average typers: `1000`
  - Slow typers: `1500`

### provider

- **Type**: `string`
- **Default**: `"openai"`
- **Values**:
  - `"openai"` - OpenAI GPT models
  - `"anthropic"` - Anthropic Claude models
  - `"gemini"` - Google Gemini models
  - `"cohere"` - Cohere Command models
  - `"huggingface"` - Hugging Face models
  - `"openrouter"` - OpenRouter unified API
  - `"local"` - Local model support
  - `"custom"` - Custom API endpoint

### apiKey

- **Type**: `string`
- **Default**: `""`
- **Description**: API key for the selected provider
- **Format by Provider**:
  - OpenAI: `sk-...`
  - Anthropic: `sk-ant-...`
  - Google: `AIza...`
  - Others: Provider-specific format
- **Security**: Stored in Chrome's secure storage

### apiEndpoint

- **Type**: `string`
- **Default**: Provider-specific
- **Description**: API endpoint URL
- **Default Values**:
  - OpenAI: `"https://api.openai.com/v1/chat/completions"`
  - Anthropic: `"https://api.anthropic.com/v1/messages"`
  - Gemini: `"https://generativelanguage.googleapis.com/v1"`
  - Custom: User-defined

### model

- **Type**: `string`
- **Default**: Provider-specific
- **Description**: AI model to use
- **Common Values**:
  - OpenAI: `"gpt-3.5-turbo"`, `"gpt-4"`, `"gpt-4-turbo"`
  - Anthropic: `"claude-3-sonnet-20240229"`, `"claude-3-opus-20240229"`
  - Gemini: `"gemini-pro"`

### promptTemplate

- **Type**: `string`
- **Default**: `"Please improve and optimize the following text while maintaining its original meaning and tone:\n\n{text}"`
- **Description**: Default prompt template with `{text}` placeholder
- **Requirements**: Must contain `{text}` placeholder

## User Interface Settings

### keyboardShortcut

- **Type**: `string`
- **Default**: `"Ctrl+Shift+Space"`
- **Description**: Keyboard shortcut for quick optimization
- **Format**: Modifier keys + key (e.g., `"Ctrl+Shift+Space"`)
- **Supported Modifiers**: `Ctrl`, `Shift`, `Alt`, `Meta`

### quickTemplateSelection

- **Type**: `boolean`
- **Default**: `true`
- **Description**: Show template selector after triple spacebar
- **Values**:
  - `true`: Show template chooser popup
  - `false`: Use default template immediately

### selectedTemplate

- **Type**: `string`
- **Default**: `"general"`
- **Description**: ID of the default template to use
- **Values**: Any valid template ID

## Advanced Settings

### enableLogging

- **Type**: `boolean`
- **Default**: `false`
- **Description**: Enable debug logging for troubleshooting
- **Impact**: May affect performance when enabled

### autoSaveHistory

- **Type**: `boolean`
- **Default**: `true`
- **Description**: Automatically save optimization history
- **Storage**: Local browser storage

### maxHistoryItems

- **Type**: `number`
- **Default**: `100`
- **Range**: `10` - `1000`
- **Description**: Maximum number of history entries to keep
- **Cleanup**: Older entries automatically removed

### requestTimeout

- **Type**: `number`
- **Default**: `30`
- **Range**: `10` - `120`
- **Unit**: seconds
- **Description**: Maximum time to wait for API response

### retryAttempts

- **Type**: `number`
- **Default**: `3`
- **Range**: `0` - `5`
- **Description**: Number of retry attempts for failed requests
- **Backoff**: Exponential backoff between retries

### showNotifications

- **Type**: `boolean`
- **Default**: `true`
- **Description**: Show success/error notifications to user

### notificationDuration

- **Type**: `number`
- **Default**: `4`
- **Range**: `1` - `10`
- **Unit**: seconds
- **Description**: How long notifications remain visible

### maxTokens

- **Type**: `number`
- **Default**: `1000`
- **Range**: `100` - `4000`
- **Description**: Maximum tokens for AI generation
- **Impact**: Affects response length and API cost

### temperature

- **Type**: `number`
- **Default**: `0.7`
- **Range**: `0.0` - `1.0`
- **Description**: AI creativity/randomness level
- **Guidelines**:
  - `0.0-0.3`: Conservative, consistent
  - `0.4-0.7`: Balanced
  - `0.8-1.0`: Creative, varied

## Per-Page Configuration

### Structure

```javascript
"perPage": {
  "gmail.com": {
    "provider": "anthropic",
    "model": "claude-3-sonnet-20240229",
    "selectedTemplate": "email-enhancement",
    "advanced": {
      "temperature": 0.3
    }
  },
  "twitter.com": {
    "selectedTemplate": "social-media",
    "advanced": {
      "maxTokens": 280
    }
  }
}
```

### Domain Matching

- **Exact Match**: `"gmail.com"` matches only gmail.com
- **Subdomain Support**: `"mail.google.com"` for specific subdomains
- **Wildcard Support**: Not currently supported

### Setting Inheritance

1. **Per-page settings** (highest priority)
2. **Global settings** (fallback)
3. **Default settings** (ultimate fallback)

## Template Configuration

### Template Object Schema

```javascript
{
  "id": string,                          // Unique template identifier
  "name": string,                        // Display name
  "description": string,                 // Template description
  "category": string,                    // Template category
  "template": string,                    // Prompt template with {text}
  "version": number,                     // Current version number
  "isDefault": boolean,                  // Built-in template flag
  "isCustom": boolean,                   // Custom template flag
  "createdAt": number,                   // Creation timestamp
  "updatedAt": number,                   // Last update timestamp
  
  // Version History
  "versions": [
    {
      "id": string,                      // Version ID
      "version": number,                 // Version number
      "content": string,                 // Template content
      "changelog": string,               // Change description
      "createdAt": number,               // Version timestamp
      "createdBy": string                // Creator (user/system/migration)
    }
  ],
  
  // Metadata
  "metadata": {
    "usage": number,                     // Usage count
    "lastUsed": number,                  // Last used timestamp
    "performance": {
      "averageResponseTime": number,     // Average API response time
      "successRate": number              // Success rate percentage
    }
  }
}
```

### Template Categories

- `"general"`: General text improvement
- `"tone"`: Tone adjustment templates
- `"business"`: Business communication
- `"creative"`: Creative writing
- `"technical"`: Technical documentation
- `"social"`: Social media optimization
- `"custom"`: User-created templates

## Environment Variables

### Development Environment

```bash
# API Configuration
PROMPTBOOST_DEFAULT_PROVIDER=openai
PROMPTBOOST_DEFAULT_MODEL=gpt-3.5-turbo

# Debug Settings
PROMPTBOOST_DEBUG=true
PROMPTBOOST_LOG_LEVEL=debug

# Testing
PROMPTBOOST_TEST_API_KEY=sk-test-key
PROMPTBOOST_TEST_ENDPOINT=http://localhost:3000/api
```

### Production Environment

```bash
# Disable debug features
PROMPTBOOST_DEBUG=false
PROMPTBOOST_LOG_LEVEL=error

# Performance settings
PROMPTBOOST_MAX_CONCURRENT_REQUESTS=5
PROMPTBOOST_REQUEST_TIMEOUT=30
```

## Storage Schema

### Chrome Storage Structure

```javascript
// chrome.storage.sync
{
  "settings": { /* Global configuration object */ },
  "templates": { /* Template objects by ID */ },
  "perPageSettings": { /* Per-page configurations */ },
  "configVersion": number
}

// chrome.storage.local
{
  "optimizationHistory": [ /* History entries */ ],
  "templateMigrationVersion": number,
  "debugLogs": [ /* Debug log entries */ ]
}
```

## Migration Schema

### Version 1 to Version 2

```javascript
// Migration rules
{
  "from": 1,
  "to": 2,
  "changes": [
    {
      "type": "add",
      "path": "advanced.temperature",
      "default": 0.7
    },
    {
      "type": "rename",
      "from": "promptTemplate",
      "to": "defaultPromptTemplate"
    },
    {
      "type": "restructure",
      "path": "templates",
      "transform": "addVersioning"
    }
  ]
}
```

## Validation Rules

### API Key Validation

```javascript
const apiKeyValidation = {
  openai: /^sk-[A-Za-z0-9]{48}$/,
  anthropic: /^sk-ant-[A-Za-z0-9-_]{95}$/,
  gemini: /^AIza[A-Za-z0-9-_]{35}$/
};
```

### Configuration Validation

```javascript
const configValidation = {
  timeWindow: { min: 500, max: 3000 },
  maxTokens: { min: 100, max: 4000 },
  temperature: { min: 0.0, max: 1.0 },
  requestTimeout: { min: 10, max: 120 },
  retryAttempts: { min: 0, max: 5 }
};
```

## Default Configurations

### Minimal Configuration

```javascript
{
  "enabled": true,
  "provider": "openai",
  "apiKey": "",
  "model": "gpt-3.5-turbo"
}
```

### Recommended Configuration

```javascript
{
  "enabled": true,
  "timeWindow": 1000,
  "provider": "openai",
  "apiKey": "your-api-key",
  "model": "gpt-3.5-turbo",
  "selectedTemplate": "general",
  "quickTemplateSelection": true,
  "advanced": {
    "maxTokens": 1000,
    "temperature": 0.7,
    "requestTimeout": 30,
    "retryAttempts": 3,
    "showNotifications": true
  }
}
```

### Power User Configuration

```javascript
{
  "enabled": true,
  "timeWindow": 800,
  "provider": "anthropic",
  "model": "claude-3-sonnet-20240229",
  "selectedTemplate": "professional-tone",
  "quickTemplateSelection": true,
  "advanced": {
    "maxTokens": 2000,
    "temperature": 0.5,
    "requestTimeout": 45,
    "retryAttempts": 2,
    "enableLogging": true,
    "maxHistoryItems": 500
  },
  "perPage": {
    "gmail.com": {
      "selectedTemplate": "email-enhancement",
      "advanced": { "temperature": 0.3 }
    },
    "docs.google.com": {
      "selectedTemplate": "academic-tone",
      "advanced": { "maxTokens": 3000 }
    }
  }
}
```

For implementation details, see:

- [Configuration Guide](../guides/configuration.md)
- [Services API](../api/services.md)
- [User Manual](../guides/user-manual.md)
