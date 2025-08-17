# Providers API

The Providers system provides a unified interface for integrating different AI services with PromptBoost. All providers implement the same base interface, making it easy to add new providers or switch between existing ones.

## Base Provider Interface

### Provider Class

All providers extend the base `Provider` class which defines the common interface.

```javascript
import { Provider } from '../providers/base/Provider.js';

class CustomProvider extends Provider {
  constructor(config) {
    super(config);
    this.name = 'custom';
    this.displayName = 'Custom Provider';
  }
  
  // Implement required methods...
}
```

### Required Methods

#### authenticate(credentials)

Authenticates with the provider's API.

**Parameters:**

- `credentials` (Object): Authentication credentials
  - `apiKey` (string): API key
  - `endpoint` (string, optional): Custom endpoint URL
  - `organization` (string, optional): Organization ID

**Returns:** Promise<Object> - Authentication result

- `success` (boolean): Whether authentication succeeded
- `error` (string, optional): Error message if failed

**Example:**

```javascript
async authenticate(credentials) {
  try {
    const response = await fetch(`${this.baseURL}/auth/verify`, {
      headers: { 'Authorization': `Bearer ${credentials.apiKey}` }
    });
    
    if (response.ok) {
      return { success: true };
    } else {
      return { success: false, error: 'Invalid API key' };
    }
  } catch (error) {
    return { success: false, error: error.message };
  }
}
```

#### callAPI(prompt, options)

Makes API calls to generate text.

**Parameters:**

- `prompt` (string): The formatted prompt to send
- `options` (Object, optional): Generation options
  - `maxTokens` (number): Maximum tokens to generate
  - `temperature` (number): Creativity level (0.0-1.0)
  - `topP` (number): Nucleus sampling parameter
  - `frequencyPenalty` (number): Frequency penalty
  - `presencePenalty` (number): Presence penalty

**Returns:** Promise<string> - Generated text response

**Example:**

```javascript
async callAPI(prompt, options = {}) {
  const requestBody = {
    model: this.config.model,
    messages: [{ role: 'user', content: prompt }],
    max_tokens: options.maxTokens || 1000,
    temperature: options.temperature || 0.7
  };

  const response = await fetch(`${this.baseURL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody)
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
```

#### validateConfig(config)

Validates provider configuration.

**Parameters:**

- `config` (Object): Configuration to validate

**Returns:** Object - Validation result

- `isValid` (boolean): Whether configuration is valid
- `errors` (Array<string>): List of validation errors

**Example:**

```javascript
validateConfig(config) {
  const errors = [];
  
  if (!config.apiKey) {
    errors.push('API key is required');
  }
  
  if (!config.model) {
    errors.push('Model is required');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
}
```

#### getDefaultModel()

Returns the default model for this provider.

**Returns:** string - Default model name

#### getAvailableModels()

Returns list of available models.

**Returns:** Array<Object> - Available models

- `id` (string): Model identifier
- `name` (string): Display name
- `description` (string): Model description

#### getConfigSchema()

Returns configuration schema for UI generation.

**Returns:** Object - Configuration schema with field definitions

## Provider Registry

The `ProviderRegistry` manages all available providers and handles provider selection.

### Getting Instance

```javascript
import { ProviderRegistry } from '../providers/base/ProviderRegistry.js';
const registry = ProviderRegistry.getInstance();
```

### Core Methods

#### register(id, providerClass, metadata)

Registers a new provider.

**Parameters:**

- `id` (string): Provider identifier
- `providerClass` (Class): Provider class constructor
- `metadata` (Object): Provider metadata
  - `displayName` (string): Human-readable name
  - `description` (string): Provider description
  - `category` (string): Provider category
  - `icon` (string, optional): Icon URL

**Example:**

```javascript
registry.register('custom', CustomProvider, {
  displayName: 'Custom AI',
  description: 'Custom AI provider integration',
  category: 'custom'
});
```

#### getProvider(id, config)

Gets a provider instance.

**Parameters:**

- `id` (string): Provider identifier
- `config` (Object): Provider configuration

**Returns:** Provider instance

#### getAllProviders()

Gets all registered providers.

**Returns:** Map<string, Object> - Map of provider ID to metadata

#### isProviderAvailable(id)

Checks if a provider is available.

**Parameters:**

- `id` (string): Provider identifier

**Returns:** boolean - Whether provider is available

## Built-in Providers

### OpenAI Provider

**ID:** `openai`
**Models:** GPT-4, GPT-4 Turbo, GPT-3.5 Turbo
**Configuration:**

```javascript
{
  provider: 'openai',
  apiKey: 'sk-...',
  model: 'gpt-3.5-turbo',
  endpoint: 'https://api.openai.com/v1/chat/completions',
  organization: 'org-...' // optional
}
```

### Anthropic Provider

**ID:** `anthropic`
**Models:** Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku
**Configuration:**

```javascript
{
  provider: 'anthropic',
  apiKey: 'sk-ant-...',
  model: 'claude-3-sonnet-20240229',
  endpoint: 'https://api.anthropic.com/v1/messages'
}
```

### Google Gemini Provider

**ID:** `gemini`
**Models:** Gemini Pro, Gemini Pro Vision
**Configuration:**

```javascript
{
  provider: 'gemini',
  apiKey: 'AIza...',
  model: 'gemini-pro',
  endpoint: 'https://generativelanguage.googleapis.com/v1'
}
```

### Cohere Provider

**ID:** `cohere`
**Models:** Command, Command Light, Command Nightly
**Configuration:**

```javascript
{
  provider: 'cohere',
  apiKey: 'co-...',
  model: 'command',
  endpoint: 'https://api.cohere.ai/v1'
}
```

### Hugging Face Provider

**ID:** `huggingface`
**Models:** Various open source models
**Configuration:**

```javascript
{
  provider: 'huggingface',
  apiKey: 'hf_...',
  model: 'microsoft/DialoGPT-medium',
  endpoint: 'https://api-inference.huggingface.co'
}
```

### OpenRouter Provider

**ID:** `openrouter`
**Models:** Unified access to multiple providers
**Configuration:**

```javascript
{
  provider: 'openrouter',
  apiKey: 'sk-or-...',
  model: 'anthropic/claude-3-sonnet',
  endpoint: 'https://openrouter.ai/api/v1'
}
```

### Local Provider

**ID:** `local`
**Models:** Local models via Ollama, LM Studio, etc.
**Configuration:**

```javascript
{
  provider: 'local',
  apiKey: '', // Usually not needed
  model: 'llama2:7b',
  endpoint: 'http://localhost:11434/v1/chat/completions'
}
```

## Provider Selection Strategy

### Fallback Configuration

```javascript
const fallbackConfig = {
  primary: {
    provider: 'openai',
    model: 'gpt-3.5-turbo'
  },
  fallbacks: [
    {
      provider: 'anthropic',
      model: 'claude-3-haiku-20240307',
      condition: 'primary_failed'
    },
    {
      provider: 'gemini',
      model: 'gemini-pro',
      condition: 'rate_limit'
    }
  ]
};
```

### Load Balancing

```javascript
const loadBalancer = {
  providers: [
    { id: 'openai', weight: 50 },
    { id: 'anthropic', weight: 30 },
    { id: 'gemini', weight: 20 }
  ],
  strategy: 'weighted_round_robin'
};
```

## Error Handling

### Provider-Specific Errors

Each provider handles errors according to their API specifications:

```javascript
class CustomProvider extends Provider {
  async callAPI(prompt, options) {
    try {
      const response = await this.makeRequest(prompt, options);
      return response.text;
    } catch (error) {
      // Convert provider-specific errors to standard format
      if (error.status === 401) {
        throw new Error('AUTHENTICATION_FAILED');
      } else if (error.status === 429) {
        throw new Error('RATE_LIMIT_EXCEEDED');
      } else if (error.status >= 500) {
        throw new Error('SERVER_ERROR');
      } else {
        throw new Error('API_ERROR');
      }
    }
  }
}
```

### Retry Logic

```javascript
async callAPIWithRetry(prompt, options, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      return await this.callAPI(prompt, options);
    } catch (error) {
      if (i === retries - 1) throw error;
      
      // Exponential backoff
      const delay = Math.pow(2, i) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}
```

## Usage Examples

### Creating a Custom Provider

```javascript
import { Provider } from '../providers/base/Provider.js';

class MyCustomProvider extends Provider {
  constructor(config) {
    super(config);
    this.name = 'mycustom';
    this.displayName = 'My Custom AI';
    this.baseURL = 'https://api.mycustom.ai/v1';
  }

  async authenticate(credentials) {
    // Implement authentication
    const response = await fetch(`${this.baseURL}/auth`, {
      headers: { 'Authorization': `Bearer ${credentials.apiKey}` }
    });
    
    return { success: response.ok };
  }

  async callAPI(prompt, options = {}) {
    // Implement API calling
    const response = await fetch(`${this.baseURL}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        prompt: prompt,
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7
      })
    });

    const data = await response.json();
    return data.text;
  }

  validateConfig(config) {
    const errors = [];
    if (!config.apiKey) errors.push('API key required');
    return { isValid: errors.length === 0, errors };
  }

  getDefaultModel() {
    return 'default-model';
  }

  getAvailableModels() {
    return [
      { id: 'model-1', name: 'Model 1', description: 'Fast model' },
      { id: 'model-2', name: 'Model 2', description: 'Quality model' }
    ];
  }

  getConfigSchema() {
    return {
      apiKey: {
        type: 'password',
        required: true,
        label: 'API Key'
      },
      model: {
        type: 'select',
        required: true,
        label: 'Model',
        options: this.getAvailableModels()
      }
    };
  }
}

// Register the provider
const registry = ProviderRegistry.getInstance();
registry.register('mycustom', MyCustomProvider, {
  displayName: 'My Custom AI',
  description: 'Custom AI provider integration',
  category: 'custom'
});
```

### Using Providers

```javascript
// Get provider instance
const provider = registry.getProvider('openai', {
  apiKey: 'sk-...',
  model: 'gpt-3.5-turbo'
});

// Authenticate
const authResult = await provider.authenticate({ apiKey: 'sk-...' });
if (!authResult.success) {
  throw new Error('Authentication failed');
}

// Make API call
const result = await provider.callAPI('Improve this text: Hello world', {
  maxTokens: 1000,
  temperature: 0.7
});

console.log('Optimized text:', result);
```

For more information, see:

- [Provider Integration Examples](../examples/providers.md)
- [Configuration Guide](../guides/configuration.md)
- [Development Guide](../development/setup.md)
