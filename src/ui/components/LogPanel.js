/**
 * @fileoverview Real-time Log Panel Component for PromptBoost
 * Displays logs from all parts of the extension in real-time with filtering and export capabilities.
 * 
 * @author PromptBoost Team
 * @version 2.0.0
 * @since 2.0.0
 */

/**
 * Real-time log panel component
 * @class LogPanel
 */
class LogPanel {
  /**
   * Creates LogPanel instance
   * 
   * @constructor
   * @param {HTMLElement} container - Container element for the log panel
   */
  constructor(container) {
    this.container = container;
    this.logCollector = LogCollector.getInstance();
    this.isVisible = false;
    this.autoScroll = true;

    // Pagination settings
    this.pagination = {
      currentPage: 1,
      itemsPerPage: 50,
      totalItems: 0,
      totalPages: 1
    };

    // Drag functionality
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };

    this.init();
  }

  /**
   * Initializes the log panel
   * 
   * @method init
   */
  init() {
    this.createPanelHTML();
    this.bindElements();
    this.setupEventListeners();
    this.setupLogCollectorListeners();
    this.setupDragFunctionality();
    this.refreshLogs();
  }

  /**
   * Creates the log panel HTML structure
   * 
   * @method createPanelHTML
   */
  createPanelHTML() {
    this.container.innerHTML = `
      <div class="log-panel" id="logPanel">
        <div class="log-panel-header">
          <div class="log-panel-title">
            <span class="log-panel-icon">📋</span>
            <span>Real-time Logs</span>
            <span class="log-count" id="logCount">0</span>
          </div>
          <div class="log-panel-controls">
            <button type="button" id="logPanelToggle" class="log-panel-btn log-panel-toggle" title="Toggle log panel">
              <span class="toggle-icon">▼</span>
            </button>
          </div>
        </div>
        
        <div class="log-panel-content" id="logPanelContent">
          <div class="log-panel-toolbar">
            <div class="log-filters">
              <select id="logLevelFilter" class="log-filter-select">
                <option value="">All Levels</option>
                <option value="DEBUG">Debug</option>
                <option value="INFO">Info</option>
                <option value="WARN">Warning</option>
                <option value="ERROR">Error</option>
              </select>
              
              <select id="logModuleFilter" class="log-filter-select">
                <option value="">All Modules</option>
              </select>
              
              <select id="logContextFilter" class="log-filter-select">
                <option value="">All Contexts</option>
                <option value="background">Background</option>
                <option value="content">Content</option>
                <option value="options">Options</option>
              </select>
              
              <input type="text" id="logSearchFilter" class="log-search-input" placeholder="Search logs...">
            </div>
            
            <div class="log-actions">
              <button type="button" id="logAutoScroll" class="log-panel-btn log-auto-scroll active" title="Auto-scroll to latest logs">
                📍
              </button>
              <button type="button" id="logClear" class="log-panel-btn" title="Clear all logs">
                🗑️
              </button>
              <button type="button" id="logExport" class="log-panel-btn" title="Export logs">
                💾
              </button>
              <button type="button" id="logRefresh" class="log-panel-btn" title="Refresh logs">
                🔄
              </button>
            </div>
          </div>
          
          <div class="log-display" id="logDisplay">
            <div class="log-entries" id="logEntries">
              <!-- Log entries will be inserted here -->
            </div>
          </div>
          
          <div class="log-panel-footer">
            <div class="log-stats" id="logStats">
              <span>Total: <span id="totalLogs">0</span></span>
              <span>Errors: <span id="errorLogs">0</span></span>
              <span>Warnings: <span id="warnLogs">0</span></span>
            </div>

            <div class="log-pagination" id="logPagination">
              <span class="log-pagination-info" id="paginationInfo">Page 1 of 1</span>
              <button type="button" id="firstPageBtn" class="log-pagination-btn" title="First page">⏮</button>
              <button type="button" id="prevPageBtn" class="log-pagination-btn" title="Previous page">◀</button>
              <button type="button" id="nextPageBtn" class="log-pagination-btn" title="Next page">▶</button>
              <button type="button" id="lastPageBtn" class="log-pagination-btn" title="Last page">⏭</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Binds DOM elements
   * 
   * @method bindElements
   */
  bindElements() {
    this.elements = {
      panel: document.getElementById('logPanel'),
      content: document.getElementById('logPanelContent'),
      toggle: document.getElementById('logPanelToggle'),
      toggleIcon: this.container.querySelector('.toggle-icon'),
      logCount: document.getElementById('logCount'),
      
      // Filters
      levelFilter: document.getElementById('logLevelFilter'),
      moduleFilter: document.getElementById('logModuleFilter'),
      contextFilter: document.getElementById('logContextFilter'),
      searchFilter: document.getElementById('logSearchFilter'),
      
      // Actions
      autoScrollBtn: document.getElementById('logAutoScroll'),
      clearBtn: document.getElementById('logClear'),
      exportBtn: document.getElementById('logExport'),
      refreshBtn: document.getElementById('logRefresh'),
      
      // Display
      logEntries: document.getElementById('logEntries'),
      
      // Stats
      totalLogs: document.getElementById('totalLogs'),
      errorLogs: document.getElementById('errorLogs'),
      warnLogs: document.getElementById('warnLogs'),

      // Pagination
      paginationInfo: document.getElementById('paginationInfo'),
      firstPageBtn: document.getElementById('firstPageBtn'),
      prevPageBtn: document.getElementById('prevPageBtn'),
      nextPageBtn: document.getElementById('nextPageBtn'),
      lastPageBtn: document.getElementById('lastPageBtn')
    };
  }

  /**
   * Sets up event listeners
   * 
   * @method setupEventListeners
   */
  setupEventListeners() {
    // Toggle panel visibility
    this.elements.toggle.addEventListener('click', () => this.togglePanel());
    
    // Filter events
    this.elements.levelFilter.addEventListener('change', (e) => {
      this.logCollector.setFilter('level', e.target.value || null);
      this.refreshLogs();
    });
    
    this.elements.moduleFilter.addEventListener('change', (e) => {
      this.logCollector.setFilter('module', e.target.value || null);
      this.refreshLogs();
    });
    
    this.elements.contextFilter.addEventListener('change', (e) => {
      this.logCollector.setFilter('context', e.target.value || null);
      this.refreshLogs();
    });
    
    this.elements.searchFilter.addEventListener('input', (e) => {
      this.logCollector.setFilter('search', e.target.value || null);
      this.refreshLogs();
    });
    
    // Action events
    this.elements.autoScrollBtn.addEventListener('click', () => this.toggleAutoScroll());
    this.elements.clearBtn.addEventListener('click', () => this.clearLogs());
    this.elements.exportBtn.addEventListener('click', () => this.exportLogs());
    this.elements.refreshBtn.addEventListener('click', () => this.refreshLogs());

    // Pagination events
    this.elements.firstPageBtn.addEventListener('click', () => this.goToPage(1));
    this.elements.prevPageBtn.addEventListener('click', () => this.goToPage(this.pagination.currentPage - 1));
    this.elements.nextPageBtn.addEventListener('click', () => this.goToPage(this.pagination.currentPage + 1));
    this.elements.lastPageBtn.addEventListener('click', () => this.goToPage(this.pagination.totalPages));
  }

  /**
   * Sets up LogCollector event listeners
   * 
   * @method setupLogCollectorListeners
   */
  setupLogCollectorListeners() {
    this.logCollector.addEventListener((eventType, data) => {
      switch (eventType) {
        case 'logAdded':
          this.addLogEntry(data);
          this.updateStats();
          break;
        case 'logsCleared':
          this.clearDisplay();
          this.updateStats();
          break;
        case 'filtersChanged':
          this.refreshLogs();
          break;
      }
    });
  }

  /**
   * Toggles panel visibility
   * 
   * @method togglePanel
   */
  togglePanel() {
    this.isVisible = !this.isVisible;
    
    if (this.isVisible) {
      this.elements.content.style.display = 'block';
      this.elements.toggleIcon.textContent = '▲';
      this.elements.panel.classList.add('expanded');
    } else {
      this.elements.content.style.display = 'none';
      this.elements.toggleIcon.textContent = '▼';
      this.elements.panel.classList.remove('expanded');
    }
  }

  /**
   * Toggles auto-scroll functionality
   * 
   * @method toggleAutoScroll
   */
  toggleAutoScroll() {
    this.autoScroll = !this.autoScroll;
    this.elements.autoScrollBtn.classList.toggle('active', this.autoScroll);
    
    if (this.autoScroll) {
      this.scrollToBottom();
    }
  }

  /**
   * Clears all logs
   * 
   * @method clearLogs
   */
  clearLogs() {
    if (confirm('Are you sure you want to clear all logs?')) {
      this.logCollector.clearLogs();
    }
  }

  /**
   * Exports logs to file
   * 
   * @method exportLogs
   */
  exportLogs() {
    const logsJson = this.logCollector.exportLogs();
    const blob = new Blob([logsJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptboost-logs-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /**
   * Refreshes the log display
   * 
   * @method refreshLogs
   */
  refreshLogs() {
    this.clearDisplay();
    const logs = this.logCollector.getFilteredLogs();

    // Update pagination
    this.pagination.totalItems = logs.length;
    this.pagination.totalPages = Math.max(1, Math.ceil(logs.length / this.pagination.itemsPerPage));

    // Ensure current page is valid
    if (this.pagination.currentPage > this.pagination.totalPages) {
      this.pagination.currentPage = this.pagination.totalPages;
    }

    // Get logs for current page
    const startIndex = (this.pagination.currentPage - 1) * this.pagination.itemsPerPage;
    const endIndex = startIndex + this.pagination.itemsPerPage;
    const displayLogs = logs.slice(startIndex, endIndex);

    displayLogs.forEach(log => this.addLogEntry(log, false));
    this.updateStats();
    this.updateModuleFilter();
    this.updatePagination();

    if (this.autoScroll && this.pagination.currentPage === this.pagination.totalPages) {
      this.scrollToBottom();
    }
  }

  /**
   * Clears the log display
   * 
   * @method clearDisplay
   */
  clearDisplay() {
    this.elements.logEntries.innerHTML = '';
  }

  /**
   * Adds a log entry to the display
   * 
   * @method addLogEntry
   * @param {Object} logEntry - Log entry to add
   * @param {boolean} [scroll=true] - Whether to auto-scroll
   */
  addLogEntry(logEntry, scroll = true) {
    const logElement = this.createLogElement(logEntry);
    this.elements.logEntries.appendChild(logElement);

    if (scroll && this.autoScroll && this.pagination.currentPage === this.pagination.totalPages) {
      this.scrollToBottom();
    }
  }

  /**
   * Creates a log entry DOM element
   * 
   * @method createLogElement
   * @param {Object} logEntry - Log entry data
   * @returns {HTMLElement} Log entry element
   */
  createLogElement(logEntry) {
    const div = document.createElement('div');
    div.className = `log-entry log-${logEntry.level.toLowerCase()}`;
    
    const timestamp = new Date(logEntry.timestamp).toLocaleTimeString();
    const argsText = logEntry.args.length > 0 ? ` | Args: ${JSON.stringify(logEntry.args)}` : '';
    
    div.innerHTML = `
      <span class="log-timestamp">${timestamp}</span>
      <span class="log-level log-level-${logEntry.level.toLowerCase()}">${logEntry.level}</span>
      <span class="log-context">${logEntry.context}</span>
      <span class="log-module">${logEntry.module}</span>
      <span class="log-message">${this.escapeHtml(logEntry.message)}${argsText}</span>
    `;
    
    return div;
  }

  /**
   * Escapes HTML in text
   * 
   * @method escapeHtml
   * @param {string} text - Text to escape
   * @returns {string} Escaped text
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Scrolls to bottom of log display
   * 
   * @method scrollToBottom
   */
  scrollToBottom() {
    const logDisplay = this.elements.logEntries.parentElement;
    logDisplay.scrollTop = logDisplay.scrollHeight;
  }

  /**
   * Updates log statistics
   * 
   * @method updateStats
   */
  updateStats() {
    const stats = this.logCollector.getStats();
    
    this.elements.logCount.textContent = stats.total;
    this.elements.totalLogs.textContent = stats.total;
    this.elements.errorLogs.textContent = stats.byLevel.ERROR || 0;
    this.elements.warnLogs.textContent = stats.byLevel.WARN || 0;
  }

  /**
   * Updates module filter options
   * 
   * @method updateModuleFilter
   */
  updateModuleFilter() {
    const stats = this.logCollector.getStats();
    const currentValue = this.elements.moduleFilter.value;

    // Clear existing options except "All Modules"
    this.elements.moduleFilter.innerHTML = '<option value="">All Modules</option>';

    // Add module options
    Object.keys(stats.byModule).forEach(module => {
      const option = document.createElement('option');
      option.value = module;
      option.textContent = `${module} (${stats.byModule[module]})`;
      this.elements.moduleFilter.appendChild(option);
    });

    // Restore previous selection
    this.elements.moduleFilter.value = currentValue;
  }

  // Pagination Methods
  goToPage(page) {
    if (page < 1 || page > this.pagination.totalPages) {
      return;
    }

    this.pagination.currentPage = page;
    this.refreshLogs();
  }

  updatePagination() {
    // Update pagination info
    this.elements.paginationInfo.textContent =
      `Page ${this.pagination.currentPage} of ${this.pagination.totalPages}`;

    // Update button states
    this.elements.firstPageBtn.disabled = this.pagination.currentPage === 1;
    this.elements.prevPageBtn.disabled = this.pagination.currentPage === 1;
    this.elements.nextPageBtn.disabled = this.pagination.currentPage === this.pagination.totalPages;
    this.elements.lastPageBtn.disabled = this.pagination.currentPage === this.pagination.totalPages;
  }

  // Drag Functionality
  setupDragFunctionality() {
    const header = this.elements.panel.querySelector('.log-panel-header');

    header.addEventListener('mousedown', (e) => {
      this.isDragging = true;
      const rect = this.elements.panel.getBoundingClientRect();
      this.dragOffset.x = e.clientX - rect.left;
      this.dragOffset.y = e.clientY - rect.top;

      document.addEventListener('mousemove', this.handleDrag.bind(this));
      document.addEventListener('mouseup', this.handleDragEnd.bind(this));

      e.preventDefault();
    });
  }

  handleDrag(e) {
    if (!this.isDragging) return;

    const x = e.clientX - this.dragOffset.x;
    const y = e.clientY - this.dragOffset.y;

    // Keep panel within viewport
    const maxX = window.innerWidth - this.elements.panel.offsetWidth;
    const maxY = window.innerHeight - this.elements.panel.offsetHeight;

    const constrainedX = Math.max(0, Math.min(x, maxX));
    const constrainedY = Math.max(0, Math.min(y, maxY));

    this.elements.panel.style.left = constrainedX + 'px';
    this.elements.panel.style.top = constrainedY + 'px';
    this.elements.panel.style.right = 'auto';
    this.elements.panel.style.bottom = 'auto';
  }

  handleDragEnd() {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.handleDrag.bind(this));
    document.removeEventListener('mouseup', this.handleDragEnd.bind(this));
  }
}

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { LogPanel };
} else if (typeof window !== 'undefined') {
  window.LogPanel = LogPanel;
}
