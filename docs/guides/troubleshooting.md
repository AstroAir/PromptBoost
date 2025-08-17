# PromptBoost Troubleshooting Guide

Having issues with PromptBoost? This comprehensive troubleshooting guide will help you identify and resolve common problems quickly.

## Quick Diagnostics

### Is PromptBoost Working At All?

1. **Check Extension Status**
   - Click the PromptBoost icon in your browser toolbar
   - Ensure the toggle switch shows "Enabled"
   - If disabled, click to enable

2. **Test API Connection**
   - Open Settings → General
   - Click "Test API" button
   - If test fails, check your API key and internet connection

3. **Try Simple Test**
   - Go to a simple website (like Google)
   - Type "hello world" in the search box
   - Select the text and press spacebar 3 times
   - If nothing happens, continue with detailed troubleshooting below

## Common Issues and Solutions

### 1. Triple Spacebar Not Working

#### Symptoms
- Pressing spacebar 3 times doesn't trigger optimization
- No visual feedback when pressing spacebar
- Extension seems inactive

#### Solutions

**Adjust Detection Window**
1. Open Settings → General → Detection Window
2. Increase to 1500ms or 2000ms
3. Try triple spacebar again

**Check Text Selection**
- Ensure text is actually selected before pressing spacebar
- Try selecting text with mouse, not just cursor placement
- Some websites require clicking in text field first

**Use Alternative Methods**
- Try keyboard shortcut: `Ctrl+Shift+Space`
- Try right-click menu: Right-click selected text → PromptBoost
- Try template selector: `Ctrl+Shift+T`

**Browser-Specific Issues**
- **Chrome**: Ensure extension has permissions for the current site
- **Edge**: Check if extension is enabled for InPrivate browsing
- **Firefox**: May require manifest modifications

#### Still Not Working?
```javascript
// Check browser console for errors:
// 1. Press F12 to open developer tools
// 2. Go to Console tab
// 3. Look for PromptBoost-related errors
// 4. Try triple spacebar and watch for new errors
```

### 2. API Connection Issues

#### Symptoms
- "API key not configured" error
- "API request failed" messages
- Optimization never completes

#### Solutions

**Verify API Key**
1. Check API key format:
   - OpenAI: Starts with `sk-`
   - Anthropic: Starts with `sk-ant-`
   - Google: Starts with `AIza`
2. Ensure no extra spaces or characters
3. Try copying and pasting key again

**Check API Key Status**
- **OpenAI**: Visit [OpenAI Platform](https://platform.openai.com/account/billing)
- **Anthropic**: Visit [Anthropic Console](https://console.anthropic.com/)
- **Google**: Visit [Google AI Studio](https://makersuite.google.com/)
- Verify key is active and has available credits/quota

**Test Different Provider**
1. Try switching to a different AI provider
2. Use a known working API key
3. If other provider works, issue is with original provider

**Network Issues**
- Check internet connection
- Try disabling VPN temporarily
- Check if corporate firewall blocks AI APIs
- Try from different network

### 3. Text Not Being Replaced

#### Symptoms
- Optimization completes but text doesn't change
- Success notification appears but text remains the same
- Loading indicator disappears without changes

#### Solutions

**Website Compatibility**
- Some websites prevent text modification for security
- Try on a different website (Gmail, Google Docs work well)
- Use the included `test.html` file to verify functionality

**Text Selection Issues**
- Ensure text is properly selected (highlighted)
- Try selecting text with mouse drag, not double-click
- For contenteditable elements, click inside first

**Browser Permissions**
- Check if site has special restrictions
- Try disabling other extensions temporarily
- Clear browser cache and cookies for the site

**Element Type Issues**
Different elements behave differently:
- **Textarea**: Usually works well
- **Input fields**: Should work for text inputs
- **Contenteditable**: May require special handling
- **Regular text**: Read-only, can't be modified

### 4. Extension Not Loading

#### Symptoms
- Extension icon not visible in toolbar
- Extension appears grayed out
- Settings page won't open

#### Solutions

**Check Extension Installation**
1. Go to `chrome://extensions/`
2. Find PromptBoost in the list
3. Ensure it's enabled (toggle switch on)
4. Check for error messages

**Reload Extension**
1. Go to `chrome://extensions/`
2. Find PromptBoost
3. Click the refresh/reload icon
4. Try using extension again

**Check Permissions**
- Ensure extension has necessary permissions
- Some sites may require additional permissions
- Try on a different website

**Reinstall Extension**
1. Remove current installation
2. Download fresh copy
3. Install following [Installation Guide](installation.md)

### 5. Settings Not Saving

#### Symptoms
- Settings revert after closing browser
- Changes don't persist between sessions
- Import/export not working

#### Solutions

**Browser Storage Issues**
1. Check browser storage permissions
2. Clear browser data (may reset settings)
3. Ensure sufficient storage space available

**Sync Issues**
- If using Chrome sync, try disabling temporarily
- Check if signed into correct Google account
- Try local storage instead of sync storage

**Extension Conflicts**
- Disable other extensions temporarily
- Check for extensions that modify storage
- Try in incognito/private mode

### 6. Poor Optimization Results

#### Symptoms
- AI returns irrelevant text
- Results are worse than original
- Inconsistent quality

#### Solutions

**Template Issues**
- Try different templates for your use case
- Check if template includes `{text}` placeholder
- Create more specific custom templates

**Provider/Model Issues**
- Try different AI provider
- Switch to higher quality model (e.g., GPT-4 instead of GPT-3.5)
- Adjust temperature settings (lower = more conservative)

**Input Text Issues**
- Ensure selected text is complete thoughts
- Avoid selecting partial sentences
- Try with different types of text

**API Settings**
- Increase max tokens for longer responses
- Adjust temperature (0.3-0.7 usually works well)
- Check if API quota is exhausted

## Advanced Troubleshooting

### Debug Mode

Enable debug logging for detailed troubleshooting:

1. **Open Settings** → Advanced → Debug Logging
2. **Enable debug logging**
3. **Reproduce the issue**
4. **Check browser console** (F12 → Console)
5. **Look for detailed error messages**

### Browser Console Debugging

```javascript
// Open browser console (F12) and run:
console.log('PromptBoost Debug Info:');
console.log('Extension enabled:', window.promptBoostInstance?.isEnabled);
console.log('Settings:', window.promptBoostInstance?.settings);
console.log('Last error:', window.promptBoostInstance?.lastError);
```

### Network Debugging

1. **Open Developer Tools** (F12)
2. **Go to Network tab**
3. **Trigger optimization**
4. **Look for API requests**
5. **Check request/response details**

### Storage Debugging

```javascript
// Check extension storage:
chrome.storage.sync.get(null, (data) => {
  console.log('Extension storage:', data);
});
```

## Error Messages and Solutions

### "API key not configured"
- **Cause**: No API key entered or invalid format
- **Solution**: Enter valid API key in settings

### "Please select some text first"
- **Cause**: No text selected when triggering optimization
- **Solution**: Select text before using PromptBoost

### "Text too long (maximum 10,000 characters)"
- **Cause**: Selected text exceeds length limit
- **Solution**: Select shorter text or increase max tokens

### "API request failed: 401"
- **Cause**: Invalid or expired API key
- **Solution**: Check and update API key

### "API request failed: 429"
- **Cause**: Rate limit exceeded
- **Solution**: Wait and try again, or upgrade API plan

### "API request failed: 500"
- **Cause**: Server error on AI provider side
- **Solution**: Try again later or switch providers

### "Network error"
- **Cause**: Internet connection issues
- **Solution**: Check internet connection and try again

## Site-Specific Issues

### Gmail
- **Issue**: Text not replacing in compose window
- **Solution**: Click inside compose area first, then select text

### Google Docs
- **Issue**: Formatting lost after optimization
- **Solution**: Use "Paste special" → "Plain text" if needed

### Twitter/X
- **Issue**: Character limit exceeded
- **Solution**: Use "Social Media" template or adjust max tokens

### Slack
- **Issue**: Markdown formatting issues
- **Solution**: Use "Casual Tone" template, avoid complex formatting

### Banking/Secure Sites
- **Issue**: Extension blocked by security policies
- **Solution**: This is normal for security; use on other sites

## Performance Issues

### Slow Response Times
- **Causes**: Large text, complex templates, slow API provider
- **Solutions**: 
  - Use faster models (GPT-3.5 vs GPT-4)
  - Reduce max tokens
  - Simplify templates
  - Check internet connection

### High API Costs
- **Causes**: Using expensive models, long text, high token limits
- **Solutions**:
  - Switch to cheaper models
  - Reduce max tokens
  - Use more efficient templates
  - Monitor usage in provider dashboard

## Getting Additional Help

### Self-Help Resources
1. **Test Page**: Use included `test.html` for isolated testing
2. **Settings Reset**: Try resetting to default settings
3. **Different Browser**: Test in different browser
4. **Incognito Mode**: Try in private/incognito mode

### Community Support
- **GitHub Issues**: Report bugs and get help
- **Documentation**: Check other guides in this documentation
- **FAQ**: Common questions and answers

### Reporting Issues

When reporting issues, include:
1. **Browser and version**
2. **Extension version**
3. **Steps to reproduce**
4. **Error messages**
5. **Console logs** (if available)
6. **Screenshots** (if helpful)

### Contact Information
- **GitHub Issues**: [Report bugs and issues](https://github.com/your-repo/promptboost/issues)
- **Discussions**: [Community discussions](https://github.com/your-repo/promptboost/discussions)
- **Email**: support@promptboost.dev

## Prevention Tips

### Regular Maintenance
- **Update API keys** before they expire
- **Clear old history** periodically
- **Review settings** monthly
- **Test after browser updates**

### Best Practices
- **Start simple** with basic templates
- **Test on simple sites** first
- **Keep backups** of custom templates
- **Monitor API usage** to avoid surprises

### Staying Updated
- **Check for updates** regularly
- **Read release notes** for new features
- **Follow best practices** in documentation
- **Join community** for tips and updates

Remember: Most issues have simple solutions. Start with the basics (API key, text selection, internet connection) before diving into advanced troubleshooting.
