# PromptBoost User Manual

Welcome to PromptBoost! This comprehensive guide will help you get the most out of your AI-powered text optimization extension.

## Table of Contents

- [Getting Started](#getting-started)
- [Basic Usage](#basic-usage)
- [Advanced Features](#advanced-features)
- [Template System](#template-system)
- [Settings and Configuration](#settings-and-configuration)
- [Troubleshooting](#troubleshooting)

## Getting Started

### What is PromptBoost?

PromptBoost is a browser extension that enhances your text using AI. Simply select text on any webpage and press the spacebar three times to optimize it instantly.

### Key Features

- **Triple Spacebar Activation**: Quick text optimization with three spacebar presses
- **Multiple AI Providers**: Support for OpenAI, Anthropic, Google Gemini, and more
- **Template System**: Pre-built and custom templates for different use cases
- **Universal Compatibility**: Works on all websites and text input fields
- **Smart Undo**: Easy undo functionality for all changes
- **History Tracking**: Keep track of all your optimizations

### First Time Setup

1. **Install the extension** following the [Installation Guide](installation.md)
2. **Click the extension icon** in your browser toolbar
3. **Click "Settings"** to open the configuration page
4. **Choose your AI provider** and enter your API key
5. **Test the connection** to ensure everything works
6. **You're ready to go!**

## Basic Usage

### Method 1: Triple Spacebar (Recommended)

1. **Select text** on any webpage or in any text field
2. **Press spacebar 3 times quickly** (within 1 second by default)
3. **Wait for the AI** to process your text
4. **Your text is automatically replaced** with the optimized version

**Example:**
- Original: "hey can u help me with this thing"
- Optimized: "Hello, could you please help me with this matter?"

### Method 2: Keyboard Shortcut

1. **Select text** you want to optimize
2. **Press Ctrl+Shift+Space** (or your custom shortcut)
3. **Wait for optimization** to complete

### Method 3: Right-Click Menu

1. **Select text** you want to optimize
2. **Right-click** on the selected text
3. **Choose "PromptBoost"** from the context menu
4. **Select optimization option** or template

### Method 4: Template Selector

1. **Select text** you want to optimize
2. **Press Ctrl+Shift+T** to open template selector
3. **Choose a template** from the list
4. **Click "Optimize"** to apply

## Advanced Features

### Undo Functionality

Made a mistake? No problem!

- **Automatic Undo Button**: Appears after each optimization
- **Keyboard Shortcut**: Press Ctrl+Z within 30 seconds
- **Click Undo**: Click the undo button in the notification

### History Tracking

PromptBoost keeps track of all your optimizations:

- **View History**: Access through the settings page
- **Search History**: Find specific optimizations
- **Export History**: Download your optimization history
- **Clear History**: Remove old entries

### Quick Template Selection

Enable quick template selection in settings to:
- See template options after selecting text
- Choose different templates for different contexts
- Access recently used templates quickly

### Per-Page Settings

Configure different settings for different websites:
- **Gmail**: Use professional tone templates
- **Twitter**: Use casual, concise templates
- **Documents**: Use formal writing templates

## Template System

### Built-in Templates

PromptBoost comes with several pre-built templates:

#### General Templates
- **General Improvement**: Enhance text while maintaining tone
- **Grammar Check**: Fix grammar and spelling errors
- **Summarize**: Create concise summaries

#### Tone Templates
- **Professional Tone**: Make text more formal and business-appropriate
- **Casual Tone**: Make text more conversational and friendly
- **Academic Tone**: Enhance text for academic writing

#### Specialized Templates
- **Email Enhancement**: Optimize text for email communication
- **Social Media**: Optimize for social media posts
- **Technical Writing**: Improve technical documentation

### Using Templates

#### Quick Access
1. **Select text** and press spacebar 3 times
2. **Choose template** from the popup (if enabled)
3. **Text is optimized** with the selected template

#### Template Selector
1. **Select text** and press Ctrl+Shift+T
2. **Browse available templates** by category
3. **Preview template** descriptions
4. **Select and apply** your chosen template

### Custom Templates

Create your own templates for specific needs:

1. **Open Settings** → Templates tab
2. **Click "Create Template"**
3. **Enter template details**:
   - Name: Descriptive name for your template
   - Description: What the template does
   - Category: Organize your templates
   - Template: The prompt with {text} placeholder
4. **Test your template** before saving
5. **Save and use** your custom template

**Example Custom Template:**
```
Name: Meeting Notes
Description: Converts rough notes into structured meeting minutes
Category: Business
Template: Please convert these rough meeting notes into well-structured, professional meeting minutes: {text}
```

## Settings and Configuration

### General Settings

#### Extension Control
- **Enable/Disable**: Toggle the extension on/off
- **Detection Window**: Time window for triple spacebar detection (500-3000ms)
- **Keyboard Shortcuts**: Customize keyboard shortcuts

#### Provider Settings
- **AI Provider**: Choose your preferred AI service
- **API Key**: Enter your provider's API key
- **Model**: Select specific model (GPT-4, Claude-3, etc.)
- **Custom Endpoint**: For custom API configurations

#### Template Settings
- **Default Template**: Choose your default optimization template
- **Quick Selection**: Enable template chooser popup
- **Recent Templates**: Number of recent templates to show

### Advanced Settings

#### Performance
- **Request Timeout**: Maximum time to wait for API response
- **Retry Attempts**: Number of retry attempts for failed requests
- **Max Tokens**: Maximum tokens for AI generation
- **Temperature**: Creativity level for AI responses (0-1)

#### Privacy & Data
- **History Tracking**: Enable/disable optimization history
- **Max History Items**: Maximum number of history entries
- **Auto-clear History**: Automatically clear old history
- **Debug Logging**: Enable detailed logging for troubleshooting

#### Notifications
- **Show Notifications**: Enable/disable success notifications
- **Notification Duration**: How long notifications stay visible
- **Error Notifications**: Show error messages

### Per-Page Configuration

Set different configurations for different websites:

1. **Visit the website** you want to configure
2. **Open PromptBoost settings**
3. **Go to "Per-Page Settings"**
4. **Click "Add Site Configuration"**
5. **Configure settings** for this specific site
6. **Save configuration**

**Use Cases:**
- **Gmail**: Professional templates, formal tone
- **Twitter**: Casual templates, character limits
- **Google Docs**: Academic templates, detailed improvements
- **Slack**: Casual tone, emoji-friendly

## Tips and Best Practices

### Getting Better Results

1. **Select Complete Thoughts**: Select full sentences or paragraphs
2. **Use Appropriate Templates**: Match templates to your context
3. **Review Results**: Always review AI-generated text
4. **Iterate if Needed**: Re-optimize if the first result isn't perfect

### Keyboard Shortcuts

Master these shortcuts for faster workflow:
- **Ctrl+Shift+Space**: Quick optimize
- **Ctrl+Shift+T**: Template selector
- **Ctrl+Z**: Undo (within 30 seconds)
- **Escape**: Close template selector

### Template Selection

Choose the right template for your needs:
- **Email**: Use "Professional Tone" or "Email Enhancement"
- **Social Media**: Use "Casual Tone" or "Social Media"
- **Documents**: Use "Academic Tone" or "General Improvement"
- **Quick Fixes**: Use "Grammar Check" or "General Improvement"

### Optimization Strategies

1. **Start Simple**: Begin with general improvement templates
2. **Be Specific**: Create custom templates for recurring tasks
3. **Test Different Providers**: Try different AI providers for various tasks
4. **Use History**: Learn from your optimization history

## Supported Websites and Applications

PromptBoost works on virtually all websites and applications:

### Fully Supported
- **Email**: Gmail, Outlook, Yahoo Mail
- **Social Media**: Twitter, Facebook, LinkedIn, Instagram
- **Documents**: Google Docs, Microsoft Office Online, Notion
- **Communication**: Slack, Discord, Teams, WhatsApp Web
- **Writing Tools**: Medium, WordPress, Substack
- **Forms**: Any text input field or textarea

### Special Considerations
- **Rich Text Editors**: May require selecting text differently
- **Protected Sites**: Some banking/secure sites may restrict modifications
- **Mobile**: Works on mobile browsers with text selection support

## Troubleshooting

### Common Issues

#### Extension Not Working
- Check if extension is enabled in popup
- Verify API key is configured correctly
- Test API connection in settings

#### Triple Spacebar Not Detected
- Adjust detection window in settings (try 1500ms)
- Ensure text is selected before triggering
- Try keyboard shortcut instead (Ctrl+Shift+Space)

#### Text Not Replacing
- Some websites prevent text modification
- Try on a different website to test
- Check browser console for error messages

#### API Errors
- Verify API key is valid and has credits
- Check internet connection
- Try different AI provider

### Getting Help

If you need additional help:
1. **Check Settings**: Review your configuration
2. **Test on Simple Site**: Try on a basic text field
3. **Check Console**: Look for error messages in browser console
4. **Contact Support**: Use the feedback link in the extension

For detailed troubleshooting, see the [Troubleshooting Guide](troubleshooting.md).

## Next Steps

Now that you know the basics:
1. **Explore Templates**: Try different templates for various use cases
2. **Create Custom Templates**: Build templates for your specific needs
3. **Configure Per-Page Settings**: Optimize settings for your favorite sites
4. **Share Feedback**: Help improve PromptBoost with your suggestions

Happy optimizing! 🚀
