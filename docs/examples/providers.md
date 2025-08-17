# Provider Integration Examples

This guide provides practical examples of integrating different AI providers with PromptBoost, including configuration, custom providers, and optimization strategies.

## Built-in Provider Examples

### OpenAI Integration

#### Basic Configuration

```javascript
{
  "provider": "openai",
  "apiKey": "sk-your-openai-key-here",
  "apiEndpoint": "https://api.openai.com/v1/chat/completions",
  "model": "gpt-3.5-turbo",
  "advanced": {
    "maxTokens": 1000,
    "temperature": 0.7
  }
}
```

#### Advanced OpenAI Configuration

```javascript
{
  "provider": "openai",
  "apiKey": "sk-your-openai-key-here",
  "apiEndpoint": "https://api.openai.com/v1/chat/completions",
  "model": "gpt-4-turbo",
  "advanced": {
    "maxTokens": 2000,
    "temperature": 0.5,
    "topP": 0.9,
    "frequencyPenalty": 0.1,
    "presencePenalty": 0.1
  }
}
```

#### Model Selection Guide

```javascript
// Speed vs Quality tradeoff
const modelRecommendations = {
  "gpt-3.5-turbo": {
    useCase: "Fast, cost-effective general text improvement",
    speed: "Fast",
    cost: "Low",
    quality: "Good"
  },
  "gpt-4": {
    useCase: "High-quality creative and complex text work",
    speed: "Slow",
    cost: "High",
    quality: "Excellent"
  },
  "gpt-4-turbo": {
    useCase: "Balanced speed and quality for professional use",
    speed: "Medium",
    cost: "Medium-High",
    quality: "Excellent"
  }
};
```

### Anthropic Claude Integration

#### Basic Configuration

```javascript
{
  "provider": "anthropic",
  "apiKey": "sk-ant-your-anthropic-key-here",
  "apiEndpoint": "https://api.anthropic.com/v1/messages",
  "model": "claude-3-sonnet-20240229",
  "advanced": {
    "maxTokens": 1000,
    "temperature": 0.7
  }
}
```

#### Claude Model Comparison

```javascript
const claudeModels = {
  "claude-3-haiku-20240307": {
    useCase: "Fast, cost-effective text processing",
    strengths: ["Speed", "Cost efficiency", "Good reasoning"],
    bestFor: ["Quick edits", "Grammar checking", "Simple improvements"]
  },
  "claude-3-sonnet-20240229": {
    useCase: "Balanced performance for most use cases",
    strengths: ["Balanced speed/quality", "Good reasoning", "Reliable"],
    bestFor: ["Professional writing", "Business communication", "General optimization"]
  },
  "claude-3-opus-20240229": {
    useCase: "Highest quality for complex tasks",
    strengths: ["Superior reasoning", "Creative writing", "Complex analysis"],
    bestFor: ["Creative writing", "Complex documents", "Research papers"]
  }
};
```

### Google Gemini Integration

#### Basic Configuration

```javascript
{
  "provider": "gemini",
  "apiKey": "AIza-your-gemini-key-here",
  "apiEndpoint": "https://generativelanguage.googleapis.com/v1",
  "model": "gemini-pro",
  "advanced": {
    "maxTokens": 1000,
    "temperature": 0.7
  }
}
```

#### Gemini Advantages

```javascript
const geminiFeatures = {
  "freeTier": {
    description: "Generous free tier for personal use",
    limits: "60 requests per minute, 1500 per day"
  },
  "multimodal": {
    description: "Supports text and image inputs",
    note: "Future PromptBoost feature"
  },
  "contextWindow": {
    description: "Large context window for long documents",
    size: "32k tokens"
  }
};
```

## Custom Provider Integration

### Local Model Integration (Ollama)

#### Setup Ollama

```bash
# Install Ollama
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama2:7b

# Start Ollama server
ollama serve
```

#### PromptBoost Configuration

```javascript
{
  "provider": "custom",
  "apiKey": "", // Not needed for local
  "apiEndpoint": "http://localhost:11434/v1/chat/completions",
  "model": "llama2:7b",
  "advanced": {
    "maxTokens": 1000,
    "temperature": 0.7,
    "requestTimeout": 60 // Local models may be slower
  }
}
```

#### Ollama Model Examples

```javascript
const ollamaModels = {
  "llama2:7b": {
    size: "3.8GB",
    useCase: "General text improvement, good balance",
    performance: "Medium speed, good quality"
  },
  "llama2:13b": {
    size: "7.3GB",
    useCase: "Higher quality text work",
    performance: "Slower, better quality"
  },
  "codellama:7b": {
    size: "3.8GB",
    useCase: "Code documentation and technical writing",
    performance: "Specialized for code"
  },
  "mistral:7b": {
    size: "4.1GB",
    useCase: "Fast, efficient general purpose",
    performance: "Fast, good quality"
  }
};
```

### LM Studio Integration

#### LM Studio Setup

1. Download and install LM Studio
2. Download a model (e.g., Llama 2 7B)
3. Start local server on port 1234

#### PromptBoost Configuration

```javascript
{
  "provider": "custom",
  "apiKey": "", // Not needed
  "apiEndpoint": "http://localhost:1234/v1/chat/completions",
  "model": "local-model", // Model name from LM Studio
  "advanced": {
    "maxTokens": 1000,
    "temperature": 0.7,
    "requestTimeout": 90
  }
}
```

### OpenRouter Integration

#### Configuration

```javascript
{
  "provider": "custom",
  "apiKey": "sk-or-your-openrouter-key",
  "apiEndpoint": "https://openrouter.ai/api/v1/chat/completions",
  "model": "anthropic/claude-3-sonnet",
  "advanced": {
    "maxTokens": 1000,
    "temperature": 0.7
  }
}
```

#### OpenRouter Model Selection

```javascript
const openRouterModels = {
  "anthropic/claude-3-sonnet": {
    cost: "$3.00 / 1M tokens",
    useCase: "High-quality general purpose"
  },
  "openai/gpt-3.5-turbo": {
    cost: "$0.50 / 1M tokens",
    useCase: "Fast, cost-effective"
  },
  "meta-llama/llama-2-70b-chat": {
    cost: "$0.70 / 1M tokens",
    useCase: "Open source, good quality"
  },
  "google/palm-2-chat-bison": {
    cost: "$0.25 / 1M tokens",
    useCase: "Very cost-effective"
  }
};
```

## Creating Custom Providers

### Custom Provider Class Example

```javascript
// providers/custom/MyCustomProvider.js
class MyCustomProvider extends Provider {
  constructor(config) {
    super(config);
    this.name = 'mycustom';
    this.displayName = 'My Custom AI';
    this.description = 'Custom AI provider integration';
  }

  async authenticate(credentials) {
    try {
      // Implement authentication logic
      const response = await fetch(`${this.config.endpoint}/auth`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${credentials.apiKey}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Authentication failed');
      }
      
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  async callAPI(prompt, options = {}) {
    try {
      const requestBody = {
        model: this.config.model,
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: options.maxTokens || 1000,
        temperature: options.temperature || 0.7
      };

      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`,
          'User-Agent': 'PromptBoost/2.0'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      throw new Error(`Custom provider error: ${error.message}`);
    }
  }

  validateConfig(config) {
    const errors = [];
    
    if (!config.apiKey) {
      errors.push('API key is required');
    }
    
    if (!config.endpoint) {
      errors.push('API endpoint is required');
    }
    
    if (!config.model) {
      errors.push('Model name is required');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
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
        type: 'string',
        required: true,
        label: 'API Key',
        description: 'Your custom provider API key'
      },
      endpoint: {
        type: 'string',
        required: true,
        label: 'API Endpoint',
        description: 'Custom API endpoint URL'
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
providerRegistry.register('mycustom', MyCustomProvider, {
  displayName: 'My Custom AI',
  description: 'Custom AI provider integration',
  category: 'custom'
});
```

### Provider Registration Example

```javascript
// In background.js or provider initialization
const customProviders = [
  {
    id: 'mycustom',
    class: MyCustomProvider,
    config: {
      displayName: 'My Custom AI',
      description: 'Custom AI provider',
      category: 'custom',
      icon: 'custom-icon.png'
    }
  }
];

// Register all custom providers
customProviders.forEach(provider => {
  providerRegistry.register(provider.id, provider.class, provider.config);
});
```

## Provider-Specific Optimizations

### OpenAI Optimizations

#### Cost Optimization

```javascript
const openaiCostOptimization = {
  // Use cheaper model for simple tasks
  simpleTemplates: {
    model: "gpt-3.5-turbo",
    maxTokens: 500,
    temperature: 0.5
  },
  
  // Use premium model for complex tasks
  complexTemplates: {
    model: "gpt-4-turbo",
    maxTokens: 2000,
    temperature: 0.7
  },
  
  // Batch similar requests
  batchProcessing: true,
  
  // Cache common responses
  enableCaching: true
};
```

#### Performance Optimization

```javascript
const openaiPerformanceConfig = {
  // Faster model for real-time use
  model: "gpt-3.5-turbo",
  
  // Reduce tokens for speed
  maxTokens: 800,
  
  // Lower temperature for consistency
  temperature: 0.3,
  
  // Shorter timeout
  requestTimeout: 15,
  
  // Fewer retries
  retryAttempts: 2
};
```

### Anthropic Optimizations

#### Quality-Focused Configuration

```javascript
const anthropicQualityConfig = {
  model: "claude-3-opus-20240229",
  maxTokens: 2000,
  temperature: 0.6,
  
  // Anthropic-specific parameters
  topP: 0.9,
  topK: 40,
  
  // Longer timeout for quality
  requestTimeout: 45
};
```

#### Balanced Configuration

```javascript
const anthropicBalancedConfig = {
  model: "claude-3-sonnet-20240229",
  maxTokens: 1500,
  temperature: 0.7,
  requestTimeout: 30,
  
  // Good balance of speed and quality
  retryAttempts: 3
};
```

### Local Model Optimizations

#### Hardware-Specific Settings

```javascript
const localModelConfig = {
  // For powerful hardware (16GB+ RAM, GPU)
  highEnd: {
    model: "llama2:13b",
    maxTokens: 2000,
    temperature: 0.7,
    requestTimeout: 120
  },
  
  // For moderate hardware (8-16GB RAM)
  midRange: {
    model: "llama2:7b",
    maxTokens: 1000,
    temperature: 0.7,
    requestTimeout: 60
  },
  
  // For limited hardware (4-8GB RAM)
  lowEnd: {
    model: "mistral:7b",
    maxTokens: 500,
    temperature: 0.6,
    requestTimeout: 90
  }
};
```

## Multi-Provider Strategies

### Provider Fallback Configuration

```javascript
const providerFallback = {
  primary: {
    provider: "anthropic",
    model: "claude-3-sonnet-20240229"
  },
  
  fallback: [
    {
      provider: "openai",
      model: "gpt-3.5-turbo",
      condition: "primary_failed"
    },
    {
      provider: "gemini",
      model: "gemini-pro",
      condition: "cost_limit_reached"
    }
  ]
};
```

### Load Balancing Example

```javascript
const loadBalancingConfig = {
  providers: [
    { id: "openai", weight: 50, model: "gpt-3.5-turbo" },
    { id: "anthropic", weight: 30, model: "claude-3-sonnet" },
    { id: "gemini", weight: 20, model: "gemini-pro" }
  ],
  
  strategy: "weighted_round_robin",
  healthCheck: true,
  failoverEnabled: true
};
```

### Cost-Based Provider Selection

```javascript
const costBasedSelection = {
  budgetLimits: {
    daily: 10.00,    // $10 per day
    monthly: 200.00  // $200 per month
  },
  
  providerCosts: {
    "openai/gpt-3.5-turbo": 0.002,     // per 1K tokens
    "anthropic/claude-3-sonnet": 0.003,
    "gemini/gemini-pro": 0.001
  },
  
  selectionStrategy: "cost_optimized",
  fallbackToFree: true
};
```

## Provider Testing and Monitoring

### Provider Performance Testing

```javascript
const providerTest = {
  testSuite: {
    providers: ["openai", "anthropic", "gemini"],
    testCases: [
      {
        input: "Simple grammar test text",
        expectedType: "grammar_correction",
        timeout: 10000
      },
      {
        input: "Complex creative writing sample...",
        expectedType: "creative_enhancement",
        timeout: 30000
      }
    ]
  },
  
  metrics: [
    "response_time",
    "success_rate",
    "output_quality",
    "cost_per_request"
  ]
};

// Run provider comparison
async function compareProviders(testSuite) {
  const results = {};
  
  for (const provider of testSuite.providers) {
    results[provider] = await runProviderTests(provider, testSuite.testCases);
  }
  
  return generateComparisonReport(results);
}
```

### Provider Health Monitoring

```javascript
const healthMonitoring = {
  checkInterval: 300000, // 5 minutes
  
  healthChecks: {
    connectivity: true,
    authentication: true,
    responseTime: true,
    errorRate: true
  },
  
  thresholds: {
    maxResponseTime: 30000,
    maxErrorRate: 0.05,
    minSuccessRate: 0.95
  },
  
  actions: {
    onFailure: "switch_to_fallback",
    onRecovery: "restore_primary",
    notifications: true
  }
};
```

## Best Practices

### Provider Selection Guidelines

1. **Match Provider to Use Case**:
   - OpenAI: General purpose, creative writing
   - Anthropic: Professional writing, analysis
   - Gemini: Cost-effective, multimodal future
   - Local: Privacy, offline use

2. **Consider Cost vs Quality**:
   - High-volume, simple tasks: Cheaper models
   - Important documents: Premium models
   - Development/testing: Free tiers

3. **Plan for Reliability**:
   - Always have fallback providers
   - Monitor provider health
   - Implement retry logic

### Configuration Management

1. **Environment-Specific Configs**:
   - Development: Free/cheap providers
   - Production: Reliable, quality providers
   - Testing: Consistent, fast providers

2. **User Preference Handling**:
   - Allow user provider selection
   - Provide performance guidance
   - Enable easy switching

3. **Security Considerations**:
   - Secure API key storage
   - Rotate keys regularly
   - Monitor usage for anomalies

For more information, see:

- [Configuration Guide](../guides/configuration.md)
- [API Reference](../api/providers.md)
- [Development Examples](development.md)
