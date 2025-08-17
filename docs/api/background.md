# Background Script API

The background script (`background.js`) serves as the central coordinator for the PromptBoost extension, handling API calls, message routing, and service management.

## PromptBoostBackground Class

### Constructor

```javascript
new PromptBoostBackground()
```

Creates a new instance of the background service worker. Automatically initializes:
- Logger system
- Template and Configuration managers
- Provider system
- Message listeners
- Install handlers

### Public Methods

#### callLLMAPI(text, settings, retryCount)

Calls the configured LLM API to optimize text with comprehensive error handling and retry logic.

**Parameters:**
- `text` (string): The text to be optimized
- `settings` (Object): API configuration settings
  - `provider` (string): The LLM provider ('openai', 'anthropic', 'gemini', etc.)
  - `apiKey` (string): The API key for the provider
  - `apiEndpoint` (string): The API endpoint URL (for OpenAI and custom providers)
  - `model` (string): The model name to use
  - `promptTemplate` (string): The prompt template with {text} placeholder
  - `maxTokens` (number, optional): Maximum tokens to generate (default: 1000)
  - `temperature` (number, optional): Temperature for generation (default: 0.7)
- `retryCount` (number, optional): Current retry attempt (default: 0)

**Returns:** Promise<string> - The optimized text

**Throws:** Error with categorized error types

**Example:**
```javascript
const settings = {
  provider: 'openai',
  apiKey: 'sk-...',
  apiEndpoint: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-3.5-turbo',
  promptTemplate: 'Please improve: {text}'
};

const optimizedText = await background.callLLMAPI('Hello world', settings);
```

#### callNewProviderAPI(providerName, prompt, settings)

Calls the new unified provider system API.

**Parameters:**
- `providerName` (string): Name of the provider to use
- `prompt` (string): The formatted prompt to send
- `settings` (Object): Provider-specific settings

**Returns:** Promise<string> - The API response

**Example:**
```javascript
const result = await background.callNewProviderAPI('openai', 'Improve: Hello', settings);
```

### Message Handlers

The background script handles various message types from other extension components:

#### OPTIMIZE_TEXT

Handles text optimization requests from content scripts.

**Message Format:**
```javascript
{
  type: 'OPTIMIZE_TEXT',
  text: string,
  settings: Object
}
```

**Response:**
```javascript
// Success
{
  type: 'OPTIMIZE_RESULT',
  data: {
    optimizedText: string,
    templateUsed?: string
  }
}

// Error
{
  type: 'OPTIMIZATION_ERROR',
  error: string
}
```

#### OPTIMIZE_WITH_TEMPLATE

Handles template-based text optimization requests.

**Message Format:**
```javascript
{
  type: 'OPTIMIZE_WITH_TEMPLATE',
  text: string,
  templateId: string,
  settings: Object
}
```

#### TEST_API

Tests API connection with current settings.

**Message Format:**
```javascript
{
  type: 'TEST_API',
  settings: Object
}
```

**Response:**
```javascript
{
  type: 'API_TEST_RESULT',
  success: boolean,
  result?: string,
  error?: string
}
```

#### GET_TEMPLATES

Retrieves available templates.

**Message Format:**
```javascript
{
  type: 'GET_TEMPLATES',
  filters?: Object
}
```

**Response:**
```javascript
{
  type: 'TEMPLATES_RESULT',
  data: Array<Template>
}
```

#### SAVE_TEMPLATE

Saves or updates a template.

**Message Format:**
```javascript
{
  type: 'SAVE_TEMPLATE',
  template: Object
}
```

**Response:**
```javascript
{
  type: 'TEMPLATE_SAVED',
  data: Template
}
```

#### DELETE_TEMPLATE

Deletes a template.

**Message Format:**
```javascript
{
  type: 'DELETE_TEMPLATE',
  templateId: string
}
```

#### GET_CONFIGURATION

Retrieves configuration for a specific domain.

**Message Format:**
```javascript
{
  type: 'GET_CONFIGURATION',
  domain: string
}
```

**Response:**
```javascript
{
  type: 'CONFIGURATION_LOADED',
  data: Object
}
```

### Provider System

The background script manages a unified provider system supporting multiple AI services:

#### Supported Providers

- **openai**: OpenAI GPT models
- **anthropic**: Anthropic Claude models
- **gemini**: Google Gemini models
- **cohere**: Cohere Command models
- **huggingface**: Hugging Face models
- **openrouter**: OpenRouter unified API
- **local**: Local model support

#### Provider Registration

```javascript
// Providers are automatically registered during initialization
providerRegistry.register('openai', OpenAIProvider, {
  displayName: 'OpenAI (GPT)',
  description: 'OpenAI\'s GPT models including GPT-3.5 and GPT-4',
  category: 'cloud'
});
```

### Error Handling

The background script uses centralized error handling with categorized error types:

#### Error Categories

- `VALIDATION`: Input validation errors
- `API`: API-related errors
- `NETWORK`: Network connectivity issues
- `AUTHENTICATION`: Authentication failures
- `RATE_LIMIT`: Rate limiting errors
- `CONFIGURATION`: Configuration errors

#### Retry Logic

Automatic retry with exponential backoff for transient errors:
- Maximum 3 retry attempts
- Exponential backoff: 1s, 2s, 4s
- Only retries transient errors (network, rate limit, etc.)

### Services Integration

#### TemplateManager

```javascript
// Access template manager
const templateManager = background.templateManager;

// Get all templates
const templates = await templateManager.getAllTemplates();

// Create new template
const template = await templateManager.createTemplate(templateData);
```

#### ConfigurationManager

```javascript
// Access configuration manager
const configManager = background.configManager;

// Get configuration
const config = await configManager.getConfiguration(domain);

// Save configuration
await configManager.saveConfiguration(domain, config);
```

### Logging and Performance

#### Logger Integration

```javascript
// Logger is automatically initialized
background.logger.info('Operation completed');
background.logger.error('Error occurred', error);

// Performance timing
background.logger.startTiming('operation');
// ... perform operation
background.logger.endTiming('operation');
```

#### Performance Monitoring

- API call timing
- Service initialization timing
- Error rate tracking
- Provider performance metrics

### Installation and Lifecycle

#### Install Handler

Automatically sets up default settings on extension installation:

```javascript
// Default settings applied on install
{
  enabled: true,
  timeWindow: 1000,
  provider: 'openai',
  apiKey: '',
  model: 'gpt-3.5-turbo',
  promptTemplate: 'Please improve and optimize the following text...',
  // ... other defaults
}
```

#### Service Initialization

Services are initialized asynchronously:
1. Template Manager initialization
2. Configuration Manager initialization
3. Provider system setup
4. Event listener registration

### Security Considerations

- API keys are never logged or exposed in error messages
- All API calls use HTTPS
- Input validation prevents injection attacks
- Rate limiting prevents abuse
- Secure storage for sensitive data

### Usage Examples

#### Basic Text Optimization

```javascript
// From content script
chrome.runtime.sendMessage({
  type: 'OPTIMIZE_TEXT',
  text: 'Hello world',
  settings: {
    provider: 'openai',
    apiKey: 'sk-...',
    model: 'gpt-3.5-turbo'
  }
});
```

#### Template-Based Optimization

```javascript
// From content script
chrome.runtime.sendMessage({
  type: 'OPTIMIZE_WITH_TEMPLATE',
  text: 'Hello world',
  templateId: 'professional-tone',
  settings: userSettings
});
```

#### API Testing

```javascript
// From options page
chrome.runtime.sendMessage({
  type: 'TEST_API',
  settings: {
    provider: 'anthropic',
    apiKey: 'sk-ant-...',
    model: 'claude-3-sonnet-20240229'
  }
});
```

For more information, see:
- [Content Script API](content.md)
- [Services API](services.md)
- [Providers API](providers.md)
