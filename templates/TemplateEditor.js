/**
 * @fileoverview Enhanced Template Editor for PromptBoost
 * Provides advanced template editing capabilities with syntax highlighting,
 * real-time preview, validation, and testing features.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

/**
 * Enhanced template editor with CodeMirror integration.
 * Provides syntax highlighting, validation, preview, and testing capabilities.
 * 
 * @class TemplateEditor
 * @since 2.0.0
 */
class TemplateEditor {
  /**
   * Creates an instance of TemplateEditor.
   * 
   * @constructor
   * @param {Object} config - Editor configuration
   * @param {HTMLElement} config.container - Container element for the editor
   * @param {Object} [config.options={}] - CodeMirror options
   * @param {Function} [config.onChange] - Callback for content changes
   * @param {Function} [config.onValidate] - Callback for validation results
   * @since 2.0.0
   */
  constructor(config) {
    this.container = config.container;
    this.options = {
      mode: 'prompttemplate',
      theme: 'default',
      lineNumbers: true,
      lineWrapping: true,
      autoCloseBrackets: true,
      matchBrackets: true,
      foldGutter: true,
      gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter', 'CodeMirror-lint-markers'],
      lint: true,
      placeholder: 'Enter your prompt template here...\n\nUse {text} as a placeholder for the selected text.\nExample: Please improve the following text:\n\n{text}',
      ...config.options
    };

    this.onChange = config.onChange || (() => { });
    this.onValidate = config.onValidate || (() => { });

    this.editor = null;
    this.validationErrors = [];
    this.previewData = {
      text: 'This is sample text for preview purposes.'
    };

    // Initialize validator
    this.validator = new TemplateValidator({
      strict: false,
      requireTextPlaceholder: true
    });

    this.init();
  }

  /**
   * Initializes the template editor.
   * 
   * @method init
   * @since 2.0.0
   */
  init() {
    this.createEditorLayout();
    this.initializeCodeMirror();
    this.setupValidation();
    this.setupPreview();
    this.setupEventListeners();
  }

  /**
   * Creates the editor layout with panels.
   * 
   * @method createEditorLayout
   * @since 2.0.0
   */
  createEditorLayout() {
    this.container.innerHTML = `
      <div class="template-editor-container">
        <div class="editor-toolbar">
          <div class="toolbar-left">
            <button type="button" class="btn-secondary btn-small" id="formatTemplate">
              Format
            </button>
            <button type="button" class="btn-secondary btn-small" id="insertVariable">
              Insert Variable
            </button>
            <button type="button" class="btn-secondary btn-small" id="validateTemplate">
              Validate
            </button>
          </div>
          <div class="toolbar-right">
            <button type="button" class="btn-secondary btn-small" id="togglePreview">
              Preview
            </button>
            <button type="button" class="btn-secondary btn-small" id="testTemplate">
              Test
            </button>
          </div>
        </div>
        
        <div class="editor-layout">
          <div class="editor-panel">
            <div class="panel-header">
              <h4>Template Editor</h4>
              <div class="editor-status">
                <span id="editorStatus" class="status-indicator">Ready</span>
                <span id="validationScore" class="validation-score" style="display: none;">Score: 0/100</span>
                <span id="characterCount" class="character-count">0 characters</span>
              </div>
            </div>
            <div class="editor-content" id="editorContent">
              <!-- CodeMirror will be initialized here -->
            </div>
            <div class="validation-panel" id="validationPanel" style="display: none;">
              <div class="validation-header">
                <span class="validation-icon">⚠️</span>
                <span class="validation-title">Validation Issues</span>
              </div>
              <div class="validation-content" id="validationContent">
                <!-- Validation errors will be displayed here -->
              </div>
            </div>
          </div>
          
          <div class="preview-panel" id="previewPanel" style="display: none;">
            <div class="panel-header">
              <h4>Live Preview</h4>
              <div class="preview-controls">
                <button type="button" class="btn-secondary btn-small" id="updatePreview">
                  Update
                </button>
                <button type="button" class="btn-secondary btn-small" id="previewSettings">
                  Settings
                </button>
              </div>
            </div>
            <div class="preview-content">
              <div class="preview-section">
                <h5>Sample Data</h5>
                <textarea id="previewData" class="preview-data-input" rows="3">${this.previewData.text}</textarea>
              </div>
              <div class="preview-section">
                <h5>Rendered Template</h5>
                <div id="previewOutput" class="preview-output">
                  <!-- Rendered template will be displayed here -->
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Initializes CodeMirror editor.
   * 
   * @method initializeCodeMirror
   * @since 2.0.0
   */
  initializeCodeMirror() {
    const editorContent = this.container.querySelector('#editorContent');

    // Define custom mode for prompt templates
    this.definePromptTemplateMode();

    this.editor = CodeMirror(editorContent, this.options);

    // Setup change handler
    this.editor.on('change', (instance, changeObj) => {
      this.handleContentChange();
    });

    // Setup cursor activity handler
    this.editor.on('cursorActivity', (instance) => {
      this.updateEditorStatus();
    });

    // Setup focus/blur handlers
    this.editor.on('focus', () => {
      this.container.querySelector('.editor-panel').classList.add('focused');
    });

    this.editor.on('blur', () => {
      this.container.querySelector('.editor-panel').classList.remove('focused');
    });
  }

  /**
   * Defines custom CodeMirror mode for prompt templates.
   * 
   * @method definePromptTemplateMode
   * @since 2.0.0
   */
  definePromptTemplateMode() {
    CodeMirror.defineMode('prompttemplate', function (config, parserConfig) {
      return {
        token: function (stream, state) {
          // Highlight template variables like {text}, {variable}
          if (stream.match(/\{[^}]+\}/)) {
            return 'variable';
          }

          // Highlight special instructions
          if (stream.match(/^(Please|Improve|Rewrite|Summarize|Translate|Format)/i)) {
            return 'keyword';
          }

          // Highlight quoted text
          if (stream.match(/^"[^"]*"/)) {
            return 'string';
          }

          // Default text
          stream.next();
          return null;
        }
      };
    });
  }

  /**
   * Sets up template validation.
   * 
   * @method setupValidation
   * @since 2.0.0
   */
  setupValidation() {
    // Define lint function for template validation
    CodeMirror.registerHelper('lint', 'prompttemplate', (text) => {
      const errors = [];

      // Check for required {text} placeholder
      if (!text.includes('{text}')) {
        errors.push({
          message: 'Template must include {text} placeholder',
          severity: 'error',
          from: CodeMirror.Pos(0, 0),
          to: CodeMirror.Pos(0, 0)
        });
      }

      // Check for unmatched braces
      const openBraces = (text.match(/\{/g) || []).length;
      const closeBraces = (text.match(/\}/g) || []).length;
      if (openBraces !== closeBraces) {
        errors.push({
          message: 'Unmatched braces in template',
          severity: 'warning',
          from: CodeMirror.Pos(0, 0),
          to: CodeMirror.Pos(0, 0)
        });
      }

      // Check template length
      if (text.length > 5000) {
        errors.push({
          message: 'Template is very long and may cause performance issues',
          severity: 'warning',
          from: CodeMirror.Pos(0, 0),
          to: CodeMirror.Pos(0, 0)
        });
      }

      // Check for empty template
      if (text.trim().length === 0) {
        errors.push({
          message: 'Template cannot be empty',
          severity: 'error',
          from: CodeMirror.Pos(0, 0),
          to: CodeMirror.Pos(0, 0)
        });
      }

      return errors;
    });
  }

  /**
   * Sets up live preview functionality.
   * 
   * @method setupPreview
   * @since 2.0.0
   */
  setupPreview() {
    this.updatePreview();
  }

  /**
   * Sets up event listeners for editor controls.
   * 
   * @method setupEventListeners
   * @since 2.0.0
   */
  setupEventListeners() {
    const container = this.container;

    // Format template
    container.querySelector('#formatTemplate')?.addEventListener('click', () => {
      this.formatTemplate();
    });

    // Insert variable
    container.querySelector('#insertVariable')?.addEventListener('click', () => {
      this.showVariableInserter();
    });

    // Validate template
    container.querySelector('#validateTemplate')?.addEventListener('click', () => {
      this.validateTemplate();
    });

    // Toggle preview
    container.querySelector('#togglePreview')?.addEventListener('click', () => {
      this.togglePreview();
    });

    // Test template
    container.querySelector('#testTemplate')?.addEventListener('click', () => {
      this.testTemplate();
    });

    // Update preview
    container.querySelector('#updatePreview')?.addEventListener('click', () => {
      this.updatePreview();
    });

    // Preview data change
    container.querySelector('#previewData')?.addEventListener('input', (e) => {
      this.previewData.text = e.target.value;
      this.updatePreview();
    });
  }

  /**
   * Handles content changes in the editor.
   * 
   * @method handleContentChange
   * @since 2.0.0
   */
  handleContentChange() {
    const content = this.editor.getValue();

    // Update character count
    this.updateCharacterCount(content.length);

    // Update preview if visible
    if (this.isPreviewVisible()) {
      this.updatePreview();
    }

    // Trigger change callback
    this.onChange(content);

    // Auto-validate
    setTimeout(() => this.validateTemplate(), 500);
  }

  /**
   * Updates the character count display.
   * 
   * @method updateCharacterCount
   * @param {number} count - Character count
   * @since 2.0.0
   */
  updateCharacterCount(count) {
    const countElement = this.container.querySelector('#characterCount');
    if (countElement) {
      countElement.textContent = `${count} characters`;
    }
  }

  /**
   * Updates the editor status display.
   *
   * @method updateEditorStatus
   * @since 2.0.0
   */
  updateEditorStatus() {
    const cursor = this.editor.getCursor();
    const statusElement = this.container.querySelector('#editorStatus');
    if (statusElement) {
      statusElement.textContent = `Line ${cursor.line + 1}, Column ${cursor.ch + 1}`;
    }
  }

  /**
   * Formats the template content.
   *
   * @method formatTemplate
   * @since 2.0.0
   */
  formatTemplate() {
    const content = this.editor.getValue();

    // Basic formatting: normalize whitespace and line breaks
    const formatted = content
      .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
      .replace(/\s*\n\s*/g, '\n')  // Clean up line breaks
      .replace(/\{\s*(\w+)\s*\}/g, '{$1}')  // Clean up variable spacing
      .trim();

    this.editor.setValue(formatted);
    this.editor.focus();
  }

  /**
   * Shows the variable inserter dialog.
   *
   * @method showVariableInserter
   * @since 2.0.0
   */
  showVariableInserter() {
    const variables = [
      { name: 'text', description: 'The selected text to be processed' },
      { name: 'selection', description: 'Alias for text' },
      { name: 'context', description: 'Additional context information' },
      { name: 'language', description: 'Target language for translation' },
      { name: 'tone', description: 'Desired tone (formal, casual, etc.)' },
      { name: 'length', description: 'Desired length (short, medium, long)' }
    ];

    const variableList = variables.map(v =>
      `<div class="variable-item" data-variable="${v.name}">
        <span class="variable-name">{${v.name}}</span>
        <span class="variable-description">${v.description}</span>
      </div>`
    ).join('');

    const dialog = document.createElement('div');
    dialog.className = 'variable-inserter-dialog';
    dialog.innerHTML = `
      <div class="dialog-overlay">
        <div class="dialog-content">
          <div class="dialog-header">
            <h3>Insert Variable</h3>
            <button type="button" class="dialog-close">&times;</button>
          </div>
          <div class="dialog-body">
            <p>Click on a variable to insert it at the cursor position:</p>
            <div class="variable-list">
              ${variableList}
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(dialog);

    // Handle variable selection
    dialog.addEventListener('click', (e) => {
      if (e.target.closest('.variable-item')) {
        const variable = e.target.closest('.variable-item').dataset.variable;
        this.insertVariable(variable);
        document.body.removeChild(dialog);
      } else if (e.target.classList.contains('dialog-close') || e.target.classList.contains('dialog-overlay')) {
        document.body.removeChild(dialog);
      }
    });
  }

  /**
   * Inserts a variable at the cursor position.
   *
   * @method insertVariable
   * @param {string} variable - Variable name to insert
   * @since 2.0.0
   */
  insertVariable(variable) {
    const cursor = this.editor.getCursor();
    this.editor.replaceRange(`{${variable}}`, cursor);
    this.editor.focus();
  }

  /**
   * Validates the current template.
   *
   * @method validateTemplate
   * @since 2.0.0
   */
  validateTemplate() {
    const content = this.editor.getValue();
    const errors = this.validateTemplateContent(content);

    this.validationErrors = errors;
    this.displayValidationResults(errors);
    this.onValidate(errors);
  }

  /**
   * Validates template content and returns errors.
   *
   * @method validateTemplateContent
   * @param {string} content - Template content to validate
   * @returns {Array} Array of validation errors
   * @since 2.0.0
   */
  validateTemplateContent(content) {
    if (!this.validator) {
      // Fallback to basic validation if validator not available
      return this.basicValidation(content);
    }

    try {
      const results = this.validator.validate(content);

      // Convert validation results to editor format
      const errors = [
        ...results.errors.map(error => ({
          type: 'error',
          message: error.message,
          line: error.line || 0,
          column: error.column || 0,
          code: error.code,
          severity: error.severity
        })),
        ...results.warnings.map(warning => ({
          type: 'warning',
          message: warning.message,
          line: warning.line || 0,
          column: warning.column || 0,
          code: warning.code,
          severity: warning.severity
        })),
        ...results.suggestions.map(suggestion => ({
          type: 'suggestion',
          message: suggestion.message,
          line: suggestion.line || 0,
          column: suggestion.column || 0,
          code: suggestion.code,
          severity: suggestion.severity || 'info'
        }))
      ];

      // Store additional metrics for display
      this.lastValidationResults = {
        ...results,
        formattedErrors: errors
      };

      return errors;
    } catch (error) {
      console.error('Validation error:', error);
      return this.basicValidation(content);
    }
  }

  /**
   * Basic validation fallback.
   *
   * @method basicValidation
   * @param {string} content - Template content to validate
   * @returns {Array} Array of validation errors
   * @since 2.0.0
   */
  basicValidation(content) {
    const errors = [];

    // Required {text} placeholder
    if (!content.includes('{text}')) {
      errors.push({
        type: 'error',
        message: 'Template must include {text} placeholder',
        line: 0,
        column: 0
      });
    }

    // Check for unmatched braces
    const openBraces = (content.match(/\{/g) || []).length;
    const closeBraces = (content.match(/\}/g) || []).length;

    if (openBraces !== closeBraces) {
      errors.push({
        type: 'error',
        message: 'Unmatched braces in template',
        line: 0,
        column: 0
      });
    }

    // Check for empty template
    if (content.trim().length === 0) {
      errors.push({
        type: 'error',
        message: 'Template cannot be empty',
        line: 0,
        column: 0
      });
    }

    return errors;
  }

  /**
   * Displays validation results.
   *
   * @method displayValidationResults
   * @param {Array} errors - Validation errors
   * @since 2.0.0
   */
  displayValidationResults(errors) {
    const validationPanel = this.container.querySelector('#validationPanel');
    const validationContent = this.container.querySelector('#validationContent');

    if (errors.length === 0) {
      validationPanel.style.display = 'none';
      this.updateValidationSummary(null);
      return;
    }

    // Group errors by type
    const errorsByType = {
      error: errors.filter(e => e.type === 'error'),
      warning: errors.filter(e => e.type === 'warning'),
      suggestion: errors.filter(e => e.type === 'suggestion')
    };

    let errorList = '';

    // Display errors first
    if (errorsByType.error.length > 0) {
      errorList += '<div class="validation-group"><h5>Errors</h5>';
      errorsByType.error.forEach(error => {
        errorList += this.formatValidationItem(error, '❌');
      });
      errorList += '</div>';
    }

    // Display warnings
    if (errorsByType.warning.length > 0) {
      errorList += '<div class="validation-group"><h5>Warnings</h5>';
      errorsByType.warning.forEach(warning => {
        errorList += this.formatValidationItem(warning, '⚠️');
      });
      errorList += '</div>';
    }

    // Display suggestions
    if (errorsByType.suggestion.length > 0) {
      errorList += '<div class="validation-group"><h5>Suggestions</h5>';
      errorsByType.suggestion.forEach(suggestion => {
        errorList += this.formatValidationItem(suggestion, '💡');
      });
      errorList += '</div>';
    }

    validationContent.innerHTML = errorList;
    validationPanel.style.display = 'block';

    // Update validation summary
    this.updateValidationSummary(errorsByType);
  }

  /**
   * Formats a validation item for display.
   *
   * @method formatValidationItem
   * @param {Object} item - Validation item
   * @param {string} icon - Icon to display
   * @returns {string} Formatted HTML
   * @since 2.0.0
   */
  formatValidationItem(item, icon) {
    const severityClass = item.severity ? `severity-${item.severity}` : '';
    const location = item.line > 0 ? `<span class="error-location">Line ${item.line + 1}</span>` : '';
    const code = item.code ? `<span class="error-code">${item.code}</span>` : '';

    return `
      <div class="validation-error validation-${item.type} ${severityClass}">
        <span class="error-icon">${icon}</span>
        <div class="error-details">
          <span class="error-message">${item.message}</span>
          <div class="error-meta">
            ${location}
            ${code}
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Updates the validation summary in the editor status.
   *
   * @method updateValidationSummary
   * @param {Object} errorsByType - Errors grouped by type
   * @since 2.0.0
   */
  updateValidationSummary(errorsByType) {
    const statusElement = this.container.querySelector('#editorStatus');
    if (!statusElement) return;

    if (!errorsByType) {
      statusElement.className = 'status-indicator status-valid';
      statusElement.textContent = 'Valid';
      return;
    }

    const errorCount = errorsByType.error.length;
    const warningCount = errorsByType.warning.length;
    const suggestionCount = errorsByType.suggestion.length;

    if (errorCount > 0) {
      statusElement.className = 'status-indicator status-error';
      statusElement.textContent = `${errorCount} error${errorCount > 1 ? 's' : ''}`;
    } else if (warningCount > 0) {
      statusElement.className = 'status-indicator status-warning';
      statusElement.textContent = `${warningCount} warning${warningCount > 1 ? 's' : ''}`;
    } else if (suggestionCount > 0) {
      statusElement.className = 'status-indicator status-suggestion';
      statusElement.textContent = `${suggestionCount} suggestion${suggestionCount > 1 ? 's' : ''}`;
    } else {
      statusElement.className = 'status-indicator status-valid';
      statusElement.textContent = 'Valid';
    }

    // Show validation score if available
    if (this.lastValidationResults && this.lastValidationResults.score !== undefined) {
      const scoreElement = this.container.querySelector('#validationScore');
      if (scoreElement) {
        scoreElement.textContent = `Score: ${this.lastValidationResults.score}/100`;
        scoreElement.className = `validation-score score-${this.getScoreClass(this.lastValidationResults.score)}`;
      }
    }
  }

  /**
   * Gets CSS class for validation score.
   *
   * @method getScoreClass
   * @param {number} score - Validation score
   * @returns {string} CSS class name
   * @since 2.0.0
   */
  getScoreClass(score) {
    if (score >= 90) return 'excellent';
    if (score >= 80) return 'good';
    if (score >= 70) return 'fair';
    if (score >= 60) return 'poor';
    return 'bad';
  }

  /**
   * Toggles the preview panel visibility.
   *
   * @method togglePreview
   * @since 2.0.0
   */
  togglePreview() {
    const previewPanel = this.container.querySelector('#previewPanel');
    const toggleButton = this.container.querySelector('#togglePreview');

    if (previewPanel.style.display === 'none') {
      previewPanel.style.display = 'block';
      toggleButton.textContent = 'Hide Preview';
      this.updatePreview();
    } else {
      previewPanel.style.display = 'none';
      toggleButton.textContent = 'Preview';
    }
  }

  /**
   * Checks if preview panel is visible.
   *
   * @method isPreviewVisible
   * @returns {boolean} True if preview is visible
   * @since 2.0.0
   */
  isPreviewVisible() {
    const previewPanel = this.container.querySelector('#previewPanel');
    return previewPanel && previewPanel.style.display !== 'none';
  }

  /**
   * Updates the live preview.
   *
   * @method updatePreview
   * @since 2.0.0
   */
  updatePreview() {
    if (!this.isPreviewVisible()) return;

    const content = this.editor.getValue();
    const previewOutput = this.container.querySelector('#previewOutput');

    if (!previewOutput) return;

    try {
      const rendered = this.renderTemplate(content, this.previewData);
      previewOutput.innerHTML = `
        <div class="preview-rendered">
          <pre>${this.escapeHtml(rendered)}</pre>
        </div>
      `;
    } catch (error) {
      previewOutput.innerHTML = `
        <div class="preview-error">
          <span class="error-icon">❌</span>
          <span class="error-message">Preview Error: ${error.message}</span>
        </div>
      `;
    }
  }

  /**
   * Renders a template with provided data.
   *
   * @method renderTemplate
   * @param {string} template - Template content
   * @param {Object} data - Data to render with
   * @returns {string} Rendered template
   * @since 2.0.0
   */
  renderTemplate(template, data) {
    let rendered = template;

    // Replace variables with data
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`\\{${key}\\}`, 'g');
      rendered = rendered.replace(regex, data[key]);
    });

    // Check for unresolved variables
    const unresolvedVars = rendered.match(/\{[^}]+\}/g);
    if (unresolvedVars) {
      console.warn('Unresolved variables:', unresolvedVars);
    }

    return rendered;
  }

  /**
   * Escapes HTML characters.
   *
   * @method escapeHtml
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   * @since 2.0.0
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Tests the current template.
   *
   * @method testTemplate
   * @since 2.0.0
   */
  testTemplate() {
    // This will be implemented in the next phase with the testing framework
    console.log('Template testing will be implemented in the testing framework phase');
  }

  /**
   * Gets the current template content.
   *
   * @method getValue
   * @returns {string} Template content
   * @since 2.0.0
   */
  getValue() {
    return this.editor ? this.editor.getValue() : '';
  }

  /**
   * Sets the template content.
   *
   * @method setValue
   * @param {string} content - Template content
   * @since 2.0.0
   */
  setValue(content) {
    if (this.editor) {
      this.editor.setValue(content || '');
    }
  }

  /**
   * Focuses the editor.
   *
   * @method focus
   * @since 2.0.0
   */
  focus() {
    if (this.editor) {
      this.editor.focus();
    }
  }

  /**
   * Destroys the editor instance.
   *
   * @method destroy
   * @since 2.0.0
   */
  destroy() {
    if (this.editor) {
      this.editor.toTextArea();
      this.editor = null;
    }
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = TemplateEditor;
} else if (typeof window !== 'undefined') {
  window.TemplateEditor = TemplateEditor;
}
