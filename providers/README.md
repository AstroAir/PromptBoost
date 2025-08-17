# Providers Directory

This directory contains AI provider implementations for the PromptBoost extension.

## Architecture

The provider system uses a unified interface that allows seamless integration of different AI services. All providers implement the same base interface, making it easy to add new providers or switch between existing ones.

For detailed provider documentation, see:
- **[Providers API Reference](../docs/api/providers.md)** - Complete API documentation
- **[Provider Integration Examples](../docs/examples/providers.md)** - Practical integration examples
- **[Architecture Overview](../docs/architecture/overview.md)** - System architecture details

### Base Classes

#### Provider.js
Abstract base class that defines the common interface for all providers:
- Authentication management
- API calling interface
- Configuration validation
- Rate limiting
- Error handling

#### ProviderRegistry.js
Central registry for managing provider instances:
- Provider registration and discovery
- Fallback provider management
- Provider instance caching
- Configuration management

## Supported Providers

### OpenAI (openai/)
**File**: `OpenAIProvider.js`
**Models**: GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
**Features**: Chat completion, streaming, function calling
**Authentication**: Bearer token (API key)

```javascript
const provider = new OpenAIProvider({
  apiKey: 'sk-...',
  baseURL: 'https://api.openai.com/v1',
  organization: 'org-...' // optional
});
```

### Anthropic (anthropic/)
**File**: `AnthropicProvider.js`
**Models**: Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku
**Features**: Chat completion, streaming, long context
**Authentication**: x-api-key header

```javascript
const provider = new AnthropicProvider({
  apiKey: 'sk-ant-...',
  baseURL: 'https://api.anthropic.com/v1',
  anthropicVersion: '2023-06-01'
});
```

### Google Gemini (google/)
**File**: `GeminiProvider.js`
**Models**: Gemini Pro, Gemini Pro Vision
**Features**: Text generation, multimodal capabilities
**Authentication**: API key in URL parameter

```javascript
const provider = new GeminiProvider({
  apiKey: 'AIza...',
  baseURL: 'https://generativelanguage.googleapis.com/v1'
});
```

### Cohere (cohere/)
**File**: `CohereProvider.js`
**Models**: Command, Command Light, Command Nightly
**Features**: Text generation, embeddings
**Authentication**: Bearer token

```javascript
const provider = new CohereProvider({
  apiKey: 'co-...',
  baseURL: 'https://api.cohere.ai/v1'
});
```

### Hugging Face (huggingface/)
**File**: `HuggingFaceProvider.js`
**Models**: Thousands of open-source models
**Features**: Text generation, model flexibility
**Authentication**: Bearer token

```javascript
const provider = new HuggingFaceProvider({
  apiKey: 'hf_...',
  baseURL: 'https://api-inference.huggingface.co',
  model: 'microsoft/DialoGPT-medium'
});
```

### OpenRouter (openrouter/)
**File**: `OpenRouterProvider.js`
**Models**: Multiple models through unified API
**Features**: Access to various models, cost optimization
**Authentication**: Bearer token

```javascript
const provider = new OpenRouterProvider({
  apiKey: 'sk-or-...',
  baseURL: 'https://openrouter.ai/api/v1',
  appName: 'PromptBoost'
});
```

### Local Models (local/)
**File**: `LocalProvider.js`
**Models**: Self-hosted models (Ollama, LM Studio, etc.)
**Features**: Privacy, customization, offline usage
**Authentication**: Optional API key or none

```javascript
const provider = new LocalProvider({
  baseURL: 'http://localhost:11434/v1',
  model: 'llama2:7b'
});
```

## Provider Interface

All providers implement the following interface:

### Core Methods

#### authenticate(credentials)
Authenticates with the provider's API.
```javascript
await provider.authenticate({
  apiKey: 'your-api-key',
  baseURL: 'https://api.example.com',
  // other provider-specific options
});
```

#### callAPI(prompt, options)
Makes an API call to generate text.
```javascript
const result = await provider.callAPI('Hello, world!', {
  model: 'gpt-3.5-turbo',
  maxTokens: 1000,
  temperature: 0.7,
  stream: false
});
```

#### validateConfig(config)
Validates provider configuration.
```javascript
const validation = provider.validateConfig({
  apiKey: 'sk-...',
  model: 'gpt-3.5-turbo'
});
// Returns: { isValid: boolean, errors: string[], warnings: string[] }
```

### Information Methods

#### getDefaultModel()
Returns the default model for the provider.

#### getAvailableModels()
Returns list of available models.

#### getConfigSchema()
Returns configuration schema for UI generation.

### Utility Methods

#### checkRateLimit()
Checks and enforces rate limits.

#### handleError(error, context)
Handles provider-specific errors.

#### updateRateLimitFromHeaders(headers)
Updates rate limit info from response headers.

## Usage Examples

### Basic Usage
```javascript
// Get provider from registry
const provider = providerRegistry.getProvider('openai');

// Authenticate
await provider.authenticate({
  apiKey: 'sk-...'
});

// Make API call
const result = await provider.callAPI('Improve this text: Hello world', {
  model: 'gpt-3.5-turbo',
  maxTokens: 500,
  temperature: 0.7
});

console.log(result); // Improved text
```

### With Fallback
```javascript
// Get provider with automatic fallback
const provider = providerRegistry.getProviderWithFallback('openai', {
  apiKey: 'sk-...',
  fallbackProviders: ['anthropic', 'cohere']
});

const result = await provider.callAPI(prompt, options);
```

### Streaming Response
```javascript
const stream = await provider.callAPI(prompt, {
  stream: true,
  model: 'gpt-3.5-turbo'
});

for await (const chunk of stream) {
  process.stdout.write(chunk);
}
```

## Adding New Providers

### Step 1: Create Provider Class
```javascript
class NewProvider extends Provider {
  constructor(config) {
    super({
      name: 'newprovider',
      displayName: 'New Provider',
      description: 'Description of the new provider',
      supportedFeatures: ['text-generation', 'chat'],
      ...config
    });
  }

  async authenticate(credentials) {
    // Implement authentication
  }

  async callAPI(prompt, options) {
    // Implement API calling
  }

  validateConfig(config) {
    // Implement configuration validation
  }

  getConfigSchema() {
    // Return configuration schema
  }
}
```

### Step 2: Register Provider
```javascript
// In background.js or provider setup
providerRegistry.register('newprovider', NewProvider, {
  displayName: 'New Provider',
  description: 'Description of the new provider',
  category: 'cloud' // or 'local'
});
```

### Step 3: Add to UI
Update the options page to include the new provider in the dropdown and configuration forms.

## Error Handling

Providers use the centralized ErrorHandler for consistent error management:

```javascript
try {
  const result = await provider.callAPI(prompt, options);
} catch (error) {
  // Error is automatically categorized and logged
  ErrorHandler.handle(error, 'ProviderName.callAPI', {
    category: ErrorCategory.API,
    metadata: { provider: 'openai', model: 'gpt-3.5-turbo' }
  });
}
```

## Rate Limiting

All providers implement rate limiting to prevent API quota exhaustion:

- **Request-based limiting**: Maximum requests per minute
- **Token-based limiting**: Maximum tokens per minute
- **Automatic backoff**: Exponential backoff on rate limit hits
- **Header parsing**: Automatic rate limit info extraction

## Testing

Each provider should include comprehensive tests:

```javascript
describe('OpenAIProvider', () => {
  test('should authenticate successfully', async () => {
    const provider = new OpenAIProvider();
    await expect(provider.authenticate({ apiKey: 'valid-key' }))
      .resolves.toBe(true);
  });

  test('should make API call', async () => {
    const provider = new OpenAIProvider();
    await provider.authenticate({ apiKey: 'valid-key' });
    
    const result = await provider.callAPI('Hello', {
      model: 'gpt-3.5-turbo'
    });
    
    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
  });
});
```

## Security Considerations

- **API Key Protection**: Keys are never logged or exposed in errors
- **Input Sanitization**: All inputs are validated before API calls
- **HTTPS Only**: All providers use secure connections
- **Rate Limiting**: Prevents abuse and quota exhaustion
- **Error Sanitization**: Sensitive data is removed from error messages

## Performance Optimization

- **Connection Pooling**: Reuse HTTP connections when possible
- **Response Caching**: Cache responses for identical requests
- **Compression**: Use gzip compression for large requests
- **Timeout Management**: Configurable timeouts for different operations
- **Retry Logic**: Intelligent retry with exponential backoff

The provider system is designed to be extensible, reliable, and performant while maintaining a consistent interface across all AI services.
