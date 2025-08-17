# Development Examples

This guide provides practical examples for developers working on PromptBoost, including extension development, testing, debugging, and contribution workflows.

## Extension Development Examples

### Adding a New Feature

#### Example: Adding Word Count Display

**1. Content Script Modification**
```javascript
// content.js - Add word count functionality
class PromptBoostContent {
  constructor() {
    this.wordCountEnabled = false;
    // ... existing constructor code
  }

  showWordCount(text) {
    if (!this.wordCountEnabled) return;
    
    const wordCount = text.split(/\s+/).filter(word => word.length > 0).length;
    const charCount = text.length;
    
    this.showNotification(
      `Selected: ${wordCount} words, ${charCount} characters`,
      'info'
    );
  }

  getSelectedText() {
    const text = // ... existing selection logic
    
    // Show word count for selected text
    if (text) {
      this.showWordCount(text);
    }
    
    return text;
  }
}
```

**2. Options Page Integration**
```javascript
// options.js - Add word count setting
class PromptBoostOptions {
  async loadSettings() {
    const settings = await chrome.storage.sync.get();
    
    // ... existing settings loading
    
    // Load word count setting
    document.getElementById('wordCountEnabled').checked = 
      settings.wordCountEnabled || false;
  }

  async saveSettings() {
    const settings = {
      // ... existing settings
      wordCountEnabled: document.getElementById('wordCountEnabled').checked
    };
    
    await chrome.storage.sync.set(settings);
  }
}
```

**3. HTML Template Addition**
```html
<!-- options.html - Add word count option -->
<div class="setting-group">
  <label class="setting-label">
    <input type="checkbox" id="wordCountEnabled">
    Show word count for selected text
  </label>
  <p class="setting-description">
    Display word and character count when text is selected
  </p>
</div>
```

### Creating a New Service

#### Example: Analytics Service

**1. Service Implementation**
```javascript
// services/AnalyticsService.js
class AnalyticsService {
  constructor() {
    this.events = [];
    this.maxEvents = 1000;
    this.initialized = false;
  }

  async initialize() {
    if (this.initialized) return;
    
    // Load existing analytics data
    const data = await chrome.storage.local.get('analyticsData');
    this.events = data.analyticsData || [];
    
    this.initialized = true;
    console.log('AnalyticsService initialized');
  }

  trackEvent(eventType, data = {}) {
    const event = {
      id: this.generateEventId(),
      type: eventType,
      timestamp: Date.now(),
      data: data
    };

    this.events.push(event);
    
    // Maintain max events limit
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }

    // Save to storage
    this.saveEvents();
    
    console.log('Analytics event tracked:', event);
  }

  async getAnalytics(timeRange = '7d') {
    const cutoffTime = this.getTimeRangeCutoff(timeRange);
    const recentEvents = this.events.filter(event => 
      event.timestamp >= cutoffTime
    );

    return {
      totalEvents: recentEvents.length,
      eventsByType: this.groupEventsByType(recentEvents),
      timeRange: timeRange,
      generatedAt: Date.now()
    };
  }

  generateEventId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  getTimeRangeCutoff(timeRange) {
    const now = Date.now();
    const ranges = {
      '1d': 24 * 60 * 60 * 1000,
      '7d': 7 * 24 * 60 * 60 * 1000,
      '30d': 30 * 24 * 60 * 60 * 1000
    };
    
    return now - (ranges[timeRange] || ranges['7d']);
  }

  groupEventsByType(events) {
    return events.reduce((acc, event) => {
      acc[event.type] = (acc[event.type] || 0) + 1;
      return acc;
    }, {});
  }

  async saveEvents() {
    await chrome.storage.local.set({ analyticsData: this.events });
  }
}

// Export singleton instance
const analyticsService = new AnalyticsService();
export default analyticsService;
```

**2. Service Integration**
```javascript
// background.js - Integrate analytics service
import analyticsService from './services/AnalyticsService.js';

class PromptBoostBackground {
  async initialize() {
    // ... existing initialization
    
    // Initialize analytics service
    await analyticsService.initialize();
    
    // Track extension startup
    analyticsService.trackEvent('extension_started', {
      version: chrome.runtime.getManifest().version
    });
  }

  async handleOptimizeText(message, sender) {
    // Track optimization attempt
    analyticsService.trackEvent('optimization_started', {
      provider: message.settings.provider,
      templateId: message.templateId,
      textLength: message.text.length
    });

    try {
      const result = await this.callLLMAPI(message.text, message.settings);
      
      // Track successful optimization
      analyticsService.trackEvent('optimization_completed', {
        provider: message.settings.provider,
        success: true,
        responseLength: result.length
      });
      
      return result;
    } catch (error) {
      // Track failed optimization
      analyticsService.trackEvent('optimization_failed', {
        provider: message.settings.provider,
        error: error.message
      });
      
      throw error;
    }
  }
}
```

### Adding Provider Support

#### Example: Adding Cohere Provider

**1. Provider Implementation**
```javascript
// providers/cohere/CohereProvider.js
import { Provider } from '../base/Provider.js';

class CohereProvider extends Provider {
  constructor(config) {
    super(config);
    this.name = 'cohere';
    this.displayName = 'Cohere';
    this.baseURL = 'https://api.cohere.ai/v1';
  }

  async authenticate(credentials) {
    try {
      const response = await fetch(`${this.baseURL}/check-api-key`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${credentials.apiKey}`,
          'Content-Type': 'application/json'
        }
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

  async callAPI(prompt, options = {}) {
    const requestBody = {
      model: this.config.model || 'command',
      prompt: prompt,
      max_tokens: options.maxTokens || 1000,
      temperature: options.temperature || 0.7,
      k: options.topK || 0,
      p: options.topP || 0.75,
      frequency_penalty: options.frequencyPenalty || 0,
      presence_penalty: options.presencePenalty || 0
    };

    const response = await fetch(`${this.baseURL}/generate`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'PromptBoost/2.0'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(`Cohere API error: ${error.message}`);
    }

    const data = await response.json();
    return data.generations[0].text.trim();
  }

  validateConfig(config) {
    const errors = [];
    
    if (!config.apiKey || !config.apiKey.startsWith('co-')) {
      errors.push('Valid Cohere API key is required (starts with "co-")');
    }
    
    if (config.model && !this.getAvailableModels().find(m => m.id === config.model)) {
      errors.push('Invalid model selected');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  getDefaultModel() {
    return 'command';
  }

  getAvailableModels() {
    return [
      {
        id: 'command',
        name: 'Command',
        description: 'Cohere\'s flagship model for text generation'
      },
      {
        id: 'command-light',
        name: 'Command Light',
        description: 'Faster, lighter version of Command'
      },
      {
        id: 'command-nightly',
        name: 'Command Nightly',
        description: 'Latest experimental version'
      }
    ];
  }

  getConfigSchema() {
    return {
      apiKey: {
        type: 'password',
        required: true,
        label: 'API Key',
        description: 'Your Cohere API key (starts with "co-")',
        placeholder: 'co-...'
      },
      model: {
        type: 'select',
        required: true,
        label: 'Model',
        description: 'Cohere model to use',
        options: this.getAvailableModels(),
        default: 'command'
      }
    };
  }
}

export default CohereProvider;
```

**2. Provider Registration**
```javascript
// providers/index.js - Register new provider
import CohereProvider from './cohere/CohereProvider.js';

// Register Cohere provider
providerRegistry.register('cohere', CohereProvider, {
  displayName: 'Cohere',
  description: 'Cohere Command models for text generation',
  category: 'cloud',
  icon: 'cohere-icon.png',
  website: 'https://cohere.ai',
  documentation: 'https://docs.cohere.ai'
});
```

## Testing Examples

### Unit Testing

#### Example: Testing Template Manager

```javascript
// tests/unit/TemplateManager.test.js
import { TemplateManager } from '../../services/TemplateManager.js';
import { mockChromeStorage } from '../mocks/chrome-storage.js';

describe('TemplateManager', () => {
  let templateManager;

  beforeEach(async () => {
    // Mock Chrome storage
    global.chrome = mockChromeStorage();
    
    templateManager = new TemplateManager();
    await templateManager.initialize();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createTemplate', () => {
    test('should create a new template with valid data', async () => {
      const templateData = {
        name: 'Test Template',
        description: 'A test template',
        category: 'general',
        template: 'Please improve: {text}'
      };

      const result = await templateManager.createTemplate(templateData);

      expect(result).toHaveProperty('id');
      expect(result.name).toBe('Test Template');
      expect(result.isCustom).toBe(true);
      expect(result.version).toBe(1);
    });

    test('should reject template without {text} placeholder', async () => {
      const templateData = {
        name: 'Invalid Template',
        description: 'Missing placeholder',
        category: 'general',
        template: 'Please improve this text'
      };

      await expect(templateManager.createTemplate(templateData))
        .rejects.toThrow('Template must contain {text} placeholder');
    });

    test('should validate template name length', async () => {
      const templateData = {
        name: '', // Empty name
        description: 'Test description',
        category: 'general',
        template: 'Please improve: {text}'
      };

      await expect(templateManager.createTemplate(templateData))
        .rejects.toThrow('Template name is required');
    });
  });

  describe('getTemplate', () => {
    test('should retrieve existing template', async () => {
      // Create a template first
      const templateData = {
        name: 'Retrieve Test',
        description: 'Test retrieval',
        category: 'general',
        template: 'Test: {text}'
      };

      const created = await templateManager.createTemplate(templateData);
      const retrieved = templateManager.getTemplate(created.id);

      expect(retrieved).toEqual(created);
    });

    test('should return null for non-existent template', () => {
      const result = templateManager.getTemplate('non-existent-id');
      expect(result).toBeNull();
    });
  });
});
```

#### Example: Testing Provider

```javascript
// tests/unit/OpenAIProvider.test.js
import OpenAIProvider from '../../providers/openai/OpenAIProvider.js';

describe('OpenAIProvider', () => {
  let provider;
  let mockFetch;

  beforeEach(() => {
    mockFetch = jest.fn();
    global.fetch = mockFetch;

    provider = new OpenAIProvider({
      apiKey: 'sk-test-key',
      model: 'gpt-3.5-turbo'
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('callAPI', () => {
    test('should make successful API call', async () => {
      const mockResponse = {
        choices: [{
          message: {
            content: 'Improved text here'
          }
        }]
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });

      const result = await provider.callAPI('Test prompt');

      expect(result).toBe('Improved text here');
      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.openai.com/v1/chat/completions',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': 'Bearer sk-test-key'
          })
        })
      );
    });

    test('should handle API errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: { message: 'Invalid API key' } })
      });

      await expect(provider.callAPI('Test prompt'))
        .rejects.toThrow('OpenAI API error: Invalid API key');
    });
  });

  describe('validateConfig', () => {
    test('should validate correct configuration', () => {
      const config = {
        apiKey: 'sk-valid-key-here',
        model: 'gpt-3.5-turbo'
      };

      const result = provider.validateConfig(config);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    test('should reject invalid API key format', () => {
      const config = {
        apiKey: 'invalid-key',
        model: 'gpt-3.5-turbo'
      };

      const result = provider.validateConfig(config);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Invalid OpenAI API key format');
    });
  });
});
```

### Integration Testing

#### Example: End-to-End Workflow Test

```javascript
// tests/integration/optimization-workflow.test.js
import puppeteer from 'puppeteer';
import path from 'path';

describe('Optimization Workflow Integration', () => {
  let browser, page;

  beforeAll(async () => {
    browser = await puppeteer.launch({
      headless: false,
      args: [
        `--load-extension=${path.resolve(__dirname, '../../')}`,
        '--disable-extensions-except=' + path.resolve(__dirname, '../../')
      ]
    });

    page = await browser.newPage();
  });

  afterAll(async () => {
    await browser.close();
  });

  test('should complete full optimization workflow', async () => {
    // Navigate to test page
    await page.goto(`file://${path.resolve(__dirname, '../fixtures/test.html')}`);

    // Configure extension with test API key
    await page.evaluate(() => {
      chrome.storage.sync.set({
        enabled: true,
        provider: 'openai',
        apiKey: 'sk-test-key-for-integration',
        model: 'gpt-3.5-turbo'
      });
    });

    // Type test text
    await page.type('#test-textarea', 'hello world this is test text');

    // Select all text
    await page.click('#test-textarea');
    await page.keyboard.down('Control');
    await page.keyboard.press('KeyA');
    await page.keyboard.up('Control');

    // Trigger optimization with triple spacebar
    await page.keyboard.press('Space');
    await page.keyboard.press('Space');
    await page.keyboard.press('Space');

    // Wait for optimization to complete
    await page.waitForFunction(() => {
      const textarea = document.querySelector('#test-textarea');
      return textarea.value !== 'hello world this is test text';
    }, { timeout: 10000 });

    // Verify text was optimized
    const optimizedText = await page.$eval('#test-textarea', el => el.value);
    expect(optimizedText).not.toBe('hello world this is test text');
    expect(optimizedText.length).toBeGreaterThan(0);
  });

  test('should show error for invalid API key', async () => {
    // Set invalid API key
    await page.evaluate(() => {
      chrome.storage.sync.set({
        enabled: true,
        provider: 'openai',
        apiKey: 'invalid-key',
        model: 'gpt-3.5-turbo'
      });
    });

    // Try optimization
    await page.type('#test-textarea', 'test text for error');
    await page.selectAll('#test-textarea');
    
    // Trigger optimization
    await page.keyboard.press('Space');
    await page.keyboard.press('Space');
    await page.keyboard.press('Space');

    // Wait for error notification
    await page.waitForSelector('.promptboost-notification.error', {
      timeout: 10000
    });

    const errorMessage = await page.$eval(
      '.promptboost-notification.error',
      el => el.textContent
    );

    expect(errorMessage).toContain('API');
  });
});
```

## Debugging Examples

### Console Debugging

#### Example: Debug Logging System

```javascript
// utils/Logger.js - Enhanced logging for debugging
class Logger {
  constructor(component) {
    this.component = component;
    this.debugEnabled = false;
    this.logLevel = 'info';
    this.logs = [];
    
    this.loadSettings();
  }

  async loadSettings() {
    const settings = await chrome.storage.sync.get(['debugLogging', 'logLevel']);
    this.debugEnabled = settings.debugLogging || false;
    this.logLevel = settings.logLevel || 'info';
  }

  debug(message, data = null) {
    if (this.debugEnabled) {
      this.log('debug', message, data);
    }
  }

  info(message, data = null) {
    this.log('info', message, data);
  }

  warn(message, data = null) {
    this.log('warn', message, data);
  }

  error(message, error = null) {
    this.log('error', message, error);
  }

  log(level, message, data) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      component: this.component,
      level: level,
      message: message,
      data: data
    };

    // Add to internal log storage
    this.logs.push(logEntry);
    
    // Keep only last 1000 logs
    if (this.logs.length > 1000) {
      this.logs = this.logs.slice(-1000);
    }

    // Console output with formatting
    const prefix = `[${logEntry.timestamp}] [${this.component}] [${level.toUpperCase()}]`;
    
    switch (level) {
      case 'debug':
        console.debug(prefix, message, data);
        break;
      case 'info':
        console.info(prefix, message, data);
        break;
      case 'warn':
        console.warn(prefix, message, data);
        break;
      case 'error':
        console.error(prefix, message, data);
        break;
    }
  }

  // Export logs for debugging
  exportLogs() {
    return {
      component: this.component,
      logs: this.logs,
      exportedAt: new Date().toISOString()
    };
  }

  // Performance timing
  startTiming(operation) {
    this.timers = this.timers || {};
    this.timers[operation] = performance.now();
    this.debug(`Started timing: ${operation}`);
  }

  endTiming(operation) {
    if (this.timers && this.timers[operation]) {
      const duration = performance.now() - this.timers[operation];
      this.info(`${operation} completed in ${duration.toFixed(2)}ms`);
      delete this.timers[operation];
      return duration;
    }
  }
}

// Usage in components
const logger = new Logger('PromptBoostBackground');

// Debug API calls
logger.startTiming('api_call');
try {
  const result = await this.callLLMAPI(text, settings);
  logger.endTiming('api_call');
  logger.debug('API call successful', { textLength: text.length, resultLength: result.length });
} catch (error) {
  logger.endTiming('api_call');
  logger.error('API call failed', error);
}
```

### Performance Debugging

#### Example: Performance Monitor

```javascript
// utils/PerformanceMonitor.js
class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.enabled = false;
  }

  enable() {
    this.enabled = true;
    console.log('Performance monitoring enabled');
  }

  disable() {
    this.enabled = false;
    console.log('Performance monitoring disabled');
  }

  startMeasure(name) {
    if (!this.enabled) return;
    
    performance.mark(`${name}-start`);
  }

  endMeasure(name) {
    if (!this.enabled) return;
    
    performance.mark(`${name}-end`);
    performance.measure(name, `${name}-start`, `${name}-end`);
    
    const measure = performance.getEntriesByName(name)[0];
    this.recordMetric(name, measure.duration);
    
    return measure.duration;
  }

  recordMetric(name, value) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    
    const values = this.metrics.get(name);
    values.push({
      value: value,
      timestamp: Date.now()
    });
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.splice(0, values.length - 100);
    }
  }

  getMetrics(name) {
    const values = this.metrics.get(name) || [];
    
    if (values.length === 0) {
      return null;
    }
    
    const nums = values.map(v => v.value);
    
    return {
      count: nums.length,
      average: nums.reduce((a, b) => a + b, 0) / nums.length,
      min: Math.min(...nums),
      max: Math.max(...nums),
      latest: nums[nums.length - 1]
    };
  }

  getAllMetrics() {
    const result = {};
    
    for (const [name] of this.metrics) {
      result[name] = this.getMetrics(name);
    }
    
    return result;
  }

  exportMetrics() {
    return {
      metrics: this.getAllMetrics(),
      rawData: Object.fromEntries(this.metrics),
      exportedAt: new Date().toISOString()
    };
  }
}

// Global performance monitor
const perfMonitor = new PerformanceMonitor();

// Usage example
perfMonitor.enable();

// In API call
perfMonitor.startMeasure('openai_api_call');
const result = await fetch(/* ... */);
const duration = perfMonitor.endMeasure('openai_api_call');

console.log(`API call took ${duration}ms`);
console.log('All metrics:', perfMonitor.getAllMetrics());
```

## Build and Deployment Examples

### Build Script Example

```javascript
// scripts/build.js
const fs = require('fs');
const path = require('path');
const archiver = require('archiver');

class ExtensionBuilder {
  constructor() {
    this.sourceDir = path.resolve(__dirname, '..');
    this.buildDir = path.resolve(__dirname, '../build');
    this.distDir = path.resolve(__dirname, '../dist');
  }

  async build() {
    console.log('Building PromptBoost extension...');
    
    // Clean build directory
    await this.cleanBuildDir();
    
    // Copy source files
    await this.copySourceFiles();
    
    // Process manifest
    await this.processManifest();
    
    // Minify if production
    if (process.env.NODE_ENV === 'production') {
      await this.minifyFiles();
    }
    
    // Create distribution package
    await this.createDistPackage();
    
    console.log('Build completed successfully!');
  }

  async cleanBuildDir() {
    if (fs.existsSync(this.buildDir)) {
      fs.rmSync(this.buildDir, { recursive: true });
    }
    fs.mkdirSync(this.buildDir, { recursive: true });
  }

  async copySourceFiles() {
    const filesToCopy = [
      'manifest.json',
      'background.js',
      'content.js',
      'content.css',
      'popup/',
      'options/',
      'icons/',
      'services/',
      'providers/',
      'utils/',
      'templates/'
    ];

    for (const file of filesToCopy) {
      const sourcePath = path.join(this.sourceDir, file);
      const destPath = path.join(this.buildDir, file);
      
      if (fs.statSync(sourcePath).isDirectory()) {
        fs.cpSync(sourcePath, destPath, { recursive: true });
      } else {
        fs.copyFileSync(sourcePath, destPath);
      }
    }
  }

  async processManifest() {
    const manifestPath = path.join(this.buildDir, 'manifest.json');
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    
    // Update version if specified
    if (process.env.VERSION) {
      manifest.version = process.env.VERSION;
    }
    
    // Remove development-only permissions in production
    if (process.env.NODE_ENV === 'production') {
      manifest.permissions = manifest.permissions.filter(
        perm => !perm.includes('localhost')
      );
    }
    
    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
  }

  async createDistPackage() {
    if (!fs.existsSync(this.distDir)) {
      fs.mkdirSync(this.distDir, { recursive: true });
    }

    const output = fs.createWriteStream(
      path.join(this.distDir, 'promptboost-extension.zip')
    );
    
    const archive = archiver('zip', { zlib: { level: 9 } });
    
    return new Promise((resolve, reject) => {
      output.on('close', resolve);
      archive.on('error', reject);
      
      archive.pipe(output);
      archive.directory(this.buildDir, false);
      archive.finalize();
    });
  }
}

// Run build
const builder = new ExtensionBuilder();
builder.build().catch(console.error);
```

### Development Server Example

```javascript
// scripts/dev-server.js
const express = require('express');
const cors = require('cors');
const chokidar = require('chokidar');

class DevServer {
  constructor() {
    this.app = express();
    this.port = 3000;
    this.setupMiddleware();
    this.setupRoutes();
    this.setupFileWatcher();
  }

  setupMiddleware() {
    this.app.use(cors());
    this.app.use(express.json());
    this.app.use(express.static('public'));
  }

  setupRoutes() {
    // Mock API endpoints for testing
    this.app.post('/api/test-openai', (req, res) => {
      setTimeout(() => {
        res.json({
          choices: [{
            message: {
              content: `Improved version: ${req.body.messages[0].content}`
            }
          }]
        });
      }, 1000);
    });

    // Extension reload endpoint
    this.app.post('/api/reload-extension', (req, res) => {
      console.log('Extension reload requested');
      res.json({ success: true });
    });

    // Health check
    this.app.get('/api/health', (req, res) => {
      res.json({ status: 'ok', timestamp: Date.now() });
    });
  }

  setupFileWatcher() {
    const watcher = chokidar.watch([
      'background.js',
      'content.js',
      'popup/**/*',
      'options/**/*',
      'services/**/*',
      'providers/**/*'
    ]);

    watcher.on('change', (path) => {
      console.log(`File changed: ${path}`);
      // Could trigger extension reload here
    });
  }

  start() {
    this.app.listen(this.port, () => {
      console.log(`Development server running on http://localhost:${this.port}`);
    });
  }
}

const server = new DevServer();
server.start();
```

For more development information, see:
- [Development Setup](../development/setup.md)
- [Contributing Guidelines](../development/contributing.md)
- [Testing Documentation](../development/testing.md)
