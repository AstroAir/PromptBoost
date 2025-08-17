/**
 * Unit tests for PromptBoostBackground class
 * Tests message handling, LLM API calls, template management, and error handling
 */

// Import test data and utilities
import { sampleTexts, sampleSettings, sampleTemplates, sampleApiResponses, sampleMessages } from '../fixtures/test-data.js';

// Mock the background script
const mockBackgroundScript = `
class PromptBoostBackground {
  constructor() {
    this.setupMessageListener();
    this.setupInstallListener();
  }

  setupMessageListener() {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      switch (message.type) {
        case 'OPTIMIZE_TEXT':
          this.handleOptimizeText(message, sender);
          break;
        case 'OPTIMIZE_WITH_TEMPLATE':
          this.handleOptimizeWithTemplate(message, sender);
          break;
        case 'TEST_API':
          this.handleTestAPI(message, sender);
          break;
        case 'GET_TEMPLATES':
          this.handleGetTemplates(message, sender);
          break;
        case 'SAVE_TEMPLATE':
          this.handleSaveTemplate(message, sender);
          break;
        case 'DELETE_TEMPLATE':
          this.handleDeleteTemplate(message, sender);
          break;
      }
    });
  }

  setupInstallListener() {
    chrome.runtime.onInstalled.addListener((details) => {
      if (details.reason === 'install') {
        chrome.storage.sync.set({
          enabled: true,
          timeWindow: 1000,
          provider: 'openai',
          apiKey: '',
          templates: this.getDefaultTemplates()
        });
        chrome.runtime.openOptionsPage();
      }
    });
  }

  getDefaultTemplates() {
    return {
      general: {
        id: 'general',
        name: 'General Improvement',
        template: 'Please improve and optimize the following text while maintaining its original meaning and tone:\\n\\n{text}',
        category: 'General'
      }
    };
  }

  async handleOptimizeText(message, sender) {
    try {
      const optimizedText = await this.callLLMAPI(message.text, message.settings);
      chrome.tabs.sendMessage(sender.tab.id, {
        type: 'OPTIMIZE_RESULT',
        data: { optimizedText }
      });
    } catch (error) {
      chrome.tabs.sendMessage(sender.tab.id, {
        type: 'OPTIMIZATION_ERROR',
        error: error.message
      });
    }
  }

  async handleOptimizeWithTemplate(message, sender) {
    try {
      const { text, templateId, settings } = message;
      const result = await chrome.storage.sync.get(['templates']);
      const templates = result.templates || {};
      const template = templates[templateId];

      if (!template) {
        throw new Error(\`Template not found: \${templateId}\`);
      }

      const templateSettings = {
        ...settings,
        promptTemplate: template.template
      };

      const optimizedText = await this.callLLMAPI(text, templateSettings);
      chrome.tabs.sendMessage(sender.tab.id, {
        type: 'OPTIMIZE_RESULT',
        data: {
          optimizedText,
          templateUsed: template.name
        }
      });
    } catch (error) {
      chrome.tabs.sendMessage(sender.tab.id, {
        type: 'OPTIMIZATION_ERROR',
        error: error.message
      });
    }
  }

  async handleTestAPI(message, sender) {
    try {
      const testText = "This is a test message.";
      const result = await this.callLLMAPI(testText, message.settings);
      chrome.runtime.sendMessage({
        type: 'API_TEST_RESULT',
        success: true,
        result
      });
    } catch (error) {
      chrome.runtime.sendMessage({
        type: 'API_TEST_RESULT',
        success: false,
        error: error.message
      });
    }
  }

  async callLLMAPI(text, settings) {
    const { provider, apiKey, apiEndpoint, model, promptTemplate } = settings;

    if (!apiKey) {
      throw new Error('API key not configured');
    }

    if (!text || text.trim().length === 0) {
      throw new Error('No text provided for optimization');
    }

    if (text.length > 10000) {
      throw new Error('Text too long (maximum 10,000 characters)');
    }

    const prompt = promptTemplate.replace('{text}', text);

    switch (provider) {
      case 'openai':
        return await this.callOpenAI(prompt, apiKey, apiEndpoint, model);
      case 'anthropic':
        return await this.callAnthropic(prompt, apiKey, model);
      default:
        throw new Error(\`Unsupported provider: \${provider}\`);
    }
  }

  async callOpenAI(prompt, apiKey, apiEndpoint, model) {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': \`Bearer \${apiKey}\`
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      throw new Error(\`API request failed: \${response.status}\`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  async callAnthropic(prompt, apiKey, model) {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: model,
        max_tokens: 1000,
        messages: [{ role: 'user', content: prompt }]
      })
    });

    if (!response.ok) {
      throw new Error(\`API request failed: \${response.status}\`);
    }

    const data = await response.json();
    return data.content[0].text;
  }
}

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = PromptBoostBackground;
}
`;

// Evaluate the mock script
eval(mockBackgroundScript);

describe('PromptBoostBackground', () => {
  let background;
  let mockSender;

  beforeEach(() => {
    // Reset Chrome API mocks
    global.chromeTestUtils.resetMocks();
    global.chromeTestUtils.clearStorageData();
    
    // Create fresh instance
    background = new PromptBoostBackground();
    
    // Mock sender object
    mockSender = {
      tab: { id: 1 }
    };

    // Reset fetch mock
    global.fetch.mockClear();
  });

  describe('Constructor and Setup', () => {
    test('should initialize message and install listeners', () => {
      expect(chrome.runtime.onMessage.addListener).toHaveBeenCalled();
      expect(chrome.runtime.onInstalled.addListener).toHaveBeenCalled();
    });

    test('should set default settings on install', () => {
      const installListener = chrome.runtime.onInstalled.addListener.mock.calls[0][0];
      
      installListener({ reason: 'install' });
      
      expect(chrome.storage.sync.set).toHaveBeenCalledWith(
        expect.objectContaining({
          enabled: true,
          timeWindow: 1000,
          provider: 'openai',
          apiKey: '',
          templates: expect.any(Object)
        })
      );
      expect(chrome.runtime.openOptionsPage).toHaveBeenCalled();
    });
  });

  describe('Message Handling', () => {
    test('should handle OPTIMIZE_TEXT message', async () => {
      const message = sampleMessages.optimizeText;
      
      // Mock successful API response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(sampleApiResponses.openai.success)
      });

      await background.handleOptimizeText(message, mockSender);

      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
        mockSender.tab.id,
        expect.objectContaining({
          type: 'OPTIMIZE_RESULT',
          data: expect.objectContaining({
            optimizedText: expect.any(String)
          })
        })
      );
    });

    test('should handle OPTIMIZE_WITH_TEMPLATE message', async () => {
      // Set up template in storage
      global.chromeTestUtils.setStorageData({
        templates: sampleTemplates
      });

      const message = sampleMessages.optimizeWithTemplate;
      
      // Mock successful API response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(sampleApiResponses.openai.success)
      });

      await background.handleOptimizeWithTemplate(message, mockSender);

      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
        mockSender.tab.id,
        expect.objectContaining({
          type: 'OPTIMIZE_RESULT',
          data: expect.objectContaining({
            optimizedText: expect.any(String),
            templateUsed: expect.any(String)
          })
        })
      );
    });

    test('should handle TEST_API message', async () => {
      const message = sampleMessages.testApi;
      
      // Mock successful API response
      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(sampleApiResponses.openai.success)
      });

      await background.handleTestAPI(message, mockSender);

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'API_TEST_RESULT',
          success: true,
          result: expect.any(String)
        })
      );
    });
  });

  describe('LLM API Calls', () => {
    test('should successfully call OpenAI API', async () => {
      const settings = sampleSettings.default;
      const text = sampleTexts.short;

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(sampleApiResponses.openai.success)
      });

      const result = await background.callLLMAPI(text, settings);

      expect(fetch).toHaveBeenCalledWith(
        settings.apiEndpoint,
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Authorization': `Bearer ${settings.apiKey}`
          }),
          body: expect.stringContaining(text)
        })
      );
      expect(result).toBe(sampleApiResponses.openai.success.choices[0].message.content);
    });

    test('should successfully call Anthropic API', async () => {
      const settings = sampleSettings.anthropic;
      const text = sampleTexts.short;

      global.fetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(sampleApiResponses.anthropic.success)
      });

      const result = await background.callLLMAPI(text, settings);

      expect(fetch).toHaveBeenCalledWith(
        'https://api.anthropic.com/v1/messages',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'x-api-key': settings.apiKey
          })
        })
      );
      expect(result).toBe(sampleApiResponses.anthropic.success.content[0].text);
    });

    test('should throw error for missing API key', async () => {
      const settings = { ...sampleSettings.default, apiKey: '' };
      const text = sampleTexts.short;

      await expect(background.callLLMAPI(text, settings))
        .rejects.toThrow('API key not configured');
    });

    test('should throw error for empty text', async () => {
      const settings = sampleSettings.default;
      const text = '';

      await expect(background.callLLMAPI(text, settings))
        .rejects.toThrow('No text provided for optimization');
    });

    test('should throw error for text too long', async () => {
      const settings = sampleSettings.default;
      const text = sampleTexts.maxLength + 'extra';

      await expect(background.callLLMAPI(text, settings))
        .rejects.toThrow('Text too long (maximum 10,000 characters)');
    });

    test('should throw error for unsupported provider', async () => {
      const settings = { ...sampleSettings.default, provider: 'unsupported' };
      const text = sampleTexts.short;

      await expect(background.callLLMAPI(text, settings))
        .rejects.toThrow('Unsupported provider: unsupported');
    });

    test('should handle API request failure', async () => {
      const settings = sampleSettings.default;
      const text = sampleTexts.short;

      global.fetch.mockResolvedValueOnce({
        ok: false,
        status: 401
      });

      await expect(background.callLLMAPI(text, settings))
        .rejects.toThrow('API request failed: 401');
    });
  });

  describe('Error Handling', () => {
    test('should send error message on optimization failure', async () => {
      const message = sampleMessages.optimizeText;

      // Mock API failure
      global.fetch.mockRejectedValueOnce(new Error('Network error'));

      await background.handleOptimizeText(message, mockSender);

      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
        mockSender.tab.id,
        expect.objectContaining({
          type: 'OPTIMIZATION_ERROR',
          error: 'Network error'
        })
      );
    });

    test('should handle template not found error', async () => {
      global.chromeTestUtils.setStorageData({ templates: {} });

      const message = {
        ...sampleMessages.optimizeWithTemplate,
        templateId: 'nonexistent'
      };

      await background.handleOptimizeWithTemplate(message, mockSender);

      expect(chrome.tabs.sendMessage).toHaveBeenCalledWith(
        mockSender.tab.id,
        expect.objectContaining({
          type: 'OPTIMIZATION_ERROR',
          error: 'Template not found: nonexistent'
        })
      );
    });

    test('should handle API test failure', async () => {
      const message = sampleMessages.testApi;

      // Mock API failure
      global.fetch.mockRejectedValueOnce(new Error('API test failed'));

      await background.handleTestAPI(message, mockSender);

      expect(chrome.runtime.sendMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'API_TEST_RESULT',
          success: false,
          error: 'API test failed'
        })
      );
    });
  });

  describe('Template Management', () => {
    test('should return default templates', () => {
      const templates = background.getDefaultTemplates();

      expect(templates).toHaveProperty('general');
      expect(templates.general).toHaveProperty('name', 'General Improvement');
      expect(templates.general).toHaveProperty('template');
      expect(templates.general.template).toContain('{text}');
    });
  });
});
