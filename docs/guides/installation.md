# PromptBoost Installation Guide

## Quick Start

1. **Download/Clone** this repository to your computer
2. **Open Chrome** and go to `chrome://extensions/`
3. **Enable Developer Mode** (toggle in top right)
4. **Click "Load unpacked"** and select the PromptBoost folder
5. **Configure your API key** by clicking the extension icon → Settings

## Detailed Installation Steps

### Step 1: Get the Extension Files

**Option A: Download ZIP**

1. Click the green "Code" button on GitHub
2. Select "Download ZIP"
3. Extract the ZIP file to a folder on your computer

**Option B: Clone with Git**

```bash
git clone https://github.com/your-repo/promptboost.git
cd promptboost
```

### Step 2: Load in Chrome/Edge

1. **Open your browser** (Chrome, Edge, or Chromium-based)
2. **Navigate to extensions page**:
   - Chrome: `chrome://extensions/`
   - Edge: `edge://extensions/`
3. **Enable Developer Mode**:
   - Look for a toggle switch in the top right
   - Turn it ON
4. **Load the extension**:
   - Click "Load unpacked" button
   - Browse to and select the PromptBoost folder
   - Click "Select Folder"

### Step 3: Verify Installation

1. **Check the extension icon** appears in your browser toolbar
2. **Click the icon** to open the popup
3. **Status should show** "API key required" (this is normal)

### Step 4: Configure API Key

1. **Click "Settings"** in the popup
2. **Choose your LLM provider**:
   - OpenAI (recommended for beginners)
   - Anthropic Claude
   - Google Gemini
   - Custom API endpoint
3. **Enter your API key**
4. **Test the connection** using the "Test API" button
5. **Save settings**

## Getting API Keys

### OpenAI API Key

1. Visit [OpenAI API Keys](https://platform.openai.com/api-keys)
2. Sign in or create an account
3. Click "Create new secret key"
4. Copy the key (starts with `sk-`)
5. Paste into PromptBoost settings

**Cost**: Pay-per-use, typically $0.002 per 1K tokens

### Anthropic API Key

1. Visit [Anthropic Console](https://console.anthropic.com/)
2. Sign in or create an account
3. Go to "API Keys" section
4. Generate a new API key
5. Copy and paste into PromptBoost settings

**Cost**: Pay-per-use, pricing varies by model

### Google Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with Google account
3. Create a new API key
4. Copy the key (starts with `AIza`)
5. Paste into PromptBoost settings

**Cost**: Free tier available, then pay-per-use

### Custom API Setup

For self-hosted or other providers:

1. Select "Custom" as provider
2. Enter your API endpoint URL
3. Configure authentication (API key or bearer token)
4. Set the model name
5. Test the connection

## Troubleshooting

### Extension Not Loading

- **Check folder structure**: Make sure `manifest.json` is in the root
- **Check permissions**: Ensure you have read access to the folder
- **Try refreshing**: Go to extensions page and click the refresh icon

### API Not Working

- **Verify API key**: Make sure it's copied correctly (no extra spaces)
- **Check billing**: Ensure your API account has available credits
- **Test connection**: Use the "Test API" button in settings

### Triple Spacebar Not Working

- **Check if enabled**: Verify extension is enabled in the popup
- **Adjust timing**: Increase the detection window in settings
- **Try keyboard shortcut**: Use Ctrl+Shift+Space instead

### Text Not Replacing

- **Check text selection**: Make sure text is actually selected
- **Try different sites**: Some sites may block text modification
- **Check console**: Open browser dev tools for error messages

## Browser Compatibility

### Fully Supported

- ✅ Google Chrome (88+)
- ✅ Microsoft Edge (88+)
- ✅ Chromium-based browsers

### Requires Modification

- ⚠️ Firefox: Needs manifest.json conversion to Manifest V2
- ⚠️ Safari: Requires significant changes for Safari Web Extensions

## Security Notes

- **API keys are stored locally** in your browser's secure storage
- **No data is sent to PromptBoost servers** - only to your chosen LLM provider
- **Extension only accesses current tab** when you trigger it
- **All processing is client-side** except for the AI API calls

## Uninstalling

1. Go to `chrome://extensions/`
2. Find PromptBoost in the list
3. Click "Remove"
4. Confirm removal

Your settings and API keys will be automatically deleted.

## Getting Help

- **Issues**: Check the [GitHub Issues](https://github.com/your-repo/promptboost/issues)
- **Documentation**: Read the main [README.md](../README.md)
- **Test Page**: Use `test.html` to verify functionality

## Next Steps

After installation:

1. **Read the [User Manual](user-manual.md)** for detailed usage instructions
2. **Explore [Template Management](templates.md)** to customize prompts
3. **Check [Configuration Guide](configuration.md)** for advanced settings
4. **Review [Troubleshooting](troubleshooting.md)** for common issues

## Updates

To update PromptBoost:

1. Download the latest version
2. Replace the old folder with the new one
3. Go to `chrome://extensions/`
4. Click the refresh icon for PromptBoost
5. Your settings will be preserved automatically
