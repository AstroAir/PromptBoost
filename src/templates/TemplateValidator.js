/**
 * @fileoverview Template Validator for PromptBoost
 * Provides comprehensive validation for prompt templates including
 * syntax checking, variable validation, and best practice recommendations.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

/**
 * Comprehensive template validator with multiple validation rules.
 * Provides syntax checking, variable validation, and best practice recommendations.
 * 
 * @class TemplateValidator
 * @since 2.0.0
 */
class TemplateValidator {
  /**
   * Creates an instance of TemplateValidator.
   * 
   * @constructor
   * @param {Object} [options={}] - Validator options
   * @param {boolean} [options.strict=false] - Enable strict validation mode
   * @param {Array<string>} [options.allowedVariables] - List of allowed variables
   * @param {number} [options.maxLength=10000] - Maximum template length
   * @param {boolean} [options.requireTextPlaceholder=true] - Require {text} placeholder
   * @since 2.0.0
   */
  constructor(options = {}) {
    this.options = {
      strict: false,
      allowedVariables: ['text', 'selection', 'context', 'language', 'tone', 'length', 'format', 'style'],
      maxLength: 10000,
      requireTextPlaceholder: true,
      minLength: 10,
      maxVariables: 20,
      ...options
    };

    this.validationRules = [
      this.validateBasicStructure.bind(this),
      this.validateVariables.bind(this),
      this.validateLength.bind(this),
      this.validateSyntax.bind(this),
      this.validateBestPractices.bind(this),
      this.validateSecurity.bind(this),
      this.validatePerformance.bind(this)
    ];
  }

  /**
   * Validates a template and returns validation results.
   * 
   * @method validate
   * @param {string} template - Template content to validate
   * @param {Object} [context={}] - Additional validation context
   * @returns {Object} Validation results
   * @since 2.0.0
   */
  validate(template, context = {}) {
    const results = {
      isValid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      metrics: this.calculateMetrics(template),
      score: 0
    };

    // Run all validation rules
    for (const rule of this.validationRules) {
      try {
        const ruleResult = rule(template, context);
        this.mergeResults(results, ruleResult);
      } catch (error) {
        results.errors.push({
          type: 'error',
          code: 'VALIDATION_ERROR',
          message: `Validation rule failed: ${error.message}`,
          line: 0,
          column: 0,
          severity: 'high'
        });
      }
    }

    // Calculate overall validity
    results.isValid = results.errors.length === 0;
    results.score = this.calculateScore(results);

    return results;
  }

  /**
   * Validates basic template structure.
   * 
   * @method validateBasicStructure
   * @param {string} template - Template content
   * @param {Object} context - Validation context
   * @returns {Object} Validation results
   * @since 2.0.0
   */
  validateBasicStructure(template, _context) {
    const results = { errors: [], warnings: [], suggestions: [] };

    // Check if template is empty
    if (!template || template.trim().length === 0) {
      results.errors.push({
        type: 'error',
        code: 'EMPTY_TEMPLATE',
        message: 'Template cannot be empty',
        line: 0,
        column: 0,
        severity: 'high'
      });
      return results;
    }

    // Check for required {text} placeholder
    if (this.options.requireTextPlaceholder && !template.includes('{text}')) {
      results.errors.push({
        type: 'error',
        code: 'MISSING_TEXT_PLACEHOLDER',
        message: 'Template must include {text} placeholder for the selected text',
        line: 0,
        column: 0,
        severity: 'high',
        suggestion: 'Add {text} where you want the selected text to appear'
      });
    }

    // Check for basic instruction structure
    const hasInstruction = /\b(please|improve|rewrite|summarize|translate|format|generate|create|analyze|explain|describe)\b/i.test(template);
    if (!hasInstruction) {
      results.suggestions.push({
        type: 'suggestion',
        code: 'ADD_INSTRUCTION',
        message: 'Consider adding clear instructions (e.g., "Please improve", "Summarize", etc.)',
        line: 0,
        column: 0,
        severity: 'low'
      });
    }

    return results;
  }

  /**
   * Validates template variables.
   * 
   * @method validateVariables
   * @param {string} template - Template content
   * @param {Object} context - Validation context
   * @returns {Object} Validation results
   * @since 2.0.0
   */
  validateVariables(template, _context) {
    const results = { errors: [], warnings: [], suggestions: [] };

    // Find all variables in the template
    const variableMatches = template.match(/\{[^}]*\}/g) || [];
    const variables = variableMatches.map(match => match.slice(1, -1));

    // Check for unmatched braces
    const openBraces = (template.match(/\{/g) || []).length;
    const closeBraces = (template.match(/\}/g) || []).length;

    if (openBraces !== closeBraces) {
      results.errors.push({
        type: 'error',
        code: 'UNMATCHED_BRACES',
        message: `Unmatched braces: ${openBraces} opening, ${closeBraces} closing`,
        line: 0,
        column: 0,
        severity: 'high'
      });
    }

    // Validate individual variables
    variables.forEach((variable, index) => {
      const match = variableMatches[index];
      const position = template.indexOf(match);

      // Check for empty variables
      if (variable.trim().length === 0) {
        results.errors.push({
          type: 'error',
          code: 'EMPTY_VARIABLE',
          message: 'Empty variable placeholder found',
          line: this.getLineNumber(template, position),
          column: this.getColumnNumber(template, position),
          severity: 'medium'
        });
        return;
      }

      // Check for invalid variable names
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(variable)) {
        results.errors.push({
          type: 'error',
          code: 'INVALID_VARIABLE_NAME',
          message: `Invalid variable name: ${variable}`,
          line: this.getLineNumber(template, position),
          column: this.getColumnNumber(template, position),
          severity: 'medium',
          suggestion: 'Variable names should contain only letters, numbers, and underscores'
        });
      }

      // Check against allowed variables in strict mode
      if (this.options.strict && this.options.allowedVariables && !this.options.allowedVariables.includes(variable)) {
        results.warnings.push({
          type: 'warning',
          code: 'UNKNOWN_VARIABLE',
          message: `Unknown variable: ${variable}`,
          line: this.getLineNumber(template, position),
          column: this.getColumnNumber(template, position),
          severity: 'low',
          suggestion: `Allowed variables: ${this.options.allowedVariables.join(', ')}`
        });
      }
    });

    // Check for too many variables
    if (variables.length > this.options.maxVariables) {
      results.warnings.push({
        type: 'warning',
        code: 'TOO_MANY_VARIABLES',
        message: `Template has ${variables.length} variables, consider simplifying`,
        line: 0,
        column: 0,
        severity: 'low'
      });
    }

    // Check for duplicate variables
    const uniqueVariables = [...new Set(variables)];
    if (uniqueVariables.length !== variables.length) {
      results.suggestions.push({
        type: 'suggestion',
        code: 'DUPLICATE_VARIABLES',
        message: 'Template contains duplicate variables',
        line: 0,
        column: 0,
        severity: 'low'
      });
    }

    return results;
  }

  /**
   * Validates template length.
   * 
   * @method validateLength
   * @param {string} template - Template content
   * @param {Object} context - Validation context
   * @returns {Object} Validation results
   * @since 2.0.0
   */
  validateLength(template, _context) {
    const results = { errors: [], warnings: [], suggestions: [] };

    if (template.length > this.options.maxLength) {
      results.errors.push({
        type: 'error',
        code: 'TEMPLATE_TOO_LONG',
        message: `Template is ${template.length} characters, maximum is ${this.options.maxLength}`,
        line: 0,
        column: 0,
        severity: 'medium'
      });
    }

    if (template.length < this.options.minLength) {
      results.warnings.push({
        type: 'warning',
        code: 'TEMPLATE_TOO_SHORT',
        message: `Template is very short (${template.length} characters)`,
        line: 0,
        column: 0,
        severity: 'low',
        suggestion: 'Consider adding more detailed instructions'
      });
    }

    // Check for very long lines
    const lines = template.split('\n');
    lines.forEach((line, index) => {
      if (line.length > 200) {
        results.suggestions.push({
          type: 'suggestion',
          code: 'LONG_LINE',
          message: `Line ${index + 1} is very long (${line.length} characters)`,
          line: index,
          column: 0,
          severity: 'low',
          suggestion: 'Consider breaking long lines for better readability'
        });
      }
    });

    return results;
  }

  /**
   * Validates template syntax.
   * 
   * @method validateSyntax
   * @param {string} template - Template content
   * @param {Object} context - Validation context
   * @returns {Object} Validation results
   * @since 2.0.0
   */
  validateSyntax(template, _context) {
    const results = { errors: [], warnings: [], suggestions: [] };

    // Check for common syntax issues
    const issues = [
      { pattern: /\{\s+/, message: 'Extra space after opening brace', code: 'SPACE_AFTER_BRACE' },
      { pattern: /\s+\}/, message: 'Extra space before closing brace', code: 'SPACE_BEFORE_BRACE' },
      { pattern: /\{\{/, message: 'Double opening braces', code: 'DOUBLE_OPEN_BRACE' },
      { pattern: /\}\}/, message: 'Double closing braces', code: 'DOUBLE_CLOSE_BRACE' },
      { pattern: /\{[^}]*\{/, message: 'Nested braces', code: 'NESTED_BRACES' }
    ];

    issues.forEach(issue => {
      const matches = [...template.matchAll(new RegExp(issue.pattern, 'g'))];
      matches.forEach(match => {
        const position = match.index;
        results.warnings.push({
          type: 'warning',
          code: issue.code,
          message: issue.message,
          line: this.getLineNumber(template, position),
          column: this.getColumnNumber(template, position),
          severity: 'low'
        });
      });
    });

    return results;
  }

  /**
   * Validates best practices.
   * 
   * @method validateBestPractices
   * @param {string} template - Template content
   * @param {Object} context - Validation context
   * @returns {Object} Validation results
   * @since 2.0.0
   */
  validateBestPractices(template, _context) {
    const results = { errors: [], warnings: [], suggestions: [] };

    // Check for clear instructions
    const hasContext = /context|background|about|regarding/i.test(template);
    if (!hasContext && template.length > 100) {
      results.suggestions.push({
        type: 'suggestion',
        code: 'ADD_CONTEXT',
        message: 'Consider providing context or background information',
        line: 0,
        column: 0,
        severity: 'low'
      });
    }

    // Check for output format specification
    const hasFormat = /format|style|tone|length|bullet|list|paragraph/i.test(template);
    if (!hasFormat) {
      results.suggestions.push({
        type: 'suggestion',
        code: 'SPECIFY_FORMAT',
        message: 'Consider specifying the desired output format or style',
        line: 0,
        column: 0,
        severity: 'low'
      });
    }

    // Check for politeness
    const isPolite = /please|kindly|would you|could you/i.test(template);
    if (!isPolite) {
      results.suggestions.push({
        type: 'suggestion',
        code: 'ADD_POLITENESS',
        message: 'Consider using polite language (e.g., "Please")',
        line: 0,
        column: 0,
        severity: 'low'
      });
    }

    return results;
  }

  /**
   * Validates security considerations.
   * 
   * @method validateSecurity
   * @param {string} template - Template content
   * @param {Object} context - Validation context
   * @returns {Object} Validation results
   * @since 2.0.0
   */
  validateSecurity(template, _context) {
    const results = { errors: [], warnings: [], suggestions: [] };

    // Check for potential injection patterns
    const dangerousPatterns = [
      { pattern: /eval\s*\(/, message: 'Potential code injection risk', severity: 'high' },
      { pattern: /script\s*>/i, message: 'Potential script injection', severity: 'high' },
      { pattern: /javascript:/i, message: 'JavaScript protocol detected', severity: 'medium' },
      { pattern: /on\w+\s*=/i, message: 'Event handler detected', severity: 'medium' }
    ];

    dangerousPatterns.forEach(pattern => {
      if (pattern.pattern.test(template)) {
        results.warnings.push({
          type: 'warning',
          code: 'SECURITY_RISK',
          message: pattern.message,
          line: 0,
          column: 0,
          severity: pattern.severity
        });
      }
    });

    return results;
  }

  /**
   * Validates performance considerations.
   * 
   * @method validatePerformance
   * @param {string} template - Template content
   * @param {Object} context - Validation context
   * @returns {Object} Validation results
   * @since 2.0.0
   */
  validatePerformance(template, _context) {
    const results = { errors: [], warnings: [], suggestions: [] };

    // Check for very long templates that might cause performance issues
    if (template.length > 5000) {
      results.warnings.push({
        type: 'warning',
        code: 'PERFORMANCE_CONCERN',
        message: 'Very long template may cause performance issues',
        line: 0,
        column: 0,
        severity: 'low',
        suggestion: 'Consider breaking into smaller, focused templates'
      });
    }

    // Check for excessive repetition
    const words = template.toLowerCase().split(/\s+/);
    const wordCounts = {};
    words.forEach(word => {
      if (word.length > 3) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });

    const repeatedWords = Object.entries(wordCounts).filter(([_word, count]) => count > 5);
    if (repeatedWords.length > 0) {
      results.suggestions.push({
        type: 'suggestion',
        code: 'EXCESSIVE_REPETITION',
        message: `Repeated words detected: ${repeatedWords.map(([word]) => word).join(', ')}`,
        line: 0,
        column: 0,
        severity: 'low'
      });
    }

    return results;
  }

  /**
   * Calculates template metrics.
   *
   * @method calculateMetrics
   * @param {string} template - Template content
   * @returns {Object} Template metrics
   * @since 2.0.0
   */
  calculateMetrics(template) {
    const lines = template.split('\n');
    const words = template.split(/\s+/).filter(word => word.length > 0);
    const variables = (template.match(/\{[^}]*\}/g) || []).map(v => v.slice(1, -1));
    const uniqueVariables = [...new Set(variables)];

    return {
      characters: template.length,
      lines: lines.length,
      words: words.length,
      variables: variables.length,
      uniqueVariables: uniqueVariables.length,
      averageLineLength: lines.length > 0 ? Math.round(template.length / lines.length) : 0,
      averageWordLength: words.length > 0 ? Math.round(words.join('').length / words.length) : 0,
      complexity: this.calculateComplexity(template),
      readability: this.calculateReadability(template)
    };
  }

  /**
   * Calculates template complexity score.
   *
   * @method calculateComplexity
   * @param {string} template - Template content
   * @returns {number} Complexity score (0-100)
   * @since 2.0.0
   */
  calculateComplexity(template) {
    let score = 0;

    // Base complexity from length
    score += Math.min(template.length / 100, 30);

    // Variable complexity
    const variables = (template.match(/\{[^}]*\}/g) || []).length;
    score += variables * 5;

    // Sentence complexity
    const sentences = template.split(/[.!?]+/).filter(s => s.trim().length > 0);
    score += sentences.length * 2;

    // Nested structure complexity
    const nestedPatterns = template.match(/\([^)]*\)/g) || [];
    score += nestedPatterns.length * 3;

    return Math.min(Math.round(score), 100);
  }

  /**
   * Calculates template readability score.
   *
   * @method calculateReadability
   * @param {string} template - Template content
   * @returns {number} Readability score (0-100)
   * @since 2.0.0
   */
  calculateReadability(template) {
    const words = template.split(/\s+/).filter(word => word.length > 0);
    const sentences = template.split(/[.!?]+/).filter(s => s.trim().length > 0);

    if (words.length === 0 || sentences.length === 0) return 0;

    // Simple readability calculation based on average word and sentence length
    const avgWordsPerSentence = words.length / sentences.length;
    const avgCharsPerWord = words.join('').length / words.length;

    // Ideal ranges: 15-20 words per sentence, 4-6 characters per word
    const sentenceScore = Math.max(0, 100 - Math.abs(avgWordsPerSentence - 17.5) * 4);
    const wordScore = Math.max(0, 100 - Math.abs(avgCharsPerWord - 5) * 10);

    return Math.round((sentenceScore + wordScore) / 2);
  }

  /**
   * Merges validation results.
   *
   * @method mergeResults
   * @param {Object} target - Target results object
   * @param {Object} source - Source results object
   * @since 2.0.0
   */
  mergeResults(target, source) {
    target.errors.push(...(source.errors || []));
    target.warnings.push(...(source.warnings || []));
    target.suggestions.push(...(source.suggestions || []));
  }

  /**
   * Calculates overall validation score.
   *
   * @method calculateScore
   * @param {Object} results - Validation results
   * @returns {number} Score (0-100)
   * @since 2.0.0
   */
  calculateScore(results) {
    let score = 100;

    // Deduct points for errors
    results.errors.forEach(error => {
      switch (error.severity) {
        case 'high': score -= 20; break;
        case 'medium': score -= 10; break;
        case 'low': score -= 5; break;
      }
    });

    // Deduct points for warnings
    results.warnings.forEach(warning => {
      switch (warning.severity) {
        case 'high': score -= 10; break;
        case 'medium': score -= 5; break;
        case 'low': score -= 2; break;
      }
    });

    // Bonus points for good practices
    if (results.suggestions.length === 0) {
      score += 10;
    }

    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Gets line number for a character position.
   *
   * @method getLineNumber
   * @param {string} text - Text content
   * @param {number} position - Character position
   * @returns {number} Line number (0-based)
   * @since 2.0.0
   */
  getLineNumber(text, position) {
    return text.substring(0, position).split('\n').length - 1;
  }

  /**
   * Gets column number for a character position.
   *
   * @method getColumnNumber
   * @param {string} text - Text content
   * @param {number} position - Character position
   * @returns {number} Column number (0-based)
   * @since 2.0.0
   */
  getColumnNumber(text, position) {
    const lines = text.substring(0, position).split('\n');
    return lines[lines.length - 1].length;
  }

  /**
   * Validates a template quickly (basic validation only).
   *
   * @method quickValidate
   * @param {string} template - Template content
   * @returns {Object} Quick validation results
   * @since 2.0.0
   */
  quickValidate(template) {
    const results = {
      isValid: true,
      errors: [],
      warnings: []
    };

    // Basic structure validation only
    const basicResult = this.validateBasicStructure(template, {});
    this.mergeResults(results, basicResult);

    // Variable validation
    const variableResult = this.validateVariables(template, {});
    this.mergeResults(results, variableResult);

    results.isValid = results.errors.length === 0;
    return results;
  }

  /**
   * Gets validation suggestions for improving a template.
   *
   * @method getSuggestions
   * @param {string} template - Template content
   * @returns {Array} Array of improvement suggestions
   * @since 2.0.0
   */
  getSuggestions(template) {
    const results = this.validate(template);
    return [
      ...results.suggestions,
      ...results.warnings.filter(w => w.suggestion).map(w => ({
        type: 'improvement',
        message: w.suggestion,
        code: w.code
      }))
    ];
  }

  /**
   * Checks if a template is production-ready.
   *
   * @method isProductionReady
   * @param {string} template - Template content
   * @returns {boolean} True if template is production-ready
   * @since 2.0.0
   */
  isProductionReady(template) {
    const results = this.validate(template);
    const hasHighSeverityIssues = results.errors.some(e => e.severity === 'high') ||
      results.warnings.some(w => w.severity === 'high');

    return results.isValid && !hasHighSeverityIssues && results.score >= 70;
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TemplateValidator;
} else if (typeof window !== 'undefined') {
  window.TemplateValidator = TemplateValidator;
}
