# Content Script API

The content script (`content.js`) handles user interactions and text manipulation on web pages. It provides the main user interface for the PromptBoost extension.

## PromptBoostContent Class

### Constructor

```javascript
new PromptBoostContent()
```

Creates a new instance of the content script. Automatically initializes:
- Event listeners for keyboard and mouse interactions
- Message listeners for background script communication
- Settings and history loading
- UI component setup

### Properties

#### Core State
- `spacebarPresses` (Array<number>): Timestamps of recent spacebar presses
- `isEnabled` (boolean): Whether the extension is currently enabled
- `isProcessing` (boolean): Whether an optimization is currently in progress
- `lastSelection` (Object): Information about the last text selection
- `undoStack` (Array<Object>): Stack of recent changes for undo functionality
- `optimizationHistory` (Array<Object>): History of all optimizations
- `settings` (Object): Current extension settings
- `templates` (Object): Available prompt templates

### Public Methods

#### init()

Initializes the content script asynchronously.

**Returns:** Promise<void>

**Example:**
```javascript
const content = new PromptBoostContent();
// init() is called automatically
```

#### triggerOptimization(templateId)

Triggers text optimization for the currently selected text.

**Parameters:**
- `templateId` (string, optional): ID of the template to use

**Example:**
```javascript
// Quick optimization with default template
content.triggerOptimization();

// Optimization with specific template
content.triggerOptimization('professional-tone');
```

#### getSelectedText()

Gets the currently selected text from the page.

**Returns:** string - The selected text, or empty string if no selection

**Example:**
```javascript
const selectedText = content.getSelectedText();
if (selectedText) {
  console.log('Selected:', selectedText);
}
```

#### replaceSelectedText(newText)

Replaces the currently selected text with new text.

**Parameters:**
- `newText` (string): The text to replace the selection with

**Example:**
```javascript
content.replaceSelectedText('This is the new text');
```

#### undoLastChange()

Undoes the last text replacement made by PromptBoost.

**Example:**
```javascript
content.undoLastChange();
```

#### showNotification(message, type)

Shows a notification to the user.

**Parameters:**
- `message` (string): The notification message
- `type` (string): Notification type ('info', 'success', 'error', 'warning')

**Example:**
```javascript
content.showNotification('Text optimized successfully!', 'success');
content.showNotification('Error occurred', 'error');
```

### Event Handlers

#### handleKeyDown(event)

Handles keyboard events, specifically spacebar detection.

**Parameters:**
- `event` (KeyboardEvent): The keyboard event

**Triggered by:** Spacebar presses for triple-spacebar detection

#### handleKeyboardShortcut(event)

Handles keyboard shortcuts for various actions.

**Parameters:**
- `event` (KeyboardEvent): The keyboard event

**Shortcuts:**
- `Ctrl+Shift+Space`: Quick optimization
- `Ctrl+Shift+T`: Open template selector
- `Ctrl+Z`: Undo last change (within 30 seconds)
- `Escape`: Close template selector or context menu

#### handleSelectionChange()

Handles text selection changes on the page.

**Triggered by:** User selecting text with mouse or keyboard

#### handleContextMenu(event)

Handles right-click context menu events.

**Parameters:**
- `event` (MouseEvent): The context menu event

**Shows:** PromptBoost context menu with optimization options

### Message Handling

The content script listens for messages from the background script:

#### SETTINGS_UPDATED

Reloads settings when they are updated.

**Message Format:**
```javascript
{
  type: 'SETTINGS_UPDATED'
}
```

#### TOGGLE_EXTENSION

Enables or disables the extension.

**Message Format:**
```javascript
{
  type: 'TOGGLE_EXTENSION',
  enabled: boolean
}
```

#### OPTIMIZE_RESULT

Handles successful optimization results.

**Message Format:**
```javascript
{
  type: 'OPTIMIZE_RESULT',
  data: {
    optimizedText: string,
    templateUsed?: string
  }
}
```

#### OPTIMIZATION_ERROR

Handles optimization errors.

**Message Format:**
```javascript
{
  type: 'OPTIMIZATION_ERROR',
  error: string
}
```

### UI Components

#### Loading Overlay

Shows a loading spinner during optimization.

**Methods:**
- `showLoadingOverlay()`: Display loading overlay
- `hideLoadingOverlay()`: Hide loading overlay

**HTML Structure:**
```html
<div class="promptboost-loading-overlay">
  <div class="promptboost-loading-content">
    <div class="promptboost-spinner"></div>
    <p class="promptboost-loading-text">Optimizing text with AI...</p>
  </div>
</div>
```

#### Context Menu

Right-click menu with optimization options.

**Methods:**
- `showContextMenu(event)`: Show context menu at cursor position
- `hideContextMenu()`: Hide context menu

**Features:**
- Quick optimize option
- Template selection
- Recent templates
- Settings link

#### Template Selector

Modal for selecting optimization templates.

**Methods:**
- `showTemplateSelector(selectedText)`: Show template selector
- `hideTemplateSelector()`: Hide template selector

#### Notifications

Toast notifications for user feedback.

**Types:**
- `info`: General information
- `success`: Successful operations
- `error`: Error messages
- `warning`: Warning messages

#### Undo Notification

Special notification with undo button.

**Methods:**
- `showUndoNotification()`: Show undo notification with button

### History Management

#### addToHistory(entry)

Adds an optimization to the history.

**Parameters:**
- `entry` (Object): History entry object
  - `originalText` (string): Original text
  - `optimizedText` (string): Optimized text
  - `templateUsed` (string): Template name used
  - `timestamp` (number): Timestamp of optimization
  - `url` (string): Page URL
  - `domain` (string): Page domain

#### loadHistoryFromStorage()

Loads optimization history from Chrome storage.

**Returns:** Promise<void>

#### saveHistoryToStorage()

Saves optimization history to Chrome storage.

**Returns:** Promise<void>

### Text Selection Utilities

#### getActiveElement()

Gets the currently active/focused element.

**Returns:** Element - The active element

#### isEditableElement(element)

Checks if an element is editable (input, textarea, contenteditable).

**Parameters:**
- `element` (Element): Element to check

**Returns:** boolean

#### getSelectionInfo()

Gets detailed information about the current selection.

**Returns:** Object with selection details:
- `text` (string): Selected text
- `range` (Range): Selection range
- `element` (Element): Container element

### Spacebar Detection

#### recordSpacebarPress()

Records a spacebar press timestamp and checks for triple-press pattern.

**Logic:**
1. Records current timestamp
2. Filters out old presses outside time window
3. Triggers optimization if 3 presses detected
4. Resets press array after triggering

**Configuration:**
- Time window configurable in settings (default: 1000ms)
- Requires exactly 3 presses within window

### Cross-Site Compatibility

#### Element Support
- `<textarea>` elements
- `<input type="text">` elements
- `contenteditable` elements
- Regular text selections

#### Security Considerations
- Respects Content Security Policy
- Handles sites that prevent text modification
- Graceful degradation on restricted sites

### Error Handling

#### Common Scenarios
- No text selected
- Text too long (>10,000 characters)
- API errors
- Network failures
- Permission denied

#### Error Display
- User-friendly error messages
- Automatic error recovery
- Fallback options

### Performance Optimization

#### Debouncing
- Selection change events are debounced
- Prevents excessive processing

#### Memory Management
- Automatic cleanup of old history entries
- Efficient DOM manipulation
- Event listener cleanup

### Usage Examples

#### Basic Text Optimization

```javascript
// User selects text and presses spacebar 3 times
// Content script automatically:
// 1. Detects triple spacebar
// 2. Gets selected text
// 3. Sends to background script
// 4. Shows loading overlay
// 5. Replaces text with result
```

#### Keyboard Shortcut Usage

```javascript
// User presses Ctrl+Shift+Space
document.addEventListener('keydown', (event) => {
  if (event.ctrlKey && event.shiftKey && event.code === 'Space') {
    content.triggerOptimization();
  }
});
```

#### Context Menu Integration

```javascript
// User right-clicks on selected text
document.addEventListener('contextmenu', (event) => {
  if (content.getSelectedText()) {
    content.showContextMenu(event);
  }
});
```

#### Template Selection

```javascript
// User opens template selector
content.showTemplateSelector(selectedText);

// User selects template
content.triggerOptimization('professional-tone');
```

### CSS Classes

The content script injects CSS classes for styling:

- `.promptboost-loading-overlay`: Loading overlay
- `.promptboost-notification`: Notification messages
- `.promptboost-context-menu`: Right-click context menu
- `.promptboost-template-selector`: Template selection modal
- `.promptboost-undo-notification`: Undo notification

### Global Access

The content script instance is available globally:

```javascript
// Access the content script instance
window.promptBoostInstance.triggerOptimization();
window.promptBoostInstance.showNotification('Hello!', 'info');
```

For more information, see:
- [Background Script API](background.md)
- [User Manual](../guides/user-manual.md)
- [Configuration Guide](../guides/configuration.md)
