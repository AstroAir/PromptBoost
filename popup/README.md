# PromptBoost Popup Component

This directory contains the popup interface for the PromptBoost browser extension. The popup provides quick access to extension controls and status information.

## Files

### `popup.html`
The main HTML structure for the extension popup, including:
- Extension toggle switch
- Status indicators
- Provider information display
- Quick action buttons (Settings, Test API, Help)
- Responsive layout optimized for popup dimensions

### `popup.js`
JavaScript functionality for the popup interface:
- **PromptBoostPopup Class**: Main popup controller
- Extension state management (enable/disable)
- Settings synchronization with storage
- API connection testing
- Status updates and notifications
- Navigation to options page and help resources

### `popup.css`
Styling for the popup interface:
- Modern, clean design with consistent branding
- Responsive layout for various popup sizes
- Status indicators with color coding
- Button styles and hover effects
- Typography and spacing optimized for readability

## Key Features

### Extension Control
- **Toggle Switch**: Enable/disable the extension with visual feedback
- **Status Display**: Shows current extension state and API configuration
- **Provider Info**: Displays current LLM provider and model information

### Quick Actions
- **Settings Button**: Opens the full options page for detailed configuration
- **Test API Button**: Validates API connection with current settings
- **Help Link**: Opens documentation and usage guide
- **Feedback Link**: Opens issue tracker for bug reports and feature requests

### Status Indicators
- **Active**: Extension is enabled with valid API configuration
- **Inactive**: Extension is disabled or missing API key
- **Testing**: API connection test in progress
- **Error**: Configuration or connection issues

## Usage

The popup is automatically displayed when users click the extension icon in the browser toolbar. It provides:

1. **Quick Status Check**: Immediate visibility of extension state
2. **Fast Toggle**: One-click enable/disable functionality
3. **Settings Access**: Direct link to detailed configuration
4. **Connection Testing**: Verify API setup without leaving popup
5. **Help Resources**: Easy access to documentation and support

## Technical Details

### Message Passing
The popup communicates with other extension components through Chrome's message passing API:
- Sends toggle commands to all active tabs
- Receives API test results from background script
- Synchronizes settings changes across components

### Storage Integration
- Reads current settings from `chrome.storage.sync`
- Updates extension state in real-time
- Persists user preferences automatically

### Error Handling
- Graceful handling of storage failures
- API connection error display
- Fallback states for missing configuration

## Development

### Testing
Unit tests for popup functionality are located in `../tests/unit/popup.test.js`:
- UI interaction testing
- Settings management validation
- Message passing verification
- Error handling scenarios

### Styling Guidelines
- Follow existing color scheme and typography
- Maintain responsive design principles
- Ensure accessibility compliance
- Test across different browser themes

### Adding Features
When adding new popup features:
1. Update HTML structure in `popup.html`
2. Add corresponding JavaScript in `popup.js`
3. Style new elements in `popup.css`
4. Write unit tests for new functionality
5. Update this README with feature documentation

## Browser Compatibility

The popup is designed to work across all Chromium-based browsers:
- ✅ Chrome (primary target)
- ✅ Microsoft Edge
- ✅ Brave Browser
- ✅ Opera
- ⚠️ Firefox (requires manifest modifications)

## Accessibility

The popup interface includes accessibility features:
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus indicators for interactive elements
- Semantic HTML structure

For more information about the PromptBoost extension, see the main [README.md](../README.md).
