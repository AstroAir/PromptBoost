# Template Schema Reference

This document provides the complete schema and reference for PromptBoost templates, including structure, validation rules, and examples.

## Template Object Schema

### Complete Template Structure

```javascript
{
  // Core Properties
  "id": string,                          // Unique identifier (UUID or slug)
  "name": string,                        // Human-readable name
  "description": string,                 // Template description and usage
  "category": string,                    // Template category
  "template": string,                    // Prompt template with {text} placeholder
  
  // Version Information
  "version": number,                     // Current version number
  "versions": Array<VersionObject>,     // Version history
  
  // Classification
  "isDefault": boolean,                  // Built-in template flag
  "isCustom": boolean,                   // User-created template flag
  "isActive": boolean,                   // Template enabled/disabled
  
  // Timestamps
  "createdAt": number,                   // Creation timestamp (Unix)
  "updatedAt": number,                   // Last modification timestamp
  
  // Usage Analytics
  "metadata": {
    "usage": number,                     // Total usage count
    "lastUsed": number,                  // Last used timestamp
    "performance": {
      "averageResponseTime": number,     // Average API response time (ms)
      "successRate": number,             // Success rate (0-100)
      "totalRequests": number,           // Total API requests
      "failedRequests": number           // Failed API requests
    },
    "ratings": {
      "averageRating": number,           // Average user rating (1-5)
      "totalRatings": number             // Number of ratings
    },
    "lastTestResults": {
      "score": number,                   // Last test score (0-100)
      "testDate": number,                // Test timestamp
      "testType": string,                // Type of test performed
      "passed": boolean                  // Test passed/failed
    }
  },
  
  // Configuration
  "config": {
    "maxTokens": number,                 // Recommended max tokens
    "temperature": number,               // Recommended temperature
    "preferredProviders": Array<string>, // Recommended AI providers
    "tags": Array<string>                // Template tags for search
  }
}
```

## Core Properties

### id

- **Type**: `string`
- **Required**: Yes
- **Format**: UUID v4 or kebab-case slug
- **Examples**:
  - `"550e8400-e29b-41d4-a716-446655440000"`
  - `"professional-email-tone"`
- **Validation**: Must be unique across all templates

### name

- **Type**: `string`
- **Required**: Yes
- **Length**: 1-100 characters
- **Examples**:
  - `"Professional Email Tone"`
  - `"Social Media Post Optimizer"`
- **Validation**: Must not be empty, no leading/trailing whitespace

### description

- **Type**: `string`
- **Required**: Yes
- **Length**: 10-500 characters
- **Purpose**: Explain what the template does and when to use it
- **Example**: `"Converts casual text into professional email format suitable for business communication"`

### category

- **Type**: `string`
- **Required**: Yes
- **Enum Values**:
  - `"general"` - General text improvement
  - `"tone"` - Tone adjustment templates
  - `"business"` - Business communication
  - `"creative"` - Creative writing assistance
  - `"technical"` - Technical documentation
  - `"social"` - Social media optimization
  - `"academic"` - Academic writing
  - `"custom"` - User-defined category

### template

- **Type**: `string`
- **Required**: Yes
- **Length**: 20-2000 characters
- **Requirements**: Must contain `{text}` placeholder
- **Example**: `"Please rewrite the following text in a professional email tone: {text}"`
- **Validation**: Must include exactly one `{text}` placeholder

## Version System

### Version Object Schema

```javascript
{
  "id": string,                          // Version identifier
  "version": number,                     // Version number (incremental)
  "content": string,                     // Template content at this version
  "changelog": string,                   // Description of changes
  "createdAt": number,                   // Version creation timestamp
  "createdBy": string,                   // Creator (user ID, "system", "migration")
  "metadata": {
    "contentLength": number,             // Character count
    "hasTextPlaceholder": boolean,       // Contains {text} placeholder
    "wordCount": number,                 // Word count
    "complexity": number                 // Complexity score (1-10)
  }
}
```

### Version Management Rules

1. **Version Numbers**: Start at 1, increment by 1
2. **Immutability**: Previous versions cannot be modified
3. **Rollback**: Can rollback to any previous version (creates new version)
4. **Cleanup**: Versions older than 90 days may be archived
5. **Limits**: Maximum 50 versions per template

## Template Categories

### Built-in Categories

#### general

- **Purpose**: Basic text improvement
- **Use Cases**: General enhancement, cleanup, clarity
- **Examples**: Grammar fixes, readability improvement

#### tone

- **Purpose**: Adjust text tone and style
- **Use Cases**: Professional, casual, formal, friendly
- **Examples**: Business tone, conversational style

#### business

- **Purpose**: Business communication
- **Use Cases**: Emails, proposals, reports, presentations
- **Examples**: Meeting notes, project updates

#### creative

- **Purpose**: Creative writing assistance
- **Use Cases**: Stories, poetry, marketing copy
- **Examples**: Character development, plot enhancement

#### technical

- **Purpose**: Technical documentation
- **Use Cases**: API docs, user guides, specifications
- **Examples**: Code documentation, troubleshooting guides

#### social

- **Purpose**: Social media optimization
- **Use Cases**: Posts, tweets, captions
- **Examples**: Engagement optimization, hashtag suggestions

#### academic

- **Purpose**: Academic writing
- **Use Cases**: Papers, research, citations
- **Examples**: Thesis writing, literature reviews

### Custom Categories

Users can create custom categories:

- **Format**: Lowercase, alphanumeric, hyphens allowed
- **Length**: 3-20 characters
- **Examples**: `"marketing"`, `"legal-docs"`, `"personal"`

## Validation Rules

### Template Content Validation

```javascript
const templateValidation = {
  // Required placeholder
  textPlaceholder: {
    required: true,
    pattern: /\{text\}/,
    count: { min: 1, max: 1 }
  },
  
  // Content length
  length: {
    min: 20,
    max: 2000
  },
  
  // Prohibited content
  prohibited: [
    /\{(?!text\})/,  // Other placeholders not allowed
    /<script/i,      // No script tags
    /javascript:/i   // No javascript: URLs
  ],
  
  // Quality checks
  quality: {
    minWords: 5,
    maxRepeatedWords: 3,
    requiresInstruction: true
  }
}
```

### Name and Description Validation

```javascript
const metadataValidation = {
  name: {
    length: { min: 1, max: 100 },
    pattern: /^[a-zA-Z0-9\s\-_()]+$/,
    prohibited: ['untitled', 'new template', 'template']
  },
  
  description: {
    length: { min: 10, max: 500 },
    requiresPurpose: true,
    requiresUsage: true
  },
  
  category: {
    enum: ['general', 'tone', 'business', 'creative', 'technical', 'social', 'academic', 'custom'],
    customPattern: /^[a-z0-9-]{3,20}$/
  }
}
```

## Built-in Templates

### Default Template Set

#### General Improvement

```javascript
{
  "id": "general-improvement",
  "name": "General Improvement",
  "description": "Enhances text clarity, grammar, and readability while maintaining the original tone and meaning",
  "category": "general",
  "template": "Please improve and optimize the following text while maintaining its original meaning and tone:\n\n{text}",
  "isDefault": true,
  "config": {
    "maxTokens": 1000,
    "temperature": 0.7,
    "preferredProviders": ["openai", "anthropic"]
  }
}
```

#### Professional Tone

```javascript
{
  "id": "professional-tone",
  "name": "Professional Tone",
  "description": "Converts text to a professional, business-appropriate tone suitable for workplace communication",
  "category": "tone",
  "template": "Please rewrite the following text in a professional, business-appropriate tone:\n\n{text}",
  "isDefault": true,
  "config": {
    "maxTokens": 800,
    "temperature": 0.5,
    "preferredProviders": ["anthropic", "openai"]
  }
}
```

#### Grammar Check

```javascript
{
  "id": "grammar-check",
  "name": "Grammar Check",
  "description": "Fixes grammar, spelling, and punctuation errors while preserving the original meaning and style",
  "category": "general",
  "template": "Please correct any grammar, spelling, and punctuation errors in the following text while preserving its original meaning and style:\n\n{text}",
  "isDefault": true,
  "config": {
    "maxTokens": 600,
    "temperature": 0.3,
    "preferredProviders": ["openai", "anthropic"]
  }
}
```

## Template Testing Schema

### Test Configuration

```javascript
{
  "testTypes": Array<string>,            // Types of tests to run
  "provider": string,                    // AI provider for testing
  "providerConfig": Object,              // Provider configuration
  "testSamples": Array<string>,          // Sample texts for testing
  "expectedOutcomes": Array<Object>,     // Expected results
  "qualityThresholds": {
    "minScore": number,                  // Minimum passing score
    "maxResponseTime": number,           // Maximum response time (ms)
    "minSuccessRate": number             // Minimum success rate
  }
}
```

### Test Types

#### validation

- **Purpose**: Validate template syntax and structure
- **Checks**: Placeholder presence, content length, prohibited patterns
- **Score**: Pass/fail (100 or 0)

#### structure

- **Purpose**: Analyze template structure and quality
- **Checks**: Instruction clarity, specificity, completeness
- **Score**: 0-100 based on quality metrics

#### performance

- **Purpose**: Test API performance with template
- **Checks**: Response time, success rate, token usage
- **Score**: 0-100 based on performance metrics

#### quality

- **Purpose**: Evaluate output quality with sample inputs
- **Checks**: Output relevance, improvement, consistency
- **Score**: 0-100 based on quality assessment

### Test Results Schema

```javascript
{
  "overallScore": number,                // Overall test score (0-100)
  "passed": boolean,                     // Overall pass/fail status
  "testDate": number,                    // Test execution timestamp
  "duration": number,                    // Total test duration (ms)
  "tests": [
    {
      "testName": string,                // Test type name
      "passed": boolean,                 // Test pass/fail
      "score": number,                   // Test score (0-100)
      "duration": number,                // Test duration (ms)
      "details": Object,                 // Test-specific details
      "errors": Array<string>            // Error messages if any
    }
  ],
  "recommendations": Array<string>       // Improvement recommendations
}
```

## Import/Export Schema

### Export Format

```javascript
{
  "version": "2.0",                      // Export format version
  "exportDate": number,                  // Export timestamp
  "source": "PromptBoost",               // Source application
  "templates": Array<TemplateObject>,    // Template objects
  "metadata": {
    "totalTemplates": number,            // Number of templates
    "categories": Array<string>,         // Unique categories
    "customCategories": Array<string>,   // Custom categories only
    "exportedBy": string                 // User identifier
  }
}
```

### Import Validation

```javascript
const importValidation = {
  // Format validation
  version: { required: true, supported: ["1.0", "2.0"] },
  templates: { required: true, type: "array", minLength: 1 },
  
  // Content validation
  templateValidation: {
    validateEach: true,
    requireUniqueIds: true,
    allowOverwrite: false  // Configurable
  },
  
  // Safety checks
  maxTemplates: 100,       // Maximum templates per import
  maxFileSize: "1MB",      // Maximum file size
  virusScan: true          // Scan for malicious content
}
```

## Migration Schema

### Template Migration Rules

```javascript
const migrationRules = {
  "1.0_to_2.0": {
    "addFields": [
      { "path": "versions", "default": [] },
      { "path": "metadata.performance", "default": {} },
      { "path": "config", "default": {} }
    ],
    "transformFields": [
      { "from": "prompt", "to": "template" },
      { "from": "type", "to": "category" }
    ],
    "removeFields": ["deprecated", "legacy"]
  }
}
```

## Usage Examples

### Creating a Custom Template

```javascript
const customTemplate = {
  id: "meeting-notes-formatter",
  name: "Meeting Notes Formatter",
  description: "Converts rough meeting notes into structured, professional meeting minutes with clear action items",
  category: "business",
  template: "Please convert these rough meeting notes into well-structured, professional meeting minutes with clear sections for attendees, agenda items, decisions made, and action items:\n\n{text}",
  version: 1,
  isDefault: false,
  isCustom: true,
  isActive: true,
  createdAt: Date.now(),
  updatedAt: Date.now(),
  metadata: {
    usage: 0,
    lastUsed: null,
    performance: {
      averageResponseTime: 0,
      successRate: 100,
      totalRequests: 0,
      failedRequests: 0
    }
  },
  config: {
    maxTokens: 1500,
    temperature: 0.4,
    preferredProviders: ["anthropic", "openai"],
    tags: ["meetings", "business", "notes", "formatting"]
  }
};
```

### Template Testing Configuration

```javascript
const testConfig = {
  testTypes: ["validation", "structure", "performance"],
  provider: "openai",
  providerConfig: {
    apiKey: "sk-...",
    model: "gpt-3.5-turbo"
  },
  testSamples: [
    "rough meeting notes here",
    "another sample text",
    "third test case"
  ],
  qualityThresholds: {
    minScore: 80,
    maxResponseTime: 5000,
    minSuccessRate: 95
  }
};
```

For implementation details, see:

- [Template Management Guide](../guides/templates.md)
- [Services API](../api/services.md)
- [User Manual](../guides/user-manual.md)
