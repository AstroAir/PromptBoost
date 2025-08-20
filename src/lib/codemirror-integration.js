/**
 * @fileoverview CodeMirror Integration for PromptBoost
 * Provides a lightweight CodeMirror-like editor for template editing
 * when CodeMirror is not available.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

/**
 * Lightweight CodeMirror-like editor implementation.
 * Provides basic editing functionality when CodeMirror is not available.
 * 
 * @class CodeMirror
 * @since 2.0.0
 */
window.CodeMirror = window.CodeMirror || (function () {

  /**
   * Creates a CodeMirror-like editor instance.
   * 
   * @param {HTMLElement} element - Container element
   * @param {Object} options - Editor options
   * @returns {Object} Editor instance
   */
  function CodeMirror(element, options = {}) {
    const instance = {
      element: element,
      textarea: null,
      options: options,
      listeners: {},

      init() {
        this.createEditor();
        this.setupEventListeners();
      },

      createEditor() {
        // Create textarea for editing
        this.textarea = document.createElement('textarea');
        this.textarea.className = 'codemirror-textarea';
        this.textarea.placeholder = this.options.placeholder || '';
        this.textarea.value = this.options.value || '';

        // Apply styles
        Object.assign(this.textarea.style, {
          width: '100%',
          height: '100%',
          border: 'none',
          outline: 'none',
          resize: 'none',
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          fontSize: '14px',
          lineHeight: '1.5',
          padding: '1rem',
          backgroundColor: 'transparent',
          color: 'inherit'
        });

        if (this.options.lineNumbers) {
          this.createLineNumbers();
        }

        this.element.appendChild(this.textarea);
        this.element.style.position = 'relative';
        this.element.style.overflow = 'hidden';
      },

      createLineNumbers() {
        const lineNumbers = document.createElement('div');
        lineNumbers.className = 'codemirror-linenumbers';
        Object.assign(lineNumbers.style, {
          position: 'absolute',
          left: '0',
          top: '0',
          width: '3rem',
          height: '100%',
          backgroundColor: '#f8f9fa',
          borderRight: '1px solid #e9ecef',
          padding: '1rem 0.5rem',
          fontSize: '12px',
          lineHeight: '1.5',
          color: '#6c757d',
          fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace',
          userSelect: 'none',
          overflow: 'hidden'
        });

        this.textarea.style.paddingLeft = '4rem';
        this.element.appendChild(lineNumbers);
        this.lineNumbers = lineNumbers;

        this.updateLineNumbers();
      },

      updateLineNumbers() {
        if (!this.lineNumbers) return;

        const lines = this.textarea.value.split('\n').length;
        const numbers = Array.from({ length: lines }, (_, i) => i + 1).join('\n');
        this.lineNumbers.textContent = numbers;
      },

      setupEventListeners() {
        // Input event for content changes
        this.textarea.addEventListener('input', () => {
          this.updateLineNumbers();
          this.trigger('change', this, { origin: 'input' });
        });

        // Focus/blur events
        this.textarea.addEventListener('focus', () => {
          this.trigger('focus', this);
        });

        this.textarea.addEventListener('blur', () => {
          this.trigger('blur', this);
        });

        // Cursor activity
        this.textarea.addEventListener('keyup', () => {
          this.trigger('cursorActivity', this);
        });

        this.textarea.addEventListener('click', () => {
          this.trigger('cursorActivity', this);
        });
      },

      on(event, callback) {
        if (!this.listeners[event]) {
          this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
      },

      trigger(event, ...args) {
        if (this.listeners[event]) {
          this.listeners[event].forEach(callback => callback(...args));
        }
      },

      getValue() {
        return this.textarea.value;
      },

      setValue(value) {
        this.textarea.value = value || '';
        this.updateLineNumbers();
        this.trigger('change', this, { origin: 'setValue' });
      },

      getCursor() {
        const pos = this.textarea.selectionStart;
        const lines = this.textarea.value.substring(0, pos).split('\n');
        return {
          line: lines.length - 1,
          ch: lines[lines.length - 1].length
        };
      },

      replaceRange(text, from, to) {
        const value = this.textarea.value;
        const start = this.posToIndex(from);
        const end = to ? this.posToIndex(to) : start;

        const newValue = value.substring(0, start) + text + value.substring(end);
        this.setValue(newValue);

        // Set cursor after inserted text
        const newPos = start + text.length;
        this.textarea.setSelectionRange(newPos, newPos);
      },

      posToIndex(pos) {
        const lines = this.textarea.value.split('\n');
        let index = 0;
        for (let i = 0; i < pos.line && i < lines.length; i++) {
          index += lines[i].length + 1; // +1 for newline
        }
        return index + Math.min(pos.ch, lines[pos.line]?.length || 0);
      },

      focus() {
        this.textarea.focus();
      },

      toTextArea() {
        // Cleanup method
        if (this.element && this.textarea) {
          this.element.innerHTML = '';
        }
      }
    };

    instance.init();
    return instance;
  }

  // Static methods and properties
  CodeMirror.defineMode = function (name, _mode) {
    // Stub for mode definition
    console.log(`Mode '${name}' defined (stub implementation)`);
  };

  CodeMirror.registerHelper = function (type, name, _helper) {
    // Stub for helper registration
    console.log(`Helper '${name}' registered for '${type}' (stub implementation)`);
  };

  CodeMirror.Pos = function (line, ch) {
    return { line: line, ch: ch };
  };

  return CodeMirror;
})();

/**
 * Enhanced textarea with syntax highlighting simulation.
 * Provides visual feedback for template variables and keywords.
 */
class EnhancedTextarea {
  constructor(textarea) {
    this.textarea = textarea;
    this.highlightOverlay = null;
    this.init();
  }

  init() {
    this.createHighlightOverlay();
    this.setupEventListeners();
  }

  createHighlightOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'syntax-highlight-overlay';
    Object.assign(overlay.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      right: '0',
      bottom: '0',
      pointerEvents: 'none',
      fontFamily: this.textarea.style.fontFamily,
      fontSize: this.textarea.style.fontSize,
      lineHeight: this.textarea.style.lineHeight,
      padding: this.textarea.style.padding,
      margin: this.textarea.style.margin,
      border: 'none',
      backgroundColor: 'transparent',
      color: 'transparent',
      whiteSpace: 'pre-wrap',
      wordWrap: 'break-word',
      overflow: 'hidden'
    });

    this.textarea.parentNode.style.position = 'relative';
    this.textarea.parentNode.appendChild(overlay);
    this.highlightOverlay = overlay;

    // Make textarea background transparent
    this.textarea.style.backgroundColor = 'transparent';
    this.textarea.style.position = 'relative';
    this.textarea.style.zIndex = '2';
  }

  setupEventListeners() {
    this.textarea.addEventListener('input', () => this.updateHighlights());
    this.textarea.addEventListener('scroll', () => this.syncScroll());
    this.updateHighlights();
  }

  updateHighlights() {
    if (!this.highlightOverlay) return;

    const content = this.textarea.value;
    const highlighted = this.highlightSyntax(content);
    this.highlightOverlay.innerHTML = highlighted;
  }

  highlightSyntax(content) {
    return content
      // Highlight template variables
      .replace(/(\{[^}]+\})/g, '<span style="color: #0066cc; font-weight: 600; background: rgba(0, 102, 204, 0.1); padding: 0.125rem 0.25rem; border-radius: 0.25rem;">$1</span>')
      // Highlight keywords
      .replace(/\b(Please|Improve|Rewrite|Summarize|Translate|Format|Generate|Create|Analyze)\b/gi, '<span style="color: #8b5cf6; font-weight: 600;">$1</span>')
      // Highlight quoted text
      .replace(/"([^"]*)"/g, '<span style="color: #059669;">"$1"</span>')
      // Preserve whitespace and line breaks
      .replace(/\n/g, '<br>')
      .replace(/ {2}/g, '&nbsp;&nbsp;');
  }

  syncScroll() {
    if (this.highlightOverlay) {
      this.highlightOverlay.scrollTop = this.textarea.scrollTop;
      this.highlightOverlay.scrollLeft = this.textarea.scrollLeft;
    }
  }
}

// Auto-enhance textareas with template-editor class
document.addEventListener('DOMContentLoaded', () => {
  const templateTextareas = document.querySelectorAll('textarea.template-editor');
  templateTextareas.forEach(textarea => {
    new EnhancedTextarea(textarea);
  });
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { CodeMirror, EnhancedTextarea };
} else if (typeof window !== 'undefined') {
  window.EnhancedTextarea = EnhancedTextarea;
}
