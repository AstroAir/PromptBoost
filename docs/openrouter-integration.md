# OpenRouter Integration Guide

This document describes the OpenRouter integration in PromptBoost, including authentication methods, features, and troubleshooting.

## Overview

OpenRouter provides access to multiple AI models through a unified API. PromptBoost supports two authentication methods:

1. **OAuth PKCE Flow** - Secure browser-based authentication (recommended)
2. **Manual API Key** - Direct API key entry

## Features

- **Multiple Models**: Access to 100+ AI models from various providers
- **OAuth PKCE Authentication**: Secure authentication without storing credentials
- **Automatic Model Discovery**: Dynamic model list refresh from OpenRouter API
- **Real-time Testing**: Test API connections and model availability
- **Error Handling**: Comprehensive error messages and recovery options

## Authentication Methods

### OAuth PKCE Flow (Recommended)

The OAuth PKCE (Proof Key for Code Exchange) flow provides secure authentication without requiring users to manually handle API keys.

#### How it Works

1. User clicks "Login with OpenRouter" in the extension options
2. Extension generates PKCE parameters (code verifier and challenge)
3. User is redirected to OpenRouter's authorization page
4. User authorizes the application on OpenRouter
5. OpenRouter redirects back with an authorization code
6. Extension exchanges the code for an API key using PKCE verification
7. API key is automatically saved in the extension

#### Implementation Details

- **Authorization URL**: `https://openrouter.ai/auth`
- **Token Exchange Endpoint**: `https://openrouter.ai/api/v1/auth/keys`
- **PKCE Method**: S256 (SHA256)
- **Redirect URI**: Chrome extension redirect URL

### Manual API Key Entry

Users can also manually enter their OpenRouter API key:

1. Visit [OpenRouter API Keys](https://openrouter.ai/keys)
2. Create a new API key
3. Copy the key (format: `sk-or-...`)
4. Paste into the extension's API Key field
5. Save settings

## Configuration

### Required Settings

- **Provider**: Select "OpenRouter (Multiple Models)"
- **API Key**: Either from OAuth flow or manual entry

### Optional Settings

- **Base URL**: Custom API endpoint (default: `https://openrouter.ai/api/v1`)
- **App Name**: Application identifier (default: "PromptBoost")
- **Model**: Specific model to use (auto-populated from API)

## Model Management

### Automatic Model Discovery

After authentication, the extension automatically:

1. Fetches available models from OpenRouter API
2. Populates the model dropdown with current options
3. Displays model information (context length, pricing, etc.)
4. Updates model list when refresh button is clicked

### Model Information

For each model, the extension displays:

- **Name**: Human-readable model name
- **Description**: Model capabilities and use cases
- **Context Length**: Maximum input tokens
- **Pricing**: Cost per 1K input/output tokens

## Testing and Validation

### Connection Testing

The "Test API" button performs:

1. Configuration validation
2. Authentication verification
3. Sample API call to test connectivity
4. Model availability check

### Status Indicators

- **Green Dot**: Successfully authenticated and tested
- **Yellow Dot**: Loading or in progress
- **Red Dot**: Error or authentication failure
- **Gray Dot**: Not tested or unknown status

## Error Handling

### Common Errors and Solutions

#### Authentication Errors

**Error**: "Invalid API key"

- **Solution**: Re-authenticate using OAuth flow or check manual API key

**Error**: "Authentication timed out"

- **Solution**: Check internet connection and try again

**Error**: "User denied authorization"

- **Solution**: Complete the OAuth flow on OpenRouter's website

#### API Errors

**Error**: "Rate limit exceeded"

- **Solution**: Wait for rate limit reset or upgrade OpenRouter plan

**Error**: "Model not available"

- **Solution**: Refresh model list or select a different model

**Error**: "Network error"

- **Solution**: Check internet connection and firewall settings

#### Model Loading Errors

**Error**: "Failed to load models"

- **Solution**: Verify authentication and refresh model list

**Error**: "No models found"

- **Solution**: Check OpenRouter account status and available credits

## Troubleshooting

### OAuth Flow Issues

1. **Popup Blocked**: Ensure popup blocker allows extension popups
2. **Redirect Failed**: Check if extension is properly installed
3. **Code Exchange Failed**: Verify internet connection and try again

### API Connection Issues

1. **Test Connection**: Use the "Test API" button to diagnose issues
2. **Check Logs**: Open browser developer tools for detailed error messages
3. **Verify Settings**: Ensure all required fields are filled correctly

### Model Refresh Issues

1. **Clear Cache**: Reload the extension options page
2. **Re-authenticate**: Try the OAuth flow again
3. **Manual Refresh**: Click the refresh models button

## Security Considerations

### OAuth PKCE Benefits

- No API key storage in extension
- Secure authorization flow
- Automatic token refresh
- User-controlled access

### Best Practices

1. Use OAuth PKCE flow when possible
2. Regularly refresh authentication
3. Monitor API usage on OpenRouter dashboard
4. Keep extension updated for security patches

## API Reference

### Endpoints Used

- **Models**: `GET /api/v1/models` - List available models
- **Chat**: `POST /api/v1/chat/completions` - Generate text
- **Auth**: `POST /api/v1/auth/keys` - Exchange authorization code

### Headers Required

```javascript
{
  'Authorization': 'Bearer <api_key>',
  'HTTP-Referer': '<extension_url>',
  'X-Title': 'PromptBoost',
  'Content-Type': 'application/json'
}
```

## Migration Guide

### From Manual API Key to OAuth

1. Remove existing API key from settings
2. Click "Login with OpenRouter" button
3. Complete OAuth authorization
4. Verify new authentication works

### Updating from Previous Versions

The integration is backward compatible. Existing API keys will continue to work alongside the new OAuth flow.

## Support

For issues with OpenRouter integration:

1. Check this documentation for common solutions
2. Test connection using built-in tools
3. Verify OpenRouter account status
4. Contact support with specific error messages

## Changelog

### Version 2.0.0

- Added OAuth PKCE authentication flow
- Improved error handling and user feedback
- Enhanced model discovery and refresh
- Added comprehensive testing capabilities
- Updated UI with status indicators

### Previous Versions

- Basic API key authentication
- Static model list
- Limited error handling
