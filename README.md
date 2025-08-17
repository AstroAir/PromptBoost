# PromptBoost - AI Text Optimizer Browser Extension

PromptBoost is a powerful browser extension that enhances your text with AI by simply pressing the spacebar three times. It supports multiple LLM providers including OpenAI, Anthropic Claude, and custom APIs.

## Features

### Core Functionality
- **Triple Spacebar Activation**: Press spacebar 3 times quickly to optimize selected text
- **Multiple LLM Providers**: Support for OpenAI GPT, Anthropic Claude, and custom APIs
- **Universal Compatibility**: Works on all websites and text input fields
- **Smart Text Handling**: Supports both plain text and rich text selections
- **Undo Functionality**: Easy undo with Ctrl+Z or click button

### Template System
- **Multiple Prompt Templates**: 8 built-in templates for different use cases
- **Custom Templates**: Create, edit, and organize your own templates
- **Template Categories**: Organize templates by Business, Creative, Technical, etc.
- **Quick Template Selection**: Choose templates during optimization
- **Template Management**: Import/export templates, full CRUD operations

### User Experience
- **Context Menu Integration**: Right-click on selected text for quick access
- **Keyboard Shortcuts**: Multiple shortcuts for different actions
- **Visual Feedback**: Loading indicators, notifications, and status updates
- **Optimization History**: Track and review all your optimizations
- **Advanced Settings**: Customize timeouts, retry attempts, and more

### Management Features
- **History Tracking**: View, search, and export optimization history
- **Usage Statistics**: See your most used templates and activity
- **Backup & Restore**: Export/import settings and templates
- **Debug Logging**: Optional logging for troubleshooting

## Installation

### From Source (Development)

1. Clone or download this repository
2. Open Chrome/Edge and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right
4. Click "Load unpacked" and select the extension directory
5. The extension icon should appear in your browser toolbar

### Browser Compatibility

- ✅ Chrome (Manifest V3)
- ✅ Microsoft Edge (Manifest V3)
- ⚠️ Firefox (requires minor manifest modifications)

## Setup

1. **Install the extension** following the instructions above
2. **Click the extension icon** in your browser toolbar
3. **Click "Settings"** to open the configuration page
4. **Choose your LLM provider**:
   - **OpenAI**: Enter your OpenAI API key
   - **Anthropic**: Enter your Anthropic API key
   - **Custom**: Configure your custom API endpoint

### Getting API Keys

#### OpenAI
1. Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Create a new API key
3. Copy and paste it into PromptBoost settings

#### Anthropic
1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Generate an API key
3. Copy and paste it into PromptBoost settings

## Usage

### Basic Usage

1. **Select text** on any webpage or in any text field
2. **Choose your activation method**:
   - **Triple spacebar**: Press spacebar 3 times quickly (within 1 second by default)
   - **Keyboard shortcut**: Ctrl+Shift+Space
   - **Right-click menu**: Right-click on selected text for context menu
3. **Choose optimization method**:
   - **Quick optimize**: Use default template
   - **Template selection**: Choose from available templates
4. **Wait for optimization** - you'll see a loading indicator
5. **Text is automatically replaced** with the AI-optimized version

### Keyboard Shortcuts

- **Ctrl+Shift+Space**: Quick optimization with default template
- **Ctrl+Shift+T**: Open template selector
- **Ctrl+Z**: Undo last optimization (within 30 seconds)
- **Escape**: Close template selector or context menu

### Template System

#### Built-in Templates
- **General Improvement**: Enhance text while maintaining tone
- **Professional Tone**: Make text more formal and business-appropriate
- **Casual & Friendly**: Make text more conversational
- **Make Concise**: Shorten text while keeping key information
- **Expand & Detail**: Add more detail and explanation
- **Creative Writing**: Enhance creativity and engagement
- **Technical Documentation**: Improve technical clarity
- **Grammar & Style**: Fix grammar, spelling, and style issues

#### Using Templates
1. **Quick selection**: Enable in settings for automatic template chooser
2. **Context menu**: Right-click selected text to see template options
3. **Keyboard shortcut**: Ctrl+Shift+T to open template selector
4. **Default template**: Set a default template in settings

### Supported Elements

- Text areas (`<textarea>`)
- Input fields (`<input type="text">`)
- Content-editable divs
- Regular text selections on web pages

## Configuration

### General Settings

- **Enable/Disable**: Toggle the extension on/off
- **Detection Window**: Time window for triple spacebar detection (500-3000ms)
- **Keyboard Shortcut**: Alternative activation method

### LLM Provider Settings

- **Provider**: Choose between OpenAI, Anthropic, or Custom
- **API Key**: Your provider's API key (stored securely)
- **Model**: Specific model to use (e.g., gpt-3.5-turbo, claude-3-sonnet)
- **API Endpoint**: Custom endpoint URL (for custom providers)

### Prompt Template

Customize the prompt sent to the AI. Use `{text}` as a placeholder for the selected text.

**Default prompt**:
```
Please improve and optimize the following text while maintaining its original meaning and tone:

{text}
```

## Troubleshooting

### Common Issues

**Extension not working**
- Check if the extension is enabled in the popup
- Verify your API key is configured correctly
- Test the API connection in settings

**Triple spacebar not detected**
- Adjust the detection window in settings
- Try the keyboard shortcut (Ctrl+Shift+Space) instead
- Ensure text is selected before triggering

**API errors**
- Verify your API key is valid and has sufficient credits
- Check your internet connection
- Try testing the API in the settings page

**Text not replacing**
- Some websites may prevent text modification due to security policies
- Try on a different website or text field
- Check browser console for error messages

### Error Messages

- **"API key not configured"**: Add your API key in settings
- **"Please select some text first"**: Select text before triggering
- **"Text too long"**: Selected text exceeds 10,000 character limit
- **"Optimization failed"**: API request failed, check connection and key

## Privacy & Security

- **API keys are stored locally** in your browser's secure storage
- **Text is sent only to your configured LLM provider**
- **No data is collected or stored** by the extension
- **All processing happens client-side** except for the API calls

## Development

### Project Structure

```
PromptBoost/
├── manifest.json          # Extension manifest
├── background.js          # Background service worker
├── content.js            # Content script for web pages
├── content.css           # Styles for UI elements
├── options/              # Settings page
│   ├── options.html
│   ├── options.js
│   └── options.css
├── popup/               # Extension popup
│   ├── popup.html
│   ├── popup.js
│   └── popup.css
├── icons/               # Extension icons
└── README.md           # This file
```

### Building

No build process required - this is a vanilla JavaScript extension.

### Testing

PromptBoost includes a comprehensive testing suite to ensure reliability and quality:

#### Running Tests

```bash
# Install dependencies
npm install

# Run all tests
npm test

# Run tests with coverage report
npm run test:coverage

# Run tests in watch mode (for development)
npm run test:watch

# Run only unit tests (fast)
npm run test:unit

# Run only integration tests (requires browser)
npm run test:integration
```

#### Test Types

- **Unit Tests**: Test individual components in isolation with comprehensive mocking
- **Integration Tests**: End-to-end testing using Puppeteer for real browser automation
- **Manual Tests**: Use the included `test.html` for manual verification

#### Test Coverage

The project maintains high test coverage standards:
- Minimum 80% coverage for branches, functions, lines, and statements
- Comprehensive Chrome extension API mocking
- Real browser testing for integration scenarios

For detailed testing information, see [TESTING.md](TESTING.md).

### Contributing

We welcome contributions! Please see our [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

**Quick Start:**
1. Fork the repository
2. Create a feature branch
3. Make your changes with tests
4. Run the test suite
5. Submit a pull request

**Development Resources:**
- [CONTRIBUTING.md](CONTRIBUTING.md) - Contribution guidelines
- [DEVELOPMENT.md](DEVELOPMENT.md) - Development setup and architecture
- [TESTING.md](TESTING.md) - Testing guide and best practices

## License

MIT License - see LICENSE file for details.

## Support

- **Issues**: [GitHub Issues](https://github.com/your-repo/promptboost/issues)
- **Documentation**: This README
- **Feature Requests**: [GitHub Discussions](https://github.com/your-repo/promptboost/discussions)

## Changelog

For detailed version history and release notes, see [CHANGELOG.md](CHANGELOG.md).

### Latest Release (v1.0.0)
- Initial release with comprehensive testing suite
- Triple spacebar detection for text optimization
- Multi-provider LLM support (OpenAI, Anthropic, Custom APIs)
- Advanced template system with 8 built-in templates
- Undo functionality and optimization history
- Comprehensive settings page with import/export
- Visual feedback and notifications
- Full unit and integration test coverage
