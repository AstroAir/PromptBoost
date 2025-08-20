/**
 * @fileoverview Enhanced Error Feedback System for PromptBoost Extension
 * Provides user-friendly error feedback with visual indicators and recovery options.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

/**
 * Enhanced error feedback system for providing visual error indicators and recovery options.
 * Works in content script context to show inline error messages and recovery actions.
 * 
 * @class ErrorFeedback
 * @since 2.0.0
 */
class ErrorFeedback {
  /**
   * Creates an instance of ErrorFeedback.
   * 
   * @constructor
   */
  constructor() {
    this.activeNotifications = new Map();
    this.setupStyles();
    this.setupMessageListener();
  }

  /**
   * Sets up CSS styles for error feedback UI.
   * 
   * @method setupStyles
   * @private
   */
  setupStyles() {
    if (document.getElementById('promptboost-error-styles')) {
      return; // Styles already injected
    }

    const styles = `
      .promptboost-error-notification {
        position: fixed;
        top: 20px;
        right: 20px;
        max-width: 400px;
        background: #fff;
        border: 1px solid #e74c3c;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        animation: promptboost-slide-in 0.3s ease-out;
      }

      .promptboost-error-header {
        background: #e74c3c;
        color: white;
        padding: 12px 16px;
        border-radius: 8px 8px 0 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
      }

      .promptboost-error-title {
        font-weight: 600;
        margin: 0;
        display: flex;
        align-items: center;
      }

      .promptboost-error-icon {
        margin-right: 8px;
        font-size: 16px;
      }

      .promptboost-error-close {
        background: none;
        border: none;
        color: white;
        font-size: 18px;
        cursor: pointer;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 4px;
      }

      .promptboost-error-close:hover {
        background: rgba(255, 255, 255, 0.2);
      }

      .promptboost-error-body {
        padding: 16px;
      }

      .promptboost-error-message {
        margin: 0 0 12px 0;
        color: #333;
        line-height: 1.4;
      }

      .promptboost-error-actions {
        display: flex;
        gap: 8px;
        margin-top: 12px;
      }

      .promptboost-error-button {
        padding: 8px 16px;
        border: none;
        border-radius: 4px;
        cursor: pointer;
        font-size: 13px;
        font-weight: 500;
        transition: background-color 0.2s;
      }

      .promptboost-error-button-primary {
        background: #3498db;
        color: white;
      }

      .promptboost-error-button-primary:hover {
        background: #2980b9;
      }

      .promptboost-error-button-secondary {
        background: #ecf0f1;
        color: #2c3e50;
      }

      .promptboost-error-button-secondary:hover {
        background: #d5dbdb;
      }

      .promptboost-error-details {
        margin-top: 12px;
        padding-top: 12px;
        border-top: 1px solid #ecf0f1;
        font-size: 12px;
        color: #7f8c8d;
      }

      .promptboost-error-details-toggle {
        background: none;
        border: none;
        color: #3498db;
        cursor: pointer;
        font-size: 12px;
        text-decoration: underline;
        padding: 0;
      }

      @keyframes promptboost-slide-in {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }

      .promptboost-error-notification.fade-out {
        animation: promptboost-slide-out 0.3s ease-in forwards;
      }

      @keyframes promptboost-slide-out {
        from {
          transform: translateX(0);
          opacity: 1;
        }
        to {
          transform: translateX(100%);
          opacity: 0;
        }
      }

      .promptboost-inline-error {
        background: #fdf2f2;
        border: 1px solid #fca5a5;
        border-radius: 6px;
        padding: 12px;
        margin: 8px 0;
        color: #991b1b;
        font-size: 14px;
        display: flex;
        align-items: flex-start;
        gap: 8px;
      }

      .promptboost-inline-error-icon {
        color: #dc2626;
        font-size: 16px;
        margin-top: 1px;
      }

      .promptboost-inline-error-content {
        flex: 1;
      }

      .promptboost-inline-error-message {
        margin: 0 0 8px 0;
        font-weight: 500;
      }

      .promptboost-inline-error-actions {
        display: flex;
        gap: 8px;
        margin-top: 8px;
      }

      .promptboost-inline-error-button {
        background: #dc2626;
        color: white;
        border: none;
        padding: 4px 12px;
        border-radius: 4px;
        font-size: 12px;
        cursor: pointer;
      }

      .promptboost-inline-error-button:hover {
        background: #b91c1c;
      }

      .promptboost-inline-error-button.secondary {
        background: transparent;
        color: #dc2626;
        border: 1px solid #dc2626;
      }

      .promptboost-inline-error-button.secondary:hover {
        background: #dc2626;
        color: white;
      }
    `;

    const styleSheet = document.createElement('style');
    styleSheet.id = 'promptboost-error-styles';
    styleSheet.textContent = styles;
    document.head.appendChild(styleSheet);
  }

  /**
   * Sets up message listener for error notifications.
   * 
   * @method setupMessageListener
   * @private
   */
  setupMessageListener() {
    // Listen for error notifications from background script
    chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
      if (message.type === 'ERROR_NOTIFICATION') {
        this.showErrorNotification(message.error);
      } else if (message.type === 'ERROR_RECOVERY_SUCCESS') {
        this.showRecoverySuccess(message.errorId);
      }
    });

    // Listen for window messages (fallback)
    window.addEventListener('message', (event) => {
      if (event.data.type === 'PROMPTBOOST_ERROR_NOTIFICATION') {
        this.showErrorNotification(event.data.error);
      }
    });
  }

  /**
   * Shows an error notification with recovery options.
   * 
   * @method showErrorNotification
   * @param {Object} error - Error object
   * @param {Object} options - Display options
   */
  showErrorNotification(error, options = {}) {
    const notification = this.createNotificationElement(error, options);
    document.body.appendChild(notification);
    
    this.activeNotifications.set(error.id, notification);

    // Auto-dismiss after timeout (unless it's a critical error)
    if (error.severity !== 'CRITICAL') {
      setTimeout(() => {
        this.dismissNotification(error.id);
      }, options.timeout || 8000);
    }
  }

  /**
   * Shows an inline error message near a specific element.
   * 
   * @method showInlineError
   * @param {Element} targetElement - Element to show error near
   * @param {Object} error - Error object
   * @param {Object} options - Display options
   */
  showInlineError(targetElement, error, options = {}) {
    // Remove any existing inline error for this element
    const existingError = targetElement.parentNode.querySelector('.promptboost-inline-error');
    if (existingError) {
      existingError.remove();
    }

    const errorElement = this.createInlineErrorElement(error, options);
    
    if (options.position === 'before') {
      targetElement.parentNode.insertBefore(errorElement, targetElement);
    } else {
      targetElement.parentNode.insertBefore(errorElement, targetElement.nextSibling);
    }

    // Auto-dismiss after timeout
    setTimeout(() => {
      if (errorElement.parentNode) {
        errorElement.remove();
      }
    }, options.timeout || 6000);
  }

  /**
   * Creates a notification element.
   * 
   * @method createNotificationElement
   * @param {Object} error - Error object
   * @param {Object} options - Display options
   * @returns {Element} Notification element
   * @private
   */
  createNotificationElement(error, options) {
    const notification = document.createElement('div');
    notification.className = 'promptboost-error-notification';
    notification.setAttribute('data-error-id', error.id);

    const actions = this.getErrorActions(error);
    const showDetails = options.showDetails !== false;

    notification.innerHTML = `
      <div class="promptboost-error-header">
        <h4 class="promptboost-error-title">
          <span class="promptboost-error-icon">⚠️</span>
          PromptBoost Error
        </h4>
        <button class="promptboost-error-close" aria-label="Close">×</button>
      </div>
      <div class="promptboost-error-body">
        <p class="promptboost-error-message">${error.userMessage || error.message}</p>
        ${actions.length > 0 ? `
          <div class="promptboost-error-actions">
            ${actions.map(action => `
              <button class="promptboost-error-button ${action.primary ? 'promptboost-error-button-primary' : 'promptboost-error-button-secondary'}" 
                      data-action="${action.id}">
                ${action.label}
              </button>
            `).join('')}
          </div>
        ` : ''}
        ${showDetails ? `
          <div class="promptboost-error-details">
            <button class="promptboost-error-details-toggle">Show technical details</button>
            <div class="promptboost-error-details-content" style="display: none;">
              <strong>Error ID:</strong> ${error.id}<br>
              <strong>Context:</strong> ${error.context}<br>
              <strong>Category:</strong> ${error.category}<br>
              <strong>Time:</strong> ${new Date(error.timestamp).toLocaleString()}
            </div>
          </div>
        ` : ''}
      </div>
    `;

    this.setupNotificationEventListeners(notification, error);
    return notification;
  }

  /**
   * Creates an inline error element.
   * 
   * @method createInlineErrorElement
   * @param {Object} error - Error object
   * @param {Object} options - Display options
   * @returns {Element} Inline error element
   * @private
   */
  createInlineErrorElement(error, _options) {
    const errorElement = document.createElement('div');
    errorElement.className = 'promptboost-inline-error';
    errorElement.setAttribute('data-error-id', error.id);

    const actions = this.getErrorActions(error, { inline: true });

    errorElement.innerHTML = `
      <div class="promptboost-inline-error-icon">⚠️</div>
      <div class="promptboost-inline-error-content">
        <div class="promptboost-inline-error-message">${error.userMessage || error.message}</div>
        ${actions.length > 0 ? `
          <div class="promptboost-inline-error-actions">
            ${actions.map(action => `
              <button class="promptboost-inline-error-button ${action.primary ? '' : 'secondary'}" 
                      data-action="${action.id}">
                ${action.label}
              </button>
            `).join('')}
          </div>
        ` : ''}
      </div>
    `;

    this.setupInlineErrorEventListeners(errorElement, error);
    return errorElement;
  }

  /**
   * Gets appropriate actions for an error.
   * 
   * @method getErrorActions
   * @param {Object} error - Error object
   * @param {Object} options - Action options
   * @returns {Array} Array of action objects
   * @private
   */
  getErrorActions(error, _options = {}) {
    const actions = [];

    switch (error.category) {
      case 'AUTHENTICATION':
        actions.push(
          { id: 'open-settings', label: 'Open Settings', primary: true },
          { id: 'retry', label: 'Retry', primary: false }
        );
        break;
      case 'NETWORK':
        actions.push(
          { id: 'retry', label: 'Retry', primary: true },
          { id: 'check-connection', label: 'Check Connection', primary: false }
        );
        break;
      case 'API':
        actions.push(
          { id: 'retry', label: 'Retry', primary: true }
        );
        break;
      case 'CONFIGURATION':
        actions.push(
          { id: 'reset-config', label: 'Reset Settings', primary: true },
          { id: 'open-settings', label: 'Open Settings', primary: false }
        );
        break;
      default:
        actions.push(
          { id: 'retry', label: 'Retry', primary: true }
        );
    }

    return actions;
  }

  /**
   * Sets up event listeners for notification element.
   * 
   * @method setupNotificationEventListeners
   * @param {Element} notification - Notification element
   * @param {Object} error - Error object
   * @private
   */
  setupNotificationEventListeners(notification, error) {
    // Close button
    const closeButton = notification.querySelector('.promptboost-error-close');
    closeButton.addEventListener('click', () => {
      this.dismissNotification(error.id);
    });

    // Action buttons
    const actionButtons = notification.querySelectorAll('[data-action]');
    actionButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.handleErrorAction(button.dataset.action, error);
      });
    });

    // Details toggle
    const detailsToggle = notification.querySelector('.promptboost-error-details-toggle');
    if (detailsToggle) {
      detailsToggle.addEventListener('click', () => {
        const content = notification.querySelector('.promptboost-error-details-content');
        const isVisible = content.style.display !== 'none';
        content.style.display = isVisible ? 'none' : 'block';
        detailsToggle.textContent = isVisible ? 'Show technical details' : 'Hide technical details';
      });
    }
  }

  /**
   * Sets up event listeners for inline error element.
   * 
   * @method setupInlineErrorEventListeners
   * @param {Element} errorElement - Error element
   * @param {Object} error - Error object
   * @private
   */
  setupInlineErrorEventListeners(errorElement, error) {
    // Action buttons
    const actionButtons = errorElement.querySelectorAll('[data-action]');
    actionButtons.forEach(button => {
      button.addEventListener('click', () => {
        this.handleErrorAction(button.dataset.action, error);
        errorElement.remove(); // Remove inline error after action
      });
    });
  }

  /**
   * Handles error action button clicks.
   * 
   * @method handleErrorAction
   * @param {string} actionId - Action identifier
   * @param {Object} error - Error object
   * @private
   */
  handleErrorAction(actionId, error) {
    switch (actionId) {
      case 'retry':
        chrome.runtime.sendMessage({
          type: 'ERROR_RETRY',
          errorId: error.id,
          context: error.context,
          metadata: error.metadata
        });
        break;
      case 'open-settings':
        chrome.runtime.sendMessage({ type: 'OPEN_OPTIONS_PAGE' });
        break;
      case 'check-connection':
        chrome.tabs.create({ url: 'chrome://settings/internet' });
        break;
      case 'reset-config':
        chrome.runtime.sendMessage({
          type: 'RESET_CONFIGURATION',
          errorId: error.id
        });
        break;
    }
  }

  /**
   * Dismisses a notification.
   * 
   * @method dismissNotification
   * @param {string} errorId - Error ID
   */
  dismissNotification(errorId) {
    const notification = this.activeNotifications.get(errorId);
    if (notification) {
      notification.classList.add('fade-out');
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
        this.activeNotifications.delete(errorId);
      }, 300);
    }
  }

  /**
   * Shows a recovery success message.
   * 
   * @method showRecoverySuccess
   * @param {string} errorId - Error ID that was recovered
   */
  showRecoverySuccess(errorId) {
    // Dismiss the original error notification
    this.dismissNotification(errorId);

    // Show a brief success message
    const successNotification = document.createElement('div');
    successNotification.className = 'promptboost-error-notification';
    successNotification.style.borderColor = '#27ae60';
    successNotification.innerHTML = `
      <div class="promptboost-error-header" style="background: #27ae60;">
        <h4 class="promptboost-error-title">
          <span class="promptboost-error-icon">✅</span>
          Issue Resolved
        </h4>
      </div>
      <div class="promptboost-error-body">
        <p class="promptboost-error-message">The issue has been automatically resolved. You can continue using PromptBoost.</p>
      </div>
    `;

    document.body.appendChild(successNotification);

    // Auto-dismiss success message
    setTimeout(() => {
      successNotification.classList.add('fade-out');
      setTimeout(() => {
        if (successNotification.parentNode) {
          successNotification.remove();
        }
      }, 300);
    }, 3000);
  }
}

// Export for use in content scripts
if (typeof window !== 'undefined') {
  window.ErrorFeedback = ErrorFeedback;
}
