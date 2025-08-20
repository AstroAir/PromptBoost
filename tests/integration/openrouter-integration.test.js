/**
 * @fileoverview Integration tests for OpenRouter functionality
 * Tests the complete OpenRouter integration including OAuth PKCE flow,
 * authentication, model refresh, and API testing.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

describe('OpenRouter Integration Tests', () => {
  let page;
  let _extensionId;

  beforeAll(async () => {
    // These tests require a real browser environment with the extension loaded
    // They should be run manually or in a proper browser testing environment
    if (!global.integrationTestUtils) {
      console.warn('Integration test utilities not available. Skipping OpenRouter integration tests.');
      return;
    }

    _extensionId = await global.integrationTestUtils.getExtensionId();
    page = await global.integrationTestUtils.getOptionsPage();
  });

  afterAll(async () => {
    if (page) {
      await page.close();
    }
  });

  describe('OAuth PKCE Authentication Flow', () => {
    test('should initiate OAuth flow when quick login is clicked', async () => {
      if (!page) return;

      // Navigate to OpenRouter provider
      await page.select('#provider', 'openrouter');
      await page.waitForTimeout(500);

      // Check if quick login button is visible
      const quickLoginButton = await page.$('#quickLogin');
      expect(quickLoginButton).toBeTruthy();

      // Click quick login button
      await quickLoginButton.click();

      // Check if button state changes to "Authenticating..."
      const buttonText = await page.$eval('#quickLogin', el => el.textContent);
      expect(buttonText).toContain('Authenticating');

      // Check if status message appears
      const statusMessage = await page.$eval('.status-message', el => el.textContent);
      expect(statusMessage).toContain('Starting OpenRouter authentication');
    });

    test('should handle authentication timeout gracefully', async () => {
      if (!page) return;

      // Wait for timeout (this test assumes a shorter timeout for testing)
      await page.waitForTimeout(6000);

      // Check if timeout message appears
      const statusMessage = await page.$eval('.status-message', el => el.textContent);
      expect(statusMessage).toContain('timed out');

      // Check if button is re-enabled
      const isDisabled = await page.$eval('#quickLogin', el => el.disabled);
      expect(isDisabled).toBe(false);
    });
  });

  describe('Manual API Key Authentication', () => {
    test('should accept manual API key entry', async () => {
      if (!page) return;

      // Enter a test API key (this should be a valid test key)
      await page.type('#apiKey', 'sk-or-test-key-for-integration-testing');

      // Save settings
      await page.click('#saveButton');
      await page.waitForTimeout(1000);

      // Check if settings are saved
      const statusMessage = await page.$eval('.status-message', el => el.textContent);
      expect(statusMessage).toContain('saved');
    });

    test('should test API connection with manual key', async () => {
      if (!page) return;

      // Click test API button
      await page.click('#testApi');

      // Check if button state changes
      const buttonText = await page.$eval('#testApi', el => el.textContent);
      expect(buttonText).toContain('Testing');

      // Wait for test result
      await page.waitForTimeout(5000);

      // Check if test completes (success or failure)
      const finalButtonText = await page.$eval('#testApi', el => el.textContent);
      expect(finalButtonText).toBe('Test API');

      // Check if status message appears
      const statusMessage = await page.$eval('.status-message', el => el.textContent);
      expect(statusMessage).toMatch(/(successful|failed)/i);
    });
  });

  describe('Model List Refresh', () => {
    test('should refresh model list when button is clicked', async () => {
      if (!page) return;

      // Get initial model count
      const _initialOptions = await page.$$eval('#model option', options => options.length);

      // Click refresh models button
      await page.click('#refreshModels');

      // Check if button shows loading state
      const buttonText = await page.$eval('#refreshModels', el => el.textContent);
      expect(buttonText).toBe('⏳');

      // Wait for refresh to complete
      await page.waitForTimeout(5000);

      // Check if button is restored
      const finalButtonText = await page.$eval('#refreshModels', el => el.textContent);
      expect(finalButtonText).toBe('🔄');

      // Check if models were loaded (should have at least some models)
      const finalOptions = await page.$$eval('#model option', options => options.length);
      expect(finalOptions).toBeGreaterThan(0);
    });

    test('should show model information when model is selected', async () => {
      if (!page) return;

      // Select a model
      await page.select('#model', 'openai/gpt-4');
      await page.waitForTimeout(500);

      // Check if model info is displayed
      const modelInfo = await page.$('#modelInfo');
      const isVisible = await page.evaluate(el => {
        const style = window.getComputedStyle(el);
        return style.display !== 'none';
      }, modelInfo);

      expect(isVisible).toBe(true);
    });
  });

  describe('Provider Status Indicators', () => {
    test('should show correct provider status', async () => {
      if (!page) return;

      // Check if provider status element exists
      const statusElement = await page.$('#providerStatus');
      expect(statusElement).toBeTruthy();

      // Check if status dot has correct class
      const statusDot = await page.$('.status-dot');
      expect(statusDot).toBeTruthy();

      const statusClass = await page.$eval('.status-dot', el => el.className);
      expect(statusClass).toMatch(/status-(unknown|success|error|loading)/);
    });

    test('should update status during operations', async () => {
      if (!page) return;

      // Trigger an operation (test API)
      await page.click('#testApi');

      // Check if status changes to loading
      await page.waitForTimeout(500);
      const loadingStatus = await page.$eval('.status-dot', el => el.className);
      expect(loadingStatus).toContain('status-loading');

      // Wait for operation to complete
      await page.waitForTimeout(5000);

      // Check if status changes to success or error
      const finalStatus = await page.$eval('.status-dot', el => el.className);
      expect(finalStatus).toMatch(/status-(success|error)/);
    });
  });

  describe('Error Handling', () => {
    test('should handle invalid API key gracefully', async () => {
      if (!page) return;

      // Clear API key and enter invalid one
      await page.evaluate(() => document.getElementById('apiKey').value = '');
      await page.type('#apiKey', 'invalid-key');

      // Test API
      await page.click('#testApi');
      await page.waitForTimeout(3000);

      // Check for error message
      const statusMessage = await page.$eval('.status-message', el => el.textContent);
      expect(statusMessage).toMatch(/(failed|invalid|error)/i);

      // Check error status
      const statusClass = await page.$eval('.status-dot', el => el.className);
      expect(statusClass).toContain('status-error');
    });

    test('should handle network errors gracefully', async () => {
      if (!page) return;

      // This test would require mocking network requests or testing in offline mode
      // For now, we'll just verify that error handling UI elements exist
      const statusMessage = await page.$('.status-message');
      expect(statusMessage).toBeTruthy();

      const statusDot = await page.$('.status-dot');
      expect(statusDot).toBeTruthy();
    });
  });

  describe('Settings Persistence', () => {
    test('should persist OpenRouter settings across page reloads', async () => {
      if (!page) return;

      // Set OpenRouter as provider and add API key
      await page.select('#provider', 'openrouter');
      await page.evaluate(() => document.getElementById('apiKey').value = '');
      await page.type('#apiKey', 'sk-or-persistent-test-key');
      await page.click('#saveButton');
      await page.waitForTimeout(1000);

      // Reload page
      await page.reload();
      await page.waitForTimeout(2000);

      // Check if settings are restored
      const provider = await page.$eval('#provider', el => el.value);
      expect(provider).toBe('openrouter');

      const apiKey = await page.$eval('#apiKey', el => el.value);
      expect(apiKey).toBe('sk-or-persistent-test-key');
    });
  });

  describe('User Experience', () => {
    test('should provide clear feedback during all operations', async () => {
      if (!page) return;

      // Check if all necessary UI elements exist
      const quickLogin = await page.$('#quickLogin');
      const testApi = await page.$('#testApi');
      const refreshModels = await page.$('#refreshModels');
      const statusMessage = await page.$('.status-message');
      const providerStatus = await page.$('#providerStatus');

      expect(quickLogin).toBeTruthy();
      expect(testApi).toBeTruthy();
      expect(refreshModels).toBeTruthy();
      expect(statusMessage).toBeTruthy();
      expect(providerStatus).toBeTruthy();
    });

    test('should have accessible button states and labels', async () => {
      if (!page) return;

      // Check button accessibility
      const quickLoginText = await page.$eval('#quickLogin', el => el.textContent);
      expect(quickLoginText).toContain('Login with OpenRouter');

      const testApiText = await page.$eval('#testApi', el => el.textContent);
      expect(testApiText).toBe('Test API');

      const refreshModelsTitle = await page.$eval('#refreshModels', el => el.title);
      expect(refreshModelsTitle).toContain('Refresh');
    });
  });
});

// Helper function to run manual tests
function runManualTests() {
  console.log(`
Manual Testing Checklist for OpenRouter Integration:

1. OAuth PKCE Flow:
   - Open extension options page
   - Select OpenRouter provider
   - Click "Login with OpenRouter" button
   - Verify OAuth flow opens in new window
   - Complete authentication on OpenRouter website
   - Verify API key is populated in extension
   - Verify success message is shown

2. Model List Refresh:
   - After authentication, click refresh models button
   - Verify models are loaded from OpenRouter API
   - Verify model dropdown is populated with actual models
   - Select different models and verify model info is shown

3. API Testing:
   - Click "Test API" button
   - Verify test completes successfully
   - Verify appropriate success/error messages

4. Error Handling:
   - Test with invalid API key
   - Test with network disconnected
   - Verify appropriate error messages
   - Verify UI remains functional after errors

5. Settings Persistence:
   - Configure OpenRouter settings
   - Reload extension options page
   - Verify settings are preserved

Please run these tests manually in a real browser environment.
  `);
}

// Export for manual testing
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { runManualTests };
}
