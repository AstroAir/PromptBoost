# Templates Directory

This directory contains template-related modules for the PromptBoost extension.

For detailed template documentation, see:
- **[Template Management Guide](../docs/guides/templates.md)** - Complete template guide
- **[Template Examples](../docs/examples/templates.md)** - Practical template examples
- **[Template Schema Reference](../docs/reference/templates.md)** - Template structure reference

## Modules

### TemplateEditor.js
Enhanced template editor with CodeMirror integration that provides:
- Syntax highlighting for prompt templates
- Real-time validation and error checking
- Live preview functionality
- Auto-completion and snippets
- Template formatting and beautification

### TemplateValidator.js
Comprehensive template validation system that provides:
- Syntax validation for template structure
- Placeholder validation (e.g., {text})
- Best practices checking
- Security validation
- Performance analysis

### TemplateVersioning.js
Template version control system that provides:
- Version history tracking
- Rollback capabilities
- Change comparison and diff generation
- Version statistics and analytics
- Automatic cleanup of old versions

### TemplateTester.js
Comprehensive testing framework that provides:
- Validation testing
- Structure and format testing
- Performance testing
- API integration testing
- Automated test reporting

## Features

- **Real-time Editing**: Live editing with syntax highlighting
- **Validation**: Comprehensive validation with detailed error messages
- **Preview**: Real-time preview of template output
- **Testing**: Built-in testing framework for template quality
- **Version Control**: Template versioning and history tracking
- **Performance Testing**: Automated performance and quality assessment

## Usage

```javascript
// Create template editor
const editor = new TemplateEditor({
  container: document.getElementById('editor'),
  onChange: (content) => console.log('Template changed:', content),
  onValidate: (errors) => console.log('Validation errors:', errors)
});

// Validate template
const validator = new TemplateValidator();
const result = validator.validate(templateContent);

// Version control
const versioning = new TemplateVersioning();
const newVersion = versioning.createVersion(template, newContent, 'Updated instructions');

// Test template
const tester = new TemplateTester();
const testResults = await tester.runTests(template, {
  testTypes: ['validation', 'structure', 'performance'],
  provider: 'openai',
  providerConfig: { apiKey: 'sk-...' }
});
```

## Template Structure

Templates follow a standardized structure:

```javascript
{
  id: 'unique-template-id',
  name: 'Template Name',
  description: 'Template description',
  category: 'general|tone|correction|transformation',
  template: 'Template content with {text} placeholder',
  version: 1,
  versions: [
    {
      id: 'version-id',
      version: 1,
      content: 'Template content',
      changelog: 'Version changes',
      createdAt: timestamp,
      createdBy: 'user|system|migration',
      metadata: {
        contentLength: 123,
        hasTextPlaceholder: true,
        wordCount: 45
      }
    }
  ],
  isDefault: false,
  isCustom: true,
  metadata: {
    usage: 0,
    lastUsed: null,
    performance: {
      averageResponseTime: 0,
      successRate: 100
    }
  },
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Best Practices

### Template Writing
- Always include the `{text}` placeholder
- Provide clear, specific instructions
- Use proper grammar and punctuation
- Keep templates concise but comprehensive
- Test templates with various text types

### Version Control
- Use meaningful changelog messages
- Create versions for significant changes
- Review version history before major updates
- Use rollback feature when needed

### Testing
- Run validation tests before deployment
- Test with different text samples
- Monitor performance metrics
- Review API test results

## Integration

Templates integrate with:
- **TemplateManager**: Centralized template management
- **ConfigurationManager**: Template configuration settings
- **Provider System**: AI model integration for testing
- **Options UI**: Template editing interface
- **Background Script**: Template processing and optimization

## Error Handling

All template modules use the centralized ErrorHandler for consistent error management:
- Validation errors are categorized and user-friendly
- Performance issues are logged and monitored
- API errors are handled gracefully with fallbacks
- Version conflicts are resolved automatically

## Performance

Template system is optimized for:
- Fast template processing and validation
- Efficient version storage and retrieval
- Minimal memory usage for large templates
- Quick search and filtering capabilities
- Responsive UI interactions
