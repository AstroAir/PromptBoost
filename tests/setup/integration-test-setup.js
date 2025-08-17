/**
 * Integration test specific setup
 * Configuration for end-to-end testing with Puppeteer
 */

const puppeteer = require('puppeteer');
const path = require('path');

// Global variables for integration tests
global.integrationTestUtils = {
  browser: null,
  page: null,
  extensionId: null,

  /**
   * Launch browser with extension loaded
   * @returns {Promise<void>}
   */
  async setupBrowser() {
    const extensionPath = path.resolve(__dirname, '../..');

    this.browser = await puppeteer.launch({
      headless: false, // Extensions require non-headless mode
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-web-security',
        '--allow-running-insecure-content'
      ]
    });

    // Get extension ID
    const targets = await this.browser.targets();
    const extensionTarget = targets.find(target =>
      target.type() === 'background_page' || target.type() === 'service_worker'
    );

    if (extensionTarget) {
      this.extensionId = extensionTarget.url().split('/')[2];
    }

    // Create a new page
    this.page = await this.browser.newPage();

    // Set viewport
    await this.page.setViewport({ width: 1280, height: 720 });
  },

  /**
   * Navigate to test page
   * @param {string} url - URL to navigate to
   * @returns {Promise<void>}
   */
  async navigateToTestPage(url = 'file://' + path.resolve(__dirname, '../../test.html')) {
    await this.page.goto(url, { waitUntil: 'networkidle0' });
  },

  /**
   * Get extension popup page
   * @returns {Promise<Page>} Popup page
   */
  async getPopupPage() {
    const popupUrl = `chrome-extension://${this.extensionId}/popup/popup.html`;
    const popupPage = await this.browser.newPage();
    await popupPage.goto(popupUrl);
    return popupPage;
  },

  /**
   * Get extension options page
   * @returns {Promise<Page>} Options page
   */
  async getOptionsPage() {
    const optionsUrl = `chrome-extension://${this.extensionId}/options/options.html`;
    const optionsPage = await this.browser.newPage();
    await optionsPage.goto(optionsUrl);
    return optionsPage;
  },

  /**
   * Simulate text selection on page
   * @param {string} selector - Element selector
   * @param {string} text - Text to select
   * @returns {Promise<void>}
   */
  async selectText(selector, text) {
    await this.page.evaluate((sel, txt) => {
      const element = document.querySelector(sel);
      if (element) {
        element.focus();
        if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
          element.value = txt;
          element.setSelectionRange(0, txt.length);
        } else {
          element.textContent = txt;
          const range = document.createRange();
          range.selectNodeContents(element);
          const selection = window.getSelection();
          selection.removeAllRanges();
          selection.addRange(range);
        }
      }
    }, selector, text);
  },

  /**
   * Simulate triple spacebar press
   * @returns {Promise<void>}
   */
  async tripleSpacebar() {
    const now = Date.now();
    await this.page.keyboard.press('Space');
    await this.page.waitForTimeout(100);
    await this.page.keyboard.press('Space');
    await this.page.waitForTimeout(100);
    await this.page.keyboard.press('Space');
  },

  /**
   * Wait for element to appear
   * @param {string} selector - Element selector
   * @param {number} timeout - Timeout in milliseconds
   * @returns {Promise<void>}
   */
  async waitForElement(selector, timeout = 5000) {
    await this.page.waitForSelector(selector, { timeout });
  },

  /**
   * Cleanup browser instance
   * @returns {Promise<void>}
   */
  async cleanup() {
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      this.page = null;
      this.extensionId = null;
    }
  }
};

// Setup and teardown for integration tests
beforeAll(async () => {
  await global.integrationTestUtils.setupBrowser();
}, 30000);

afterAll(async () => {
  await global.integrationTestUtils.cleanup();
}, 10000);
