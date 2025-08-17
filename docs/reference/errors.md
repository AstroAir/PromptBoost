# Error Codes and Messages Reference

This document provides a comprehensive reference for all error codes, messages, and troubleshooting information in PromptBoost.

## Error Categories

### VALIDATION Errors

#### VALIDATION_001: Missing Text Selection

- **Message**: "Please select some text first"
- **Cause**: User triggered optimization without selecting text
- **Solution**: Select text before using PromptBoost
- **User Action**: Highlight text with mouse or keyboard

#### VALIDATION_002: Text Too Long

- **Message**: "Text too long (maximum 10,000 characters)"
- **Cause**: Selected text exceeds maximum length limit
- **Solution**: Select shorter text or break into smaller chunks
- **User Action**: Reduce selection size

#### VALIDATION_003: Empty Text Selection

- **Message**: "Selected text is empty"
- **Cause**: Text selection contains only whitespace
- **Solution**: Select text with actual content
- **User Action**: Ensure selection contains visible text

#### VALIDATION_004: Invalid Template

- **Message**: "Template must contain {text} placeholder"
- **Cause**: Custom template missing required placeholder
- **Solution**: Add {text} placeholder to template
- **User Action**: Edit template to include {text}

### API Errors

#### API_001: Missing API Key

- **Message**: "API key not configured"
- **Cause**: No API key entered in settings
- **Solution**: Enter valid API key in settings
- **User Action**: Go to Settings → Enter API key → Test connection

#### API_002: Invalid API Key

- **Message**: "Invalid API key format"
- **Cause**: API key doesn't match expected format
- **Solution**: Verify API key format for selected provider
- **User Action**: Check API key format and re-enter

#### API_003: Authentication Failed

- **Message**: "Authentication failed (401)"
- **Cause**: API key is invalid or expired
- **Solution**: Verify API key is active and has permissions
- **User Action**: Check API key in provider dashboard

#### API_004: Rate Limit Exceeded

- **Message**: "Rate limit exceeded (429)"
- **Cause**: Too many requests sent to API
- **Solution**: Wait before retrying or upgrade API plan
- **User Action**: Wait 1-5 minutes before trying again

#### API_005: Insufficient Credits

- **Message**: "Insufficient API credits"
- **Cause**: API account has no remaining credits
- **Solution**: Add credits to API account
- **User Action**: Check billing in provider dashboard

#### API_006: Server Error

- **Message**: "API server error (500)"
- **Cause**: Provider's server experiencing issues
- **Solution**: Try again later or switch providers
- **User Action**: Wait and retry, or use different provider

#### API_007: Service Unavailable

- **Message**: "API service unavailable (503)"
- **Cause**: Provider's service is temporarily down
- **Solution**: Try again later
- **User Action**: Check provider status page

### NETWORK Errors

#### NETWORK_001: Connection Failed

- **Message**: "Network connection failed"
- **Cause**: No internet connection or network issues
- **Solution**: Check internet connection
- **User Action**: Verify internet connectivity

#### NETWORK_002: Request Timeout

- **Message**: "Request timed out"
- **Cause**: API request took too long to complete
- **Solution**: Increase timeout or try shorter text
- **User Action**: Try with shorter text or check connection

#### NETWORK_003: DNS Resolution Failed

- **Message**: "Cannot resolve API endpoint"
- **Cause**: DNS issues or incorrect endpoint URL
- **Solution**: Check endpoint URL and DNS settings
- **User Action**: Verify API endpoint in settings

### CONFIGURATION Errors

#### CONFIG_001: Invalid Provider

- **Message**: "Invalid provider configuration"
- **Cause**: Provider settings are incorrect or incomplete
- **Solution**: Review and correct provider settings
- **User Action**: Go to Settings → Verify provider configuration

#### CONFIG_002: Missing Model

- **Message**: "Model not specified"
- **Cause**: No model selected for the provider
- **Solution**: Select a valid model in settings
- **User Action**: Choose model from dropdown in settings

#### CONFIG_003: Invalid Endpoint

- **Message**: "Invalid API endpoint URL"
- **Cause**: Malformed or incorrect endpoint URL
- **Solution**: Enter correct endpoint URL
- **User Action**: Verify endpoint URL format

#### CONFIG_004: Settings Migration Failed

- **Message**: "Failed to migrate settings"
- **Cause**: Error during settings migration between versions
- **Solution**: Reset to default settings
- **User Action**: Go to Settings → Reset to defaults

### EXTENSION Errors

#### EXT_001: Extension Disabled

- **Message**: "PromptBoost is disabled"
- **Cause**: Extension is turned off in popup
- **Solution**: Enable extension in popup
- **User Action**: Click extension icon → Toggle on

#### EXT_002: Permission Denied

- **Message**: "Permission denied on this page"
- **Cause**: Website blocks extension functionality
- **Solution**: Try on different website
- **User Action**: Use extension on supported sites

#### EXT_003: Content Script Failed

- **Message**: "Content script initialization failed"
- **Cause**: Extension failed to load on page
- **Solution**: Refresh page or reload extension
- **User Action**: Refresh page or restart browser

#### EXT_004: Storage Error

- **Message**: "Failed to save settings"
- **Cause**: Browser storage issues
- **Solution**: Check browser storage permissions
- **User Action**: Clear browser data or check permissions

### TEMPLATE Errors

#### TEMPLATE_001: Template Not Found

- **Message**: "Template not found"
- **Cause**: Selected template was deleted or corrupted
- **Solution**: Select different template or recreate
- **User Action**: Choose different template from list

#### TEMPLATE_002: Template Validation Failed

- **Message**: "Template validation failed"
- **Cause**: Template contains invalid syntax or structure
- **Solution**: Fix template syntax
- **User Action**: Edit template to fix validation errors

#### TEMPLATE_003: Template Test Failed

- **Message**: "Template test failed"
- **Cause**: Template doesn't work with current provider
- **Solution**: Modify template or change provider
- **User Action**: Edit template or try different provider

## Error Handling Flow

### User-Facing Errors

1. **Error occurs** in background or content script
2. **Error is categorized** by type and severity
3. **User-friendly message** is generated
4. **Notification is shown** to user with action buttons
5. **Error is logged** for debugging (if enabled)

### Developer Errors

1. **Error occurs** during development or testing
2. **Detailed error information** is logged to console
3. **Stack trace** is preserved for debugging
4. **Error context** is captured (settings, state, etc.)

### Error Recovery

#### Automatic Recovery

- **Network errors**: Automatic retry with exponential backoff
- **Rate limits**: Automatic delay and retry
- **Temporary failures**: Retry with different provider if configured

#### User-Initiated Recovery

- **Settings errors**: Reset to defaults option
- **Template errors**: Template validation and repair
- **API errors**: Test connection and key validation

## Error Logging

### Log Levels

- **ERROR**: Critical errors that prevent functionality
- **WARN**: Non-critical issues that may affect performance
- **INFO**: General information about operations
- **DEBUG**: Detailed debugging information

### Log Format

```javascript
{
  timestamp: "2024-01-15T10:30:00.000Z",
  level: "ERROR",
  category: "API",
  code: "API_003",
  message: "Authentication failed (401)",
  context: {
    provider: "openai",
    endpoint: "https://api.openai.com/v1/chat/completions",
    textLength: 150
  },
  stack: "Error stack trace...",
  userId: "anonymous-hash"
}
```

### Accessing Logs

1. **Enable debug logging** in Settings → Advanced
2. **Open browser console** (F12)
3. **Look for PromptBoost logs** with timestamps
4. **Export logs** using console commands

## Common Error Scenarios

### First-Time Setup

1. **"API key not configured"** → Enter API key in settings
2. **"Invalid API key format"** → Check key format for provider
3. **"Authentication failed"** → Verify key is active

### Daily Usage

1. **"Please select some text first"** → Select text before triggering
2. **"Rate limit exceeded"** → Wait before retrying
3. **"Network connection failed"** → Check internet connection

### Advanced Usage

1. **"Template validation failed"** → Fix template syntax
2. **"Permission denied on this page"** → Try different website
3. **"Settings migration failed"** → Reset to defaults

## Error Prevention

### Best Practices

1. **Test API connection** after entering keys
2. **Start with small text selections** to test functionality
3. **Keep API keys up to date** and monitor usage
4. **Use supported websites** for best compatibility
5. **Enable debug logging** when troubleshooting

### Monitoring

1. **Check API usage** regularly in provider dashboards
2. **Monitor error rates** in extension logs
3. **Update extension** when new versions are available
4. **Backup settings** before major changes

## Getting Help

### Self-Help

1. **Check this error reference** for specific error codes
2. **Try troubleshooting steps** listed for each error
3. **Test on simple websites** like Gmail or Google Docs
4. **Reset settings** if configuration seems corrupted

### Community Support

1. **Search GitHub issues** for similar problems
2. **Check documentation** for detailed guides
3. **Ask in discussions** for community help
4. **Report bugs** with error logs and reproduction steps

### Contact Support

When contacting support, include:

- **Error code and message**
- **Browser and extension version**
- **Steps to reproduce**
- **Console logs** (if available)
- **Settings configuration** (without API keys)

For more help, see:

- [Troubleshooting Guide](../guides/troubleshooting.md)
- [User Manual](../guides/user-manual.md)
- [Configuration Guide](../guides/configuration.md)
