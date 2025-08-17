# PromptBoost Configuration Guide

This guide covers all configuration options and settings available in PromptBoost, helping you customize the extension for your specific needs.

## Table of Contents

- [General Settings](#general-settings)
- [Provider Configuration](#provider-configuration)
- [Template Settings](#template-settings)
- [Advanced Settings](#advanced-settings)
- [Per-Page Configuration](#per-page-configuration)
- [Import/Export Settings](#importexport-settings)

## General Settings

### Extension Control

#### Enable/Disable Extension
- **Location**: Popup → Toggle switch
- **Description**: Quickly enable or disable PromptBoost
- **Default**: Enabled
- **Tip**: Use this to temporarily disable without losing settings

#### Detection Window
- **Location**: Settings → General → Detection Window
- **Description**: Time window for triple spacebar detection
- **Range**: 500ms - 3000ms
- **Default**: 1000ms (1 second)
- **Recommendations**:
  - Fast typers: 800ms
  - Average typers: 1000ms
  - Slow typers: 1500ms

#### Keyboard Shortcuts
- **Location**: Settings → General → Keyboard Shortcuts
- **Default Shortcuts**:
  - Quick Optimize: `Ctrl+Shift+Space`
  - Template Selector: `Ctrl+Shift+T`
  - Undo: `Ctrl+Z` (within 30 seconds)
- **Customization**: Click "Change" to set custom shortcuts
- **Tip**: Choose shortcuts that don't conflict with other extensions

## Provider Configuration

### Supported Providers

#### OpenAI
- **Models**: GPT-3.5 Turbo, GPT-4, GPT-4 Turbo
- **API Key Format**: `sk-...`
- **Endpoint**: `https://api.openai.com/v1/chat/completions`
- **Cost**: Pay-per-use, ~$0.002 per 1K tokens
- **Best For**: General text optimization, creative writing

**Configuration:**
```
Provider: OpenAI
API Key: sk-your-key-here
Model: gpt-3.5-turbo (recommended for speed/cost)
       gpt-4 (recommended for quality)
```

#### Anthropic Claude
- **Models**: Claude 3 Opus, Claude 3 Sonnet, Claude 3 Haiku
- **API Key Format**: `sk-ant-...`
- **Endpoint**: `https://api.anthropic.com/v1/messages`
- **Best For**: Professional writing, analysis, safety-conscious applications

**Configuration:**
```
Provider: Anthropic
API Key: sk-ant-your-key-here
Model: claude-3-sonnet-20240229 (recommended balance)
       claude-3-opus-20240229 (highest quality)
       claude-3-haiku-20240307 (fastest/cheapest)
```

#### Google Gemini
- **Models**: Gemini Pro, Gemini Pro Vision
- **API Key Format**: `AIza...`
- **Endpoint**: `https://generativelanguage.googleapis.com/v1`
- **Best For**: Multimodal tasks, free tier usage

**Configuration:**
```
Provider: Google Gemini
API Key: AIza-your-key-here
Model: gemini-pro
```

#### Custom API
- **Description**: Use any OpenAI-compatible API
- **Examples**: Local models (Ollama, LM Studio), other cloud providers
- **Configuration**: Requires custom endpoint URL

**Configuration:**
```
Provider: Custom
API Key: your-key-here (if required)
Endpoint: http://localhost:11434/v1/chat/completions
Model: llama2:7b (or your model name)
```

### Provider Selection Tips

#### Choose Based on Use Case
- **General Writing**: OpenAI GPT-3.5 Turbo (fast, affordable)
- **Professional Documents**: Anthropic Claude 3 Sonnet (high quality)
- **Creative Writing**: OpenAI GPT-4 (most creative)
- **Budget-Conscious**: Google Gemini (free tier available)
- **Privacy-Focused**: Local models via Custom API

#### Model Recommendations
- **Speed Priority**: GPT-3.5 Turbo, Claude 3 Haiku, Gemini Pro
- **Quality Priority**: GPT-4, Claude 3 Opus
- **Balanced**: Claude 3 Sonnet, GPT-4 Turbo

## Template Settings

### Default Template
- **Location**: Settings → Templates → Default Template
- **Description**: Template used for quick optimization (triple spacebar)
- **Options**: Any available template
- **Recommendation**: "General Improvement" for most users

### Quick Template Selection
- **Location**: Settings → Templates → Quick Template Selection
- **Description**: Show template chooser after text selection
- **Default**: Enabled
- **When Enabled**: Template popup appears after triple spacebar
- **When Disabled**: Uses default template immediately

### Recent Templates
- **Location**: Settings → Templates → Show Recent Templates
- **Description**: Number of recently used templates to display
- **Range**: 0-10
- **Default**: 5
- **Tip**: Set to 0 to hide recent templates section

### Template Categories
Organize templates by category:
- **General**: Basic text improvement
- **Tone**: Tone adjustment templates
- **Business**: Professional communication
- **Creative**: Creative writing assistance
- **Technical**: Technical documentation
- **Custom**: Your custom templates

## Advanced Settings

### Performance Settings

#### Request Timeout
- **Location**: Settings → Advanced → Request Timeout
- **Description**: Maximum time to wait for API response
- **Range**: 10-120 seconds
- **Default**: 30 seconds
- **Recommendation**: 30s for most users, 60s for complex requests

#### Retry Attempts
- **Location**: Settings → Advanced → Retry Attempts
- **Description**: Number of retry attempts for failed requests
- **Range**: 0-5
- **Default**: 3
- **Tip**: Higher values increase reliability but may slow down error handling

#### Max Tokens
- **Location**: Settings → Advanced → Max Tokens
- **Description**: Maximum tokens for AI generation
- **Range**: 100-4000
- **Default**: 1000
- **Guidelines**:
  - Short text: 500 tokens
  - Medium text: 1000 tokens
  - Long text: 2000+ tokens

#### Temperature
- **Location**: Settings → Advanced → Temperature
- **Description**: Creativity level for AI responses
- **Range**: 0.0-1.0
- **Default**: 0.7
- **Guidelines**:
  - Conservative (0.1-0.3): Factual, consistent
  - Balanced (0.4-0.7): Good balance
  - Creative (0.8-1.0): More varied, creative

### Privacy & Data Settings

#### History Tracking
- **Location**: Settings → Privacy → Enable History
- **Description**: Save optimization history
- **Default**: Enabled
- **Storage**: Local browser storage only

#### Max History Items
- **Location**: Settings → Privacy → Max History Items
- **Description**: Maximum number of history entries to keep
- **Range**: 10-1000
- **Default**: 100

#### Auto-Clear History
- **Location**: Settings → Privacy → Auto-Clear History
- **Description**: Automatically clear old history entries
- **Options**: Never, 7 days, 30 days, 90 days
- **Default**: Never

#### Debug Logging
- **Location**: Settings → Advanced → Debug Logging
- **Description**: Enable detailed logging for troubleshooting
- **Default**: Disabled
- **Warning**: May impact performance, only enable when needed

### Notification Settings

#### Show Notifications
- **Location**: Settings → Notifications → Show Notifications
- **Description**: Display success/error notifications
- **Default**: Enabled

#### Notification Duration
- **Location**: Settings → Notifications → Duration
- **Description**: How long notifications stay visible
- **Range**: 1-10 seconds
- **Default**: 4 seconds

#### Error Notifications
- **Location**: Settings → Notifications → Show Errors
- **Description**: Display error messages to user
- **Default**: Enabled
- **Tip**: Disable for cleaner experience if you don't need error details

## Per-Page Configuration

Configure different settings for different websites.

### Setting Up Per-Page Configuration

1. **Visit the target website** (e.g., gmail.com)
2. **Open PromptBoost settings**
3. **Go to "Per-Page Settings" tab**
4. **Click "Add Site Configuration"**
5. **Configure site-specific settings**
6. **Save configuration**

### Common Per-Page Configurations

#### Gmail
```
Domain: gmail.com
Provider: OpenAI
Model: gpt-3.5-turbo
Default Template: Email Enhancement
Temperature: 0.3 (more conservative)
```

#### Twitter/X
```
Domain: twitter.com
Provider: OpenAI
Model: gpt-3.5-turbo
Default Template: Social Media
Max Tokens: 280 (character limit consideration)
Temperature: 0.6 (slightly creative)
```

#### Google Docs
```
Domain: docs.google.com
Provider: Anthropic
Model: claude-3-sonnet
Default Template: Academic Tone
Max Tokens: 2000 (longer documents)
Temperature: 0.4 (balanced)
```

#### Slack
```
Domain: slack.com
Provider: OpenAI
Model: gpt-3.5-turbo
Default Template: Casual Tone
Temperature: 0.7 (conversational)
```

### Per-Page Settings Priority

Settings are applied in this order:
1. **Per-page settings** (highest priority)
2. **Global settings** (fallback)
3. **Default settings** (ultimate fallback)

## Import/Export Settings

### Exporting Settings

1. **Open Settings → Backup & Restore**
2. **Click "Export Settings"**
3. **Choose what to export**:
   - General settings
   - Templates
   - Per-page configurations
   - History (optional)
4. **Download JSON file**

### Importing Settings

1. **Open Settings → Backup & Restore**
2. **Click "Import Settings"**
3. **Select JSON file**
4. **Choose import options**:
   - Overwrite existing settings
   - Merge with current settings
   - Import only specific sections
5. **Confirm import**

### Sharing Configurations

Export and share specific configurations:
- **Template Collections**: Share custom templates with team
- **Site Configurations**: Share optimized per-page settings
- **Complete Setup**: Share entire configuration for onboarding

## Configuration Best Practices

### Security
- **Never share API keys** in exported configurations
- **Use environment-specific keys** for different setups
- **Regularly rotate API keys** for security

### Performance
- **Start with conservative settings** and adjust as needed
- **Monitor API usage** to avoid unexpected costs
- **Use appropriate models** for different tasks

### Organization
- **Use descriptive names** for custom templates
- **Organize templates by category** for easy finding
- **Document custom configurations** for team sharing

### Maintenance
- **Regularly review settings** for optimization opportunities
- **Clean up unused templates** to reduce clutter
- **Update API keys** when they expire
- **Backup configurations** before major changes

## Troubleshooting Configuration Issues

### Common Problems

#### API Key Not Working
- Verify key format matches provider requirements
- Check key hasn't expired or been revoked
- Ensure sufficient credits/quota available

#### Settings Not Saving
- Check browser storage permissions
- Try disabling other extensions temporarily
- Clear browser cache and reload

#### Per-Page Settings Not Applied
- Verify domain name matches exactly
- Check settings priority order
- Test on a simple page first

#### Templates Not Loading
- Check template syntax for errors
- Verify {text} placeholder is present
- Test template individually before saving

For more troubleshooting help, see the [Troubleshooting Guide](troubleshooting.md).
