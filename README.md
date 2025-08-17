# PromptBoost - AI Text Optimizer Browser Extension

PromptBoost is a powerful browser extension that enhances your text with AI by simply pressing the spacebar three times. It supports multiple LLM providers including OpenAI, Anthropic Claude, and custom APIs.

## 🚀 Quick Start

1. **[Install PromptBoost](docs/guides/installation.md)** - Get up and running in minutes
2. **[Configure your API key](docs/guides/quick-start.md)** - Set up your preferred AI provider
3. **[Start optimizing text](docs/guides/user-manual.md)** - Select text and press spacebar 3 times

## 📚 Documentation

### 🎯 For Users
- **[Quick Start Guide](docs/guides/quick-start.md)** - Get started in 5 minutes
- **[User Manual](docs/guides/user-manual.md)** - Complete usage guide
- **[Installation Guide](docs/guides/installation.md)** - Step-by-step installation
- **[Configuration Guide](docs/guides/configuration.md)** - Advanced settings and customization
- **[Template Management](docs/guides/templates.md)** - Create and manage custom templates
- **[Troubleshooting](docs/guides/troubleshooting.md)** - Common issues and solutions

### 🔧 For Developers
- **[Development Setup](docs/development/setup.md)** - Development environment setup
- **[API Reference](docs/api/)** - Complete API documentation
- **[Architecture Overview](docs/architecture/overview.md)** - System architecture and design
- **[Contributing Guidelines](docs/development/contributing.md)** - How to contribute
- **[Testing Guide](docs/development/testing.md)** - Testing documentation

### 💡 Examples & References
- **[Usage Examples](docs/examples/basic-usage.md)** - Practical usage examples
- **[Template Examples](docs/examples/templates.md)** - Custom template creation
- **[Provider Integration](docs/examples/providers.md)** - AI provider setup
- **[Configuration Reference](docs/reference/configuration.md)** - Complete settings reference
- **[Template Schema](docs/reference/templates.md)** - Template structure reference

## ✨ Key Features

### Core Functionality
- **Triple Spacebar Activation**: Press spacebar 3 times quickly to optimize selected text
- **Multiple LLM Providers**: Support for OpenAI GPT, Anthropic Claude, Google Gemini, Cohere, Hugging Face, OpenRouter, and local models
- **Universal Compatibility**: Works on all websites and text input fields
- **Smart Text Handling**: Supports both plain text and rich text selections
- **Undo Functionality**: Easy undo with Ctrl+Z or click button

### Template System
- **Multiple Prompt Templates**: Built-in templates for different use cases
- **Custom Templates**: Create, edit, and organize your own templates
- **Template Categories**: Organize templates by purpose and context
- **Template Versioning**: Full version control with history and rollback
- **Template Testing**: Automated testing framework for quality assurance
- **Quick Template Selection**: Choose templates during optimization

### Advanced Features
- **Per-Page Configuration**: Different settings for different websites
- **History Tracking**: View, search, and export optimization history
- **Usage Analytics**: See your most used templates and performance metrics
- **Backup & Restore**: Export/import settings and templates
- **Debug Logging**: Optional logging for troubleshooting

## 🛠 Installation

### Quick Installation

1. **Download** the extension from GitHub or Chrome Web Store
2. **Open Chrome** and navigate to `chrome://extensions/`
3. **Enable "Developer mode"** in the top right
4. **Click "Load unpacked"** and select the extension directory
5. **The extension icon** should appear in your browser toolbar

For detailed installation instructions, see the **[Installation Guide](docs/guides/installation.md)**.

### Browser Compatibility

- ✅ **Chrome** (Manifest V3) - Full support
- ✅ **Microsoft Edge** (Manifest V3) - Full support
- ⚠️ **Firefox** - Requires minor manifest modifications

## 🎯 Basic Usage

1. **Select text** on any webpage or in any text field
2. **Press spacebar 3 times quickly** (within 1 second)
3. **Wait for AI optimization** - you'll see a loading indicator
4. **Text is automatically replaced** with the optimized version

### Alternative Activation Methods

- **Keyboard shortcut**: `Ctrl+Shift+Space` for quick optimization
- **Template selector**: `Ctrl+Shift+T` to choose specific templates
- **Right-click menu**: Right-click selected text for context menu
- **Undo**: `Ctrl+Z` to undo last optimization (within 30 seconds)

### Example Transformations

**Email Enhancement**:
- *Before*: "hey can u send me the report asap thx"
- *After*: "Hello, could you please send me the report as soon as possible? Thank you."

**Professional Tone**:
- *Before*: "the meeting went ok we talked about stuff"
- *After*: "The meeting proceeded successfully and we discussed key agenda items."

**Grammar Check**:
- *Before*: "there going to the store tommorow"
- *After*: "They're going to the store tomorrow."

## ⚙️ Configuration

### Quick Setup

1. **Click the extension icon** in your browser toolbar
2. **Click "Settings"** to open configuration
3. **Choose your AI provider** (OpenAI, Anthropic, Google Gemini, etc.)
4. **Enter your API key** and test the connection
5. **Save settings** and start optimizing!

### Supported AI Providers

- **OpenAI** - GPT-3.5 Turbo, GPT-4, GPT-4 Turbo
- **Anthropic** - Claude 3 Opus, Sonnet, Haiku
- **Google Gemini** - Gemini Pro (free tier available)
- **Cohere** - Command models
- **Hugging Face** - Various open source models
- **OpenRouter** - Unified access to multiple providers
- **Local Models** - Ollama, LM Studio, and other local setups
- **Custom APIs** - Any OpenAI-compatible endpoint

For detailed configuration options, see the **[Configuration Guide](docs/guides/configuration.md)**.

## 🔧 Template System

PromptBoost includes powerful template management for different optimization needs:

### Built-in Templates

- **General Improvement** - Enhance text while maintaining tone and meaning
- **Professional Tone** - Make text more formal and business-appropriate
- **Casual Tone** - Make text more conversational and friendly
- **Grammar Check** - Fix grammar and spelling errors only
- **Email Enhancement** - Optimize for professional email communication
- **Social Media** - Optimize for social media posts with engagement
- **Academic Tone** - Enhance text for academic writing

### Custom Templates

Create your own templates for specific needs:

1. **Open Settings** → Templates tab
2. **Click "Create Template"**
3. **Define your template** with `{text}` placeholder
4. **Test and save** your custom template

**Example Custom Template**:
```
Name: Meeting Notes
Template: Please convert these rough meeting notes into structured, professional meeting minutes: {text}
```

For detailed template management, see the **[Template Management Guide](docs/guides/templates.md)**.

## 🛡️ Privacy & Security

- **Local Storage**: API keys stored securely in your browser only
- **No Data Collection**: Extension doesn't collect or store your data
- **Direct API Calls**: Text sent only to your chosen AI provider
- **Open Source**: Full transparency with open source code
- **Minimal Permissions**: Only requests necessary browser permissions

## 🆘 Troubleshooting

### Quick Fixes

- **Not working?** Check if extension is enabled in popup
- **Triple spacebar not detected?** Adjust timing in settings or use `Ctrl+Shift+Space`
- **API errors?** Verify API key and check internet connection
- **Text not replacing?** Some sites prevent modification - try different site

For comprehensive troubleshooting, see the **[Troubleshooting Guide](docs/guides/troubleshooting.md)**.

## 🤝 Contributing

We welcome contributions! Here's how to get started:

1. **Read** the [Contributing Guidelines](docs/development/contributing.md)
2. **Set up** your [Development Environment](docs/development/setup.md)
3. **Check** the [Architecture Overview](docs/architecture/overview.md)
4. **Submit** your pull request

### Development Quick Start

```bash
# Clone the repository
git clone https://github.com/your-repo/promptboost.git
cd promptboost

# Install dependencies
npm install

# Run tests
npm test

# Load extension in Chrome for testing
# Go to chrome://extensions/ → Load unpacked → Select project folder
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Thanks to all AI providers for their excellent APIs
- Community contributors and testers
- Open source libraries and tools used in this project

## 📞 Support

- **Documentation**: [Complete Documentation](docs/)
- **Issues**: [GitHub Issues](https://github.com/your-repo/promptboost/issues)
- **Discussions**: [GitHub Discussions](https://github.com/your-repo/promptboost/discussions)
- **Email**: support@promptboost.dev

---

**Made with ❤️ for better writing everywhere**
