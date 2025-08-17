# Template Management Guide

Templates are the heart of PromptBoost, allowing you to customize how AI optimizes your text for different purposes. This guide covers everything you need to know about creating, managing, and using templates effectively.

## Table of Contents

- [Understanding Templates](#understanding-templates)
- [Built-in Templates](#built-in-templates)
- [Creating Custom Templates](#creating-custom-templates)
- [Template Management](#template-management)
- [Advanced Features](#advanced-features)
- [Best Practices](#best-practices)

## Understanding Templates

### What Are Templates?

Templates are pre-written prompts that tell the AI how to optimize your text. They contain:
- **Instructions** for the AI on what to do
- **Context** about the desired output style
- **Placeholder** `{text}` where your selected text is inserted

### Template Structure

```
Template Name: Professional Email
Description: Converts casual text into professional email format
Category: Business
Template: Please rewrite the following text as a professional email while maintaining the core message: {text}
```

### How Templates Work

1. You select text: "hey can u send me the report"
2. Template processes it: "Please rewrite the following text as a professional email while maintaining the core message: hey can u send me the report"
3. AI returns: "Could you please send me the report at your earliest convenience?"

## Built-in Templates

PromptBoost comes with carefully crafted templates for common use cases:

### General Templates

#### General Improvement
- **Purpose**: Enhance text while maintaining original tone
- **Best For**: Any text that needs general improvement
- **Example**: "make it better" → "Please improve this"

#### Grammar Check
- **Purpose**: Fix grammar and spelling errors only
- **Best For**: Text that's good but has errors
- **Example**: "there going to the store" → "They're going to the store"

#### Summarize
- **Purpose**: Create concise summaries
- **Best For**: Long text that needs to be shortened
- **Example**: Long paragraph → Key points in 1-2 sentences

### Tone Templates

#### Professional Tone
- **Purpose**: Make text more formal and business-appropriate
- **Best For**: Business communication, formal documents
- **Example**: "hey boss" → "Hello [Name]"

#### Casual Tone
- **Purpose**: Make text more conversational and friendly
- **Best For**: Social media, informal communication
- **Example**: "I am writing to inform you" → "Just wanted to let you know"

#### Academic Tone
- **Purpose**: Enhance text for academic writing
- **Best For**: Research papers, academic documents
- **Example**: "I think" → "The evidence suggests"

### Specialized Templates

#### Email Enhancement
- **Purpose**: Optimize text specifically for email communication
- **Best For**: Email drafts, professional correspondence
- **Features**: Adds proper greetings, structure, politeness

#### Social Media
- **Purpose**: Optimize for social media platforms
- **Best For**: Twitter, Facebook, LinkedIn posts
- **Features**: Hashtag suggestions, engagement optimization

#### Technical Writing
- **Purpose**: Improve technical documentation
- **Best For**: Documentation, technical guides, API docs
- **Features**: Clarity, precision, technical accuracy

## Creating Custom Templates

### Template Creation Process

1. **Open Settings** → Templates tab
2. **Click "Create New Template"**
3. **Fill in template details**
4. **Test your template**
5. **Save and organize**

### Template Fields

#### Basic Information
- **Name**: Descriptive name (e.g., "Meeting Notes Formatter")
- **Description**: What the template does and when to use it
- **Category**: Organize templates (General, Business, Creative, etc.)

#### Template Content
- **Template**: The actual prompt with `{text}` placeholder
- **Must include**: `{text}` placeholder where selected text will be inserted
- **Should be**: Clear, specific instructions for the AI

### Example Custom Templates

#### Meeting Notes Template
```
Name: Meeting Notes Formatter
Description: Converts rough meeting notes into structured format
Category: Business
Template: Please convert these rough meeting notes into well-structured, professional meeting minutes with clear action items and decisions: {text}
```

#### Social Media Thread Template
```
Name: Twitter Thread Creator
Description: Converts long text into Twitter thread format
Category: Social Media
Template: Please break down this text into a Twitter thread format with numbered tweets, each under 280 characters, maintaining the key points: {text}
```

#### Code Documentation Template
```
Name: Code Documentation
Description: Improves technical documentation for code
Category: Technical
Template: Please improve this code documentation to be clearer, more comprehensive, and follow best practices for technical writing: {text}
```

#### Creative Writing Template
```
Name: Story Enhancer
Description: Enhances creative writing with better descriptions and flow
Category: Creative
Template: Please enhance this creative writing by improving descriptions, dialogue, and narrative flow while maintaining the original story and voice: {text}
```

### Template Writing Tips

#### Be Specific
- **Good**: "Rewrite this as a professional email with proper greeting and closing"
- **Bad**: "Make this better"

#### Include Context
- **Good**: "Convert this casual message into a formal business proposal suitable for executives"
- **Bad**: "Make this formal"

#### Set Expectations
- **Good**: "Summarize this in exactly 2 sentences, focusing on the main conclusion"
- **Bad**: "Summarize this"

#### Use Examples (Optional)
```
Template: Please rewrite this text in a more professional tone. For example, change "hey" to "hello" and "u" to "you": {text}
```

## Template Management

### Organizing Templates

#### Categories
Organize templates into logical categories:
- **General**: Basic text improvement
- **Business**: Professional communication
- **Creative**: Creative writing assistance
- **Technical**: Technical documentation
- **Personal**: Personal use templates
- **Custom**: Your specific templates

#### Naming Conventions
Use clear, descriptive names:
- **Good**: "Email - Professional Response"
- **Good**: "Social - LinkedIn Post"
- **Bad**: "Template 1"
- **Bad**: "My Template"

### Template Operations

#### Editing Templates
1. **Go to Settings** → Templates
2. **Find your template** in the list
3. **Click "Edit"**
4. **Make changes** and test
5. **Save updates**

#### Duplicating Templates
1. **Find template** to duplicate
2. **Click "Duplicate"**
3. **Modify** the copy as needed
4. **Save** with new name

#### Deleting Templates
1. **Find template** to delete
2. **Click "Delete"**
3. **Confirm deletion**
- **Note**: Built-in templates cannot be deleted, only disabled

### Template Testing

#### Built-in Testing
1. **Open template editor**
2. **Enter sample text** in test field
3. **Click "Test Template"**
4. **Review results**
5. **Adjust template** if needed

#### Real-world Testing
1. **Save template**
2. **Test on actual content**
3. **Note any issues**
4. **Refine template**
5. **Test again**

## Advanced Features

### Template Versioning

PromptBoost automatically tracks template versions:
- **Version History**: See all changes to templates
- **Rollback**: Revert to previous versions
- **Change Tracking**: See what changed between versions

#### Accessing Version History
1. **Open template editor**
2. **Click "Version History"**
3. **Browse previous versions**
4. **Compare changes**
5. **Rollback if needed**

### Template Analytics

Track how your templates perform:
- **Usage Count**: How often each template is used
- **Success Rate**: How often optimizations succeed
- **Average Response Time**: How long API calls take
- **User Ratings**: Rate template results

#### Viewing Analytics
1. **Go to Settings** → Templates → Analytics
2. **Select template** to analyze
3. **Review performance metrics**
4. **Identify improvement opportunities**

### Template Sharing

#### Exporting Templates
1. **Select templates** to export
2. **Click "Export Templates"**
3. **Save JSON file**
4. **Share with others**

#### Importing Templates
1. **Click "Import Templates"**
2. **Select JSON file**
3. **Choose import options**
4. **Review and confirm**

### Template Collections

Create collections of related templates:
- **Email Collection**: All email-related templates
- **Social Media Collection**: Templates for different platforms
- **Writing Collection**: Creative and academic writing templates

## Best Practices

### Template Design

#### Start Simple
- Begin with basic templates
- Add complexity gradually
- Test thoroughly before using

#### Be Consistent
- Use similar language across related templates
- Follow naming conventions
- Maintain consistent categories

#### Focus on Purpose
- Each template should have a clear, specific purpose
- Avoid trying to do too much in one template
- Create specialized templates for specific needs

### Template Usage

#### Choose the Right Template
- Match template to your specific need
- Consider your audience and context
- Don't force a template if it doesn't fit

#### Review Results
- Always review AI-generated text
- Make manual adjustments if needed
- Learn from results to improve templates

#### Iterate and Improve
- Refine templates based on results
- Create variations for different contexts
- Remove templates that don't work well

### Organization

#### Regular Maintenance
- Review templates monthly
- Remove unused templates
- Update templates based on new needs
- Organize templates logically

#### Documentation
- Write clear descriptions
- Include usage examples
- Document any special considerations
- Share knowledge with team members

### Performance Optimization

#### Template Efficiency
- Keep templates concise but clear
- Avoid unnecessary complexity
- Test with different text lengths
- Monitor response times

#### API Usage
- Consider token usage in template design
- Balance quality with cost
- Use appropriate models for different templates
- Monitor API usage patterns

## Troubleshooting Templates

### Common Issues

#### Template Not Working
- Check for `{text}` placeholder
- Verify template syntax
- Test with simple text first
- Check API connection

#### Poor Results
- Make template more specific
- Add examples or context
- Adjust temperature settings
- Try different AI models

#### Template Not Appearing
- Check template category
- Verify template is enabled
- Refresh template list
- Check for naming conflicts

### Getting Help

- **Test with Built-in Templates**: Compare with working templates
- **Use Template Tester**: Built-in testing tools
- **Check Examples**: Look at successful template examples
- **Community**: Share templates and get feedback

For more help, see the [Troubleshooting Guide](troubleshooting.md) or [User Manual](user-manual.md).
