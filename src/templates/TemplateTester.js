/**
 * @fileoverview Template Testing Framework for PromptBoost
 * Provides comprehensive testing capabilities for templates including
 * validation, performance testing, and quality assessment.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

/**
 * Test result structure
 * @typedef {Object} TestResult
 * @property {boolean} passed - Whether test passed
 * @property {string} testName - Name of the test
 * @property {number} score - Test score (0-100)
 * @property {Array<string>} errors - Test errors
 * @property {Array<string>} warnings - Test warnings
 * @property {Object} metrics - Test metrics
 * @property {number} duration - Test duration in ms
 */

/**
 * Template testing framework
 * @class TemplateTester
 */
class TemplateTester {
  /**
   * Creates TemplateTester instance
   * 
   * @constructor
   * @param {Object} options - Testing options
   * @param {Array<string>} [options.testSamples] - Sample texts for testing
   * @param {Object} [options.providers] - Available providers for testing
   */
  constructor(options = {}) {
    this.logger = new Logger('TemplateTester');
    this.testSamples = options.testSamples || this.getDefaultTestSamples();
    this.providers = options.providers || {};
    this.validator = new TemplateValidator();
  }

  /**
   * Gets default test samples
   * 
   * @method getDefaultTestSamples
   * @returns {Array<Object>} Default test samples
   */
  getDefaultTestSamples() {
    return [
      {
        name: 'Short Text',
        text: 'This is a short test.',
        category: 'short'
      },
      {
        name: 'Medium Text',
        text: 'This is a medium length text that contains multiple sentences. It should be long enough to test template behavior with more substantial content.',
        category: 'medium'
      },
      {
        name: 'Long Text',
        text: 'This is a much longer text sample that spans multiple paragraphs and contains various types of content. It includes different sentence structures, punctuation marks, and should thoroughly test how the template handles substantial amounts of text. This type of content is typical of what users might want to optimize in real-world scenarios.',
        category: 'long'
      },
      {
        name: 'Technical Text',
        text: 'The API endpoint returns a JSON response with status code 200. The response includes user data, authentication tokens, and metadata.',
        category: 'technical'
      },
      {
        name: 'Creative Text',
        text: 'The sunset painted the sky in brilliant shades of orange and pink, casting a warm glow over the peaceful meadow.',
        category: 'creative'
      }
    ];
  }

  /**
   * Runs comprehensive tests on a template
   * 
   * @method runTests
   * @param {Object} template - Template to test
   * @param {Object} [options={}] - Test options
   * @param {Array<string>} [options.testTypes] - Types of tests to run
   * @param {string} [options.provider] - Provider to use for API tests
   * @param {Object} [options.providerConfig] - Provider configuration
   * @returns {Promise<Object>} Test results
   */
  async runTests(template, options = {}) {
    try {
      this.logger.startTiming('runTests');

      const {
        testTypes = ['validation', 'structure', 'performance', 'api'],
        provider,
        providerConfig
      } = options;

      const results = {
        templateId: template.id,
        templateName: template.name,
        testStartTime: Date.now(),
        testEndTime: null,
        overallScore: 0,
        passed: false,
        tests: [],
        summary: {
          total: 0,
          passed: 0,
          failed: 0,
          warnings: 0
        }
      };

      // Run validation tests
      if (testTypes.includes('validation')) {
        const validationResult = await this.runValidationTests(template);
        results.tests.push(validationResult);
      }

      // Run structure tests
      if (testTypes.includes('structure')) {
        const structureResult = await this.runStructureTests(template);
        results.tests.push(structureResult);
      }

      // Run performance tests
      if (testTypes.includes('performance')) {
        const performanceResult = await this.runPerformanceTests(template);
        results.tests.push(performanceResult);
      }

      // Run API tests if provider is available
      if (testTypes.includes('api') && provider && providerConfig) {
        const apiResult = await this.runAPITests(template, provider, providerConfig);
        results.tests.push(apiResult);
      }

      // Calculate overall results
      this.calculateOverallResults(results);

      results.testEndTime = Date.now();
      results.duration = results.testEndTime - results.testStartTime;

      this.logger.endTiming('runTests');
      this.logger.info(`Template tests completed. Score: ${results.overallScore}/100`);

      return results;
    } catch (error) {
      ErrorHandler.handle(error, 'TemplateTester.runTests');
      throw error;
    }
  }

  /**
   * Runs validation tests
   * 
   * @method runValidationTests
   * @param {Object} template - Template to test
   * @returns {Promise<TestResult>} Validation test result
   */
  async runValidationTests(template) {
    const result = {
      testName: 'Validation Tests',
      passed: true,
      score: 100,
      errors: [],
      warnings: [],
      metrics: {},
      duration: 0
    };

    try {
      const startTime = Date.now();

      // Basic validation
      const validation = this.validator.validate(template.template);

      if (!validation.isValid) {
        result.passed = false;
        result.errors.push(...validation.errors.map(e => e.message));
        result.score -= 30;
      }

      result.warnings.push(...validation.warnings.map(w => w.message));

      // Check for required placeholder
      if (!template.template.includes('{text}')) {
        result.passed = false;
        result.errors.push('Template must include {text} placeholder');
        result.score -= 50;
      }

      // Check template length
      if (template.template.length < 10) {
        result.warnings.push('Template is very short');
        result.score -= 10;
      } else if (template.template.length > 1000) {
        result.warnings.push('Template is very long');
        result.score -= 5;
      }

      result.metrics = {
        templateLength: template.template.length,
        wordCount: template.template.split(/\s+/).length,
        placeholderCount: (template.template.match(/\{[^}]+\}/g) || []).length,
        validationScore: validation.score || 0
      };

      result.duration = Date.now() - startTime;
      return result;
    } catch (error) {
      result.passed = false;
      result.errors.push(`Validation test failed: ${error.message}`);
      result.score = 0;
      return result;
    }
  }

  /**
   * Runs structure tests
   * 
   * @method runStructureTests
   * @param {Object} template - Template to test
   * @returns {Promise<TestResult>} Structure test result
   */
  async runStructureTests(template) {
    const result = {
      testName: 'Structure Tests',
      passed: true,
      score: 100,
      errors: [],
      warnings: [],
      metrics: {},
      duration: 0
    };

    try {
      const startTime = Date.now();
      const content = template.template;

      // Check for clear instructions
      const hasInstructions = /please|improve|optimize|rewrite|fix|enhance/i.test(content);
      if (!hasInstructions) {
        result.warnings.push('Template should include clear instructions');
        result.score -= 15;
      }

      // Check for context
      const hasContext = /context|background|about|regarding/i.test(content);
      if (!hasContext && content.length > 100) {
        result.warnings.push('Consider providing context in longer templates');
        result.score -= 10;
      }

      // Check for proper formatting
      const lines = content.split('\n');
      const hasMultipleLines = lines.length > 1;
      const hasProperSpacing = content.includes('\n\n');

      if (content.length > 50 && !hasMultipleLines) {
        result.warnings.push('Consider using multiple lines for better readability');
        result.score -= 5;
      }

      // Check for balanced braces
      const openBraces = (content.match(/\{/g) || []).length;
      const closeBraces = (content.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        result.errors.push('Unmatched braces in template');
        result.passed = false;
        result.score -= 25;
      }

      result.metrics = {
        lineCount: lines.length,
        hasInstructions,
        hasContext,
        hasProperSpacing,
        braceBalance: openBraces === closeBraces
      };

      result.duration = Date.now() - startTime;
      return result;
    } catch (error) {
      result.passed = false;
      result.errors.push(`Structure test failed: ${error.message}`);
      result.score = 0;
      return result;
    }
  }

  /**
   * Runs performance tests
   * 
   * @method runPerformanceTests
   * @param {Object} template - Template to test
   * @returns {Promise<TestResult>} Performance test result
   */
  async runPerformanceTests(template) {
    const result = {
      testName: 'Performance Tests',
      passed: true,
      score: 100,
      errors: [],
      warnings: [],
      metrics: {},
      duration: 0
    };

    try {
      const startTime = Date.now();

      // Test template processing speed
      const processingTimes = [];

      for (const sample of this.testSamples) {
        const processStart = performance.now();
        const _processedTemplate = template.template.replace('{text}', sample.text);
        const processEnd = performance.now();

        processingTimes.push(processEnd - processStart);
      }

      const avgProcessingTime = processingTimes.reduce((a, b) => a + b, 0) / processingTimes.length;
      const maxProcessingTime = Math.max(...processingTimes);

      // Performance scoring
      if (avgProcessingTime > 10) {
        result.warnings.push('Template processing is slower than expected');
        result.score -= 10;
      }

      if (maxProcessingTime > 50) {
        result.warnings.push('Template processing has high variance');
        result.score -= 5;
      }

      // Test memory usage (approximate)
      const templateSize = new Blob([template.template]).size;
      const processedSizes = this.testSamples.map(sample =>
        new Blob([template.template.replace('{text}', sample.text)]).size
      );

      const avgProcessedSize = processedSizes.reduce((a, b) => a + b, 0) / processedSizes.length;

      result.metrics = {
        averageProcessingTime: avgProcessingTime,
        maxProcessingTime: maxProcessingTime,
        templateSize: templateSize,
        averageProcessedSize: avgProcessedSize,
        sizeIncrease: avgProcessedSize - templateSize
      };

      result.duration = Date.now() - startTime;
      return result;
    } catch (error) {
      result.passed = false;
      result.errors.push(`Performance test failed: ${error.message}`);
      result.score = 0;
      return result;
    }
  }

  /**
   * Runs API tests with a provider
   * 
   * @method runAPITests
   * @param {Object} template - Template to test
   * @param {string} provider - Provider name
   * @param {Object} providerConfig - Provider configuration
   * @returns {Promise<TestResult>} API test result
   */
  async runAPITests(template, provider, providerConfig) {
    const result = {
      testName: 'API Tests',
      passed: true,
      score: 100,
      errors: [],
      warnings: [],
      metrics: {},
      duration: 0
    };

    try {
      const startTime = Date.now();
      const apiResults = [];

      // Test with different sample texts
      for (const sample of this.testSamples.slice(0, 3)) { // Limit to 3 samples for API tests
        try {
          const prompt = template.template.replace('{text}', sample.text);

          // This would need to be integrated with the actual provider system
          // For now, we'll simulate the test
          const testResult = await this.simulateAPICall(prompt, provider, providerConfig);
          apiResults.push({
            sample: sample.name,
            success: testResult.success,
            responseTime: testResult.responseTime,
            responseLength: testResult.responseLength,
            error: testResult.error
          });
        } catch (error) {
          apiResults.push({
            sample: sample.name,
            success: false,
            error: error.message
          });
        }
      }

      // Analyze results
      const successfulTests = apiResults.filter(r => r.success);
      const successRate = successfulTests.length / apiResults.length;

      if (successRate < 1) {
        result.warnings.push(`${Math.round((1 - successRate) * 100)}% of API tests failed`);
        result.score -= Math.round((1 - successRate) * 50);
      }

      if (successfulTests.length > 0) {
        const avgResponseTime = successfulTests.reduce((sum, r) => sum + r.responseTime, 0) / successfulTests.length;
        const avgResponseLength = successfulTests.reduce((sum, r) => sum + r.responseLength, 0) / successfulTests.length;

        if (avgResponseTime > 5000) {
          result.warnings.push('API responses are slower than expected');
          result.score -= 10;
        }

        if (avgResponseLength < 10) {
          result.warnings.push('API responses are shorter than expected');
          result.score -= 15;
        }
      }

      result.metrics = {
        totalTests: apiResults.length,
        successfulTests: successfulTests.length,
        successRate: successRate,
        averageResponseTime: successfulTests.length > 0 ?
          successfulTests.reduce((sum, r) => sum + r.responseTime, 0) / successfulTests.length : 0,
        averageResponseLength: successfulTests.length > 0 ?
          successfulTests.reduce((sum, r) => sum + r.responseLength, 0) / successfulTests.length : 0,
        results: apiResults
      };

      result.duration = Date.now() - startTime;
      return result;
    } catch (error) {
      result.passed = false;
      result.errors.push(`API test failed: ${error.message}`);
      result.score = 0;
      return result;
    }
  }

  /**
   * Simulates an API call for testing
   * 
   * @method simulateAPICall
   * @param {string} prompt - Prompt to test
   * @param {string} provider - Provider name
   * @param {Object} config - Provider configuration
   * @returns {Promise<Object>} Simulated API result
   */
  async simulateAPICall(_prompt, _provider, _config) {
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, Math.random() * 2000 + 500));

    // Simulate response
    return {
      success: Math.random() > 0.1, // 90% success rate
      responseTime: Math.random() * 3000 + 500,
      responseLength: Math.random() * 200 + 50,
      error: Math.random() > 0.9 ? 'Simulated API error' : null
    };
  }

  /**
   * Calculates overall test results
   * 
   * @method calculateOverallResults
   * @param {Object} results - Test results object to update
   */
  calculateOverallResults(results) {
    results.summary.total = results.tests.length;
    results.summary.passed = results.tests.filter(t => t.passed).length;
    results.summary.failed = results.summary.total - results.summary.passed;
    results.summary.warnings = results.tests.reduce((sum, t) => sum + t.warnings.length, 0);

    // Calculate weighted average score
    const totalScore = results.tests.reduce((sum, t) => sum + t.score, 0);
    results.overallScore = Math.round(totalScore / results.tests.length);

    // Overall pass/fail
    results.passed = results.summary.failed === 0 && results.overallScore >= 70;
  }

  /**
   * Generates a test report
   * 
   * @method generateReport
   * @param {Object} testResults - Test results
   * @returns {string} Formatted test report
   */
  generateReport(testResults) {
    const lines = [];

    lines.push(`# Template Test Report`);
    lines.push(`Template: ${testResults.templateName}`);
    lines.push(`Overall Score: ${testResults.overallScore}/100`);
    lines.push(`Status: ${testResults.passed ? 'PASSED' : 'FAILED'}`);
    lines.push(`Duration: ${testResults.duration}ms`);
    lines.push('');

    lines.push(`## Summary`);
    lines.push(`- Total Tests: ${testResults.summary.total}`);
    lines.push(`- Passed: ${testResults.summary.passed}`);
    lines.push(`- Failed: ${testResults.summary.failed}`);
    lines.push(`- Warnings: ${testResults.summary.warnings}`);
    lines.push('');

    testResults.tests.forEach(test => {
      lines.push(`## ${test.testName}`);
      lines.push(`Score: ${test.score}/100`);
      lines.push(`Status: ${test.passed ? 'PASSED' : 'FAILED'}`);
      lines.push(`Duration: ${test.duration}ms`);

      if (test.errors.length > 0) {
        lines.push(`### Errors:`);
        test.errors.forEach(error => lines.push(`- ${error}`));
      }

      if (test.warnings.length > 0) {
        lines.push(`### Warnings:`);
        test.warnings.forEach(warning => lines.push(`- ${warning}`));
      }

      lines.push('');
    });

    return lines.join('\n');
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { TemplateTester };
} else if (typeof window !== 'undefined') {
  window.TemplateTester = TemplateTester;
}
