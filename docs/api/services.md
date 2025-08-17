# Services API

The Services layer provides centralized business logic for the PromptBoost extension. Services follow the singleton pattern and provide event-driven communication.

## TemplateManager

Centralized template management service that handles all template operations.

### Getting Instance

```javascript
import { TemplateManager } from '../services/TemplateManager.js';
const templateManager = TemplateManager.getInstance();
```

### Initialization

```javascript
await templateManager.initialize();
```

### Core Methods

#### createTemplate(templateData)

Creates a new template with validation and versioning.

**Parameters:**
- `templateData` (Object): Template data
  - `name` (string): Template name
  - `description` (string): Template description
  - `category` (string): Template category
  - `template` (string): Template content with {text} placeholder
  - `isCustom` (boolean): Whether this is a custom template

**Returns:** Promise<Object> - Created template with ID and metadata

**Example:**
```javascript
const template = await templateManager.createTemplate({
  name: 'Professional Email',
  description: 'Makes text more professional for emails',
  category: 'business',
  template: 'Please rewrite this text in a professional email tone: {text}',
  isCustom: true
});
```

#### getTemplate(templateId)

Retrieves a template by ID.

**Parameters:**
- `templateId` (string): Template ID

**Returns:** Object|null - Template object or null if not found

#### getAllTemplates(filters)

Gets all templates with optional filtering.

**Parameters:**
- `filters` (Object, optional): Filter criteria
  - `category` (string): Filter by category
  - `isCustom` (boolean): Filter by custom/default
  - `search` (string): Search in name/description

**Returns:** Array<Object> - Array of template objects

**Example:**
```javascript
// Get all templates
const allTemplates = templateManager.getAllTemplates();

// Get only custom templates
const customTemplates = templateManager.getAllTemplates({ isCustom: true });

// Search templates
const searchResults = templateManager.getAllTemplates({ search: 'professional' });
```

#### updateTemplate(templateId, updates)

Updates an existing template with versioning.

**Parameters:**
- `templateId` (string): Template ID
- `updates` (Object): Fields to update

**Returns:** Promise<Object> - Updated template

#### deleteTemplate(templateId)

Deletes a template (custom templates only).

**Parameters:**
- `templateId` (string): Template ID

**Returns:** Promise<boolean> - Success status

#### testTemplate(templateId, options)

Runs automated tests on a template.

**Parameters:**
- `templateId` (string): Template ID
- `options` (Object): Test options
  - `testTypes` (Array<string>): Types of tests to run
  - `provider` (string): AI provider for testing
  - `providerConfig` (Object): Provider configuration

**Returns:** Promise<Object> - Test results

**Example:**
```javascript
const results = await templateManager.testTemplate('professional-tone', {
  testTypes: ['validation', 'structure', 'performance'],
  provider: 'openai',
  providerConfig: { apiKey: 'sk-...' }
});
```

### Versioning Methods

#### createTemplateVersion(templateId, content, changelog)

Creates a new version of a template.

**Parameters:**
- `templateId` (string): Template ID
- `content` (string): New template content
- `changelog` (string): Description of changes

**Returns:** Promise<Object> - New version object

#### getTemplateVersions(templateId)

Gets all versions of a template.

**Parameters:**
- `templateId` (string): Template ID

**Returns:** Array<Object> - Array of version objects

#### rollbackTemplate(templateId, versionId)

Rolls back a template to a previous version.

**Parameters:**
- `templateId` (string): Template ID
- `versionId` (string): Version ID to rollback to

**Returns:** Promise<Object> - Updated template

### Analytics Methods

#### recordTemplateUsage(templateId, metrics)

Records usage metrics for a template.

**Parameters:**
- `templateId` (string): Template ID
- `metrics` (Object): Usage metrics
  - `responseTime` (number): API response time in ms
  - `success` (boolean): Whether the operation succeeded

**Example:**
```javascript
await templateManager.recordTemplateUsage('professional-tone', {
  responseTime: 1500,
  success: true
});
```

#### getTemplateAnalytics(templateId)

Gets analytics data for a template.

**Parameters:**
- `templateId` (string): Template ID

**Returns:** Object - Analytics data including usage stats and performance metrics

### Import/Export Methods

#### exportTemplates(templateIds)

Exports templates to JSON format.

**Parameters:**
- `templateIds` (Array<string>, optional): Specific template IDs to export

**Returns:** Object - Export data

#### importTemplates(importData, options)

Imports templates from JSON data.

**Parameters:**
- `importData` (Object): Import data
- `options` (Object): Import options
  - `overwrite` (boolean): Whether to overwrite existing templates
  - `validate` (boolean): Whether to validate templates

**Returns:** Promise<Object> - Import results

### Events

The TemplateManager emits events for state changes:

- `templateCreated`: When a template is created
- `templateUpdated`: When a template is updated
- `templateDeleted`: When a template is deleted
- `templateTested`: When a template test completes

**Example:**
```javascript
templateManager.on('templateCreated', (template) => {
  console.log('New template created:', template.name);
});
```

## ConfigurationManager

Centralized configuration management service with per-page support.

### Getting Instance

```javascript
import { ConfigurationManager } from '../services/ConfigurationManager.js';
const configManager = ConfigurationManager.getInstance();
```

### Initialization

```javascript
await configManager.initialize();
```

### Core Methods

#### getConfiguration(domain)

Gets configuration for a specific domain or global configuration.

**Parameters:**
- `domain` (string, optional): Domain name for per-page config

**Returns:** Object - Configuration object

**Example:**
```javascript
// Get global configuration
const globalConfig = configManager.getConfiguration();

// Get domain-specific configuration
const domainConfig = configManager.getConfiguration('gmail.com');
```

#### setConfiguration(domain, config)

Sets configuration for a domain or globally.

**Parameters:**
- `domain` (string|Object): Domain name or config object for global
- `config` (Object, optional): Configuration object

**Example:**
```javascript
// Set global configuration
configManager.setConfiguration({
  provider: 'openai',
  model: 'gpt-4'
});

// Set domain-specific configuration
configManager.setConfiguration('gmail.com', {
  provider: 'anthropic',
  model: 'claude-3-sonnet'
});
```

#### saveConfiguration()

Saves current configuration to storage.

**Returns:** Promise<void>

#### resetConfiguration(domain)

Resets configuration to defaults.

**Parameters:**
- `domain` (string, optional): Domain to reset, or global if not provided

#### validateConfiguration(config)

Validates a configuration object.

**Parameters:**
- `config` (Object): Configuration to validate

**Returns:** Object - Validation result with errors and warnings

### Per-Page Configuration

#### getPerPageConfiguration(domain)

Gets configuration specific to a domain.

**Parameters:**
- `domain` (string): Domain name

**Returns:** Object|null - Domain configuration or null

#### setPerPageConfiguration(domain, config)

Sets configuration for a specific domain.

**Parameters:**
- `domain` (string): Domain name
- `config` (Object): Configuration object

#### removePerPageConfiguration(domain)

Removes per-page configuration for a domain.

**Parameters:**
- `domain` (string): Domain name

#### getAllPerPageConfigurations()

Gets all per-page configurations.

**Returns:** Map<string, Object> - Map of domain to configuration

### Migration Methods

#### migrateConfigurationIfNeeded()

Automatically migrates configuration to current version.

**Returns:** Promise<void>

#### getMigrationVersion()

Gets current migration version.

**Returns:** Promise<number>

### Backup/Restore Methods

#### exportConfiguration()

Exports all configuration data.

**Returns:** Object - Export data including global and per-page configs

#### importConfiguration(importData, options)

Imports configuration data.

**Parameters:**
- `importData` (Object): Import data
- `options` (Object): Import options
  - `overwrite` (boolean): Whether to overwrite existing config
  - `validate` (boolean): Whether to validate before import

**Returns:** Promise<Object> - Import results

### Default Configuration

The ConfigurationManager provides these default settings:

```javascript
{
  enabled: true,
  timeWindow: 1000,
  provider: 'openai',
  apiKey: '',
  apiEndpoint: 'https://api.openai.com/v1/chat/completions',
  model: 'gpt-3.5-turbo',
  promptTemplate: 'Please improve and optimize the following text...',
  keyboardShortcut: 'Ctrl+Shift+Space',
  quickTemplateSelection: true,
  selectedTemplate: 'general',
  advanced: {
    enableLogging: false,
    autoSaveHistory: true,
    maxHistoryItems: 100,
    requestTimeout: 30,
    retryAttempts: 3,
    showNotifications: true,
    notificationDuration: 4,
    maxTokens: 1000,
    temperature: 0.7
  },
  perPage: {}
}
```

### Events

The ConfigurationManager emits events for state changes:

- `configurationLoaded`: When configuration is loaded
- `configurationSaved`: When configuration is saved
- `configurationChanged`: When configuration changes
- `perPageConfigurationChanged`: When per-page config changes

## Service Communication

Services communicate through events and direct method calls:

### Event System

```javascript
// Listen for events
templateManager.on('templateCreated', (template) => {
  // Handle template creation
});

configManager.on('configurationChanged', (config) => {
  // Handle configuration change
});

// Emit custom events
templateManager.emit('customEvent', data);
```

### Cross-Service Integration

```javascript
// Services can interact with each other
const template = templateManager.getTemplate('professional-tone');
const config = configManager.getConfiguration();

// Use template with current configuration
const result = await optimizeText(text, template, config);
```

## Error Handling

All service methods use centralized error handling:

```javascript
try {
  const template = await templateManager.createTemplate(data);
} catch (error) {
  // Error is automatically categorized and logged
  console.error('Template creation failed:', error.message);
}
```

## Performance Considerations

- Services use lazy loading for better performance
- Template operations are cached for frequently accessed templates
- Configuration changes are debounced to prevent excessive storage writes
- Analytics data is batched for efficient storage

## Usage Examples

### Complete Template Workflow

```javascript
// Initialize services
const templateManager = TemplateManager.getInstance();
await templateManager.initialize();

// Create a new template
const template = await templateManager.createTemplate({
  name: 'Marketing Copy',
  description: 'Optimizes text for marketing materials',
  category: 'marketing',
  template: 'Rewrite this text for marketing: {text}',
  isCustom: true
});

// Test the template
const testResults = await templateManager.testTemplate(template.id, {
  testTypes: ['validation', 'performance'],
  provider: 'openai'
});

// Record usage
await templateManager.recordTemplateUsage(template.id, {
  responseTime: 1200,
  success: true
});

// Get analytics
const analytics = templateManager.getTemplateAnalytics(template.id);
```

### Configuration Management

```javascript
// Initialize configuration manager
const configManager = ConfigurationManager.getInstance();
await configManager.initialize();

// Set up per-page configuration
configManager.setPerPageConfiguration('docs.google.com', {
  provider: 'anthropic',
  model: 'claude-3-sonnet',
  temperature: 0.5
});

// Get effective configuration for a domain
const effectiveConfig = configManager.getConfiguration('docs.google.com');

// Export configuration for backup
const backup = configManager.exportConfiguration();
```

For more information, see:
- [Background Script API](background.md)
- [Template Management Guide](../guides/templates.md)
- [Configuration Guide](../guides/configuration.md)
