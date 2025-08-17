# PromptBoost Options Page

This directory contains the comprehensive settings and configuration interface for the PromptBoost browser extension. The options page provides detailed control over all extension features and preferences.

## Files

### `options.html`

The main HTML structure for the options page, featuring:

- Tabbed interface for organized settings
- Form controls for all configuration options
- Template management interface
- Import/export functionality
- Advanced settings section
- Responsive design for various screen sizes

### `options.js`

JavaScript functionality for the options interface:

- **PromptBoostOptions Class**: Main options controller
- Settings persistence and validation
- Template CRUD operations (Create, Read, Update, Delete)
- API provider configuration
- Import/export functionality
- Real-time settings synchronization

### `options.css`

Comprehensive styling for the options interface:

- Professional, modern design
- Tabbed navigation with smooth transitions
- Form styling with validation states
- Template management interface
- Responsive layout for desktop and mobile
- Dark/light theme support

## Key Features

### General Settings

- **Extension Toggle**: Master enable/disable switch
- **Detection Window**: Configurable time window for triple spacebar detection
- **Keyboard Shortcuts**: Customizable hotkey combinations
- **Quick Template Selection**: Enable/disable template chooser

### LLM Provider Configuration

- **Provider Selection**: Choose between OpenAI, Anthropic, OpenRouter, or Custom API
- **API Key Management**: Secure storage of API credentials
- **Model Selection**: Provider-specific model options
- **Endpoint Configuration**: Custom API endpoint URLs
- **Connection Testing**: Validate API setup with test requests

### Template Management

- **Built-in Templates**: Pre-configured templates for common use cases
- **Custom Templates**: Create and edit personalized prompt templates
- **Template Categories**: Organize templates by purpose (Business, Creative, Technical, etc.)
- **Template Import/Export**: Share templates between installations
- **Template Preview**: Test templates before saving

### Advanced Settings

- **Request Timeout**: Configure API request timeout duration
- **Retry Attempts**: Set maximum retry attempts for failed requests
- **Logging**: Enable debug logging for troubleshooting
- **History Management**: Configure optimization history retention
- **Notification Settings**: Customize user feedback preferences

## Template System

### Template Structure

Each template includes:

- **Name**: Human-readable template identifier
- **Description**: Brief explanation of template purpose
- **Category**: Organizational grouping
- **Prompt**: The actual prompt text with `{text}` placeholder
- **Metadata**: Creation date, usage statistics, custom flags

### Built-in Templates

- **General Improvement**: Enhance text while maintaining tone
- **Professional Tone**: Make text more formal and business-appropriate
- **Casual & Friendly**: Make text more conversational
- **Make Concise**: Shorten text while keeping key information
- **Expand & Detail**: Add more detail and explanation
- **Creative Writing**: Enhance creativity and engagement
- **Technical Documentation**: Improve technical clarity
- **Grammar & Style**: Fix grammar, spelling, and style issues

### Custom Templates

Users can create unlimited custom templates with:

- Personalized prompts for specific use cases
- Custom categories and organization
- Import/export for sharing and backup
- Usage tracking and statistics

## Usage Workflows

### Initial Setup

1. Open options page from extension popup or browser settings
2. Select preferred LLM provider
3. Enter API key and configure settings
4. Test API connection
5. Customize templates and preferences

### Template Management

1. Navigate to Templates tab
2. Browse existing templates or create new ones
3. Edit template properties and prompt text
4. Test templates with sample text
5. Organize templates into categories

### Settings Backup

1. Use Export Settings to create backup file
2. Store backup file securely
3. Use Import Settings to restore configuration
4. Verify settings after import

## Technical Details

### Settings Storage

- Uses `chrome.storage.sync` for cross-device synchronization
- Automatic backup to Chrome account
- Real-time synchronization across browser instances
- Fallback to local storage if sync unavailable

### Form Validation

- Real-time input validation
- API key format verification
- Template syntax checking
- Required field enforcement
- Error message display

### Security Considerations

- API keys stored securely in Chrome's encrypted storage
- No plaintext credential transmission
- Secure HTTPS-only API communications
- Input sanitization for all user data

## Development

### Testing

Unit tests for options functionality are located in `../tests/unit/options.test.js`:

- Settings management testing
- Template CRUD operation validation
- Import/export functionality testing
- Form validation and error handling

### Adding New Settings

When adding new configuration options:

1. Update HTML form in `options.html`
2. Add setting handling in `options.js`
3. Include in default settings object
4. Add validation logic
5. Update storage schema
6. Write corresponding tests
7. Document new setting in this README

### Styling Guidelines

- Maintain consistent design language
- Follow accessibility best practices
- Ensure responsive behavior
- Test across different browsers and themes
- Use semantic HTML structure

## Browser Compatibility

The options page works across all supported browsers:

- ✅ Chrome (full feature support)
- ✅ Microsoft Edge (full feature support)
- ✅ Brave Browser (full feature support)
- ✅ Opera (full feature support)
- ⚠️ Firefox (requires manifest modifications)

## Accessibility Features

The options interface includes comprehensive accessibility support:

- Full keyboard navigation
- Screen reader compatibility
- ARIA labels and descriptions
- High contrast mode support
- Focus management and indicators
- Semantic HTML structure
- Alternative text for images and icons

## Troubleshooting

### Common Issues

- **Settings not saving**: Check browser storage permissions
- **API test failures**: Verify API key and network connectivity
- **Template import errors**: Ensure valid JSON format
- **Sync issues**: Check Chrome account sync settings

### Debug Mode

Enable debug logging in Advanced Settings to:

- Monitor API requests and responses
- Track settings changes
- Identify synchronization issues
- Troubleshoot template problems

For more information about the PromptBoost extension, see the main [README.md](../README.md).
