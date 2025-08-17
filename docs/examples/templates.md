# Template Creation Examples

This guide provides practical examples of creating custom templates for various use cases, from simple text improvements to complex specialized workflows.

## Basic Template Examples

### Simple Grammar Checker

**Use Case**: Fix grammar and spelling errors only

```javascript
{
  "name": "Grammar Fix Only",
  "description": "Corrects grammar and spelling while preserving original style and tone",
  "category": "general",
  "template": "Please fix any grammar, spelling, and punctuation errors in the following text. Do not change the tone, style, or meaning:\n\n{text}"
}
```

**Example Usage**:
- **Input**: "there going to the store tommorow"
- **Output**: "They're going to the store tomorrow"

### Text Summarizer

**Use Case**: Create concise summaries

```javascript
{
  "name": "Text Summarizer",
  "description": "Creates a concise summary highlighting the main points",
  "category": "general",
  "template": "Please create a concise summary of the following text, highlighting the main points in 2-3 sentences:\n\n{text}"
}
```

**Example Usage**:
- **Input**: Long paragraph about project status
- **Output**: "Project is 75% complete with database integration finished. Frontend development is on track for next week. Final testing scheduled for month-end."

## Business Templates

### Meeting Minutes Formatter

**Use Case**: Convert rough notes into structured meeting minutes

```javascript
{
  "name": "Meeting Minutes Formatter",
  "description": "Converts rough meeting notes into professional, structured meeting minutes",
  "category": "business",
  "template": "Please convert these rough meeting notes into well-structured, professional meeting minutes. Include sections for: Attendees, Agenda Items Discussed, Decisions Made, and Action Items with owners and deadlines where mentioned:\n\n{text}"
}
```

**Example Usage**:
- **Input**: "john, sarah, mike present. talked about budget - need 50k more. sarah will check with finance by friday. mike concerned about timeline."
- **Output**: 
```
Meeting Minutes

Attendees: John, Sarah, Mike

Agenda Items Discussed:
• Budget requirements and funding needs

Decisions Made:
• Additional funding requirement identified: $50,000

Action Items:
• Sarah: Consult with finance department regarding budget increase (Due: Friday)
• Mike: Address timeline concerns (Follow-up needed)
```

### Email Response Generator

**Use Case**: Create professional email responses

```javascript
{
  "name": "Professional Email Response",
  "description": "Converts brief notes into professional email responses with proper structure",
  "category": "business",
  "template": "Please convert the following notes into a professional email response. Include appropriate greeting, clear main content, and professional closing:\n\n{text}"
}
```

**Example Usage**:
- **Input**: "thanks for the proposal. looks good but need to discuss pricing. can we meet next week?"
- **Output**:
```
Dear [Name],

Thank you for submitting the proposal. I've had a chance to review it, and overall it looks very promising.

I would like to discuss the pricing structure in more detail to ensure it aligns with our budget parameters. Would you be available for a meeting next week to go over these details?

I look forward to hearing from you.

Best regards,
[Your name]
```

### Project Status Update

**Use Case**: Format project updates for stakeholders

```javascript
{
  "name": "Project Status Update",
  "description": "Formats project information into clear status updates for stakeholders",
  "category": "business",
  "template": "Please format this project information into a clear, professional status update suitable for stakeholders. Include sections for Progress, Challenges, Next Steps, and Timeline:\n\n{text}"
}
```

## Creative Writing Templates

### Story Enhancer

**Use Case**: Improve creative writing with better descriptions

```javascript
{
  "name": "Story Enhancer",
  "description": "Enhances creative writing by improving descriptions, dialogue, and narrative flow",
  "category": "creative",
  "template": "Please enhance this creative writing by improving descriptions, making dialogue more natural, and strengthening the narrative flow. Maintain the original story, characters, and voice:\n\n{text}"
}
```

**Example Usage**:
- **Input**: "The man walked into the room. It was dark. He was scared."
- **Output**: "The man hesitated at the threshold, his hand trembling on the cold doorknob. The room beyond lay shrouded in an oppressive darkness that seemed to swallow the faint light from the hallway. His heart hammered against his ribs as an inexplicable dread settled over him."

### Character Development

**Use Case**: Develop character descriptions and backgrounds

```javascript
{
  "name": "Character Developer",
  "description": "Expands basic character information into rich, detailed character profiles",
  "category": "creative",
  "template": "Please expand this basic character information into a rich, detailed character profile. Include physical description, personality traits, background, motivations, and potential character arc:\n\n{text}"
}
```

### Dialogue Improver

**Use Case**: Make dialogue more natural and engaging

```javascript
{
  "name": "Dialogue Enhancer",
  "description": "Improves dialogue to make it more natural, engaging, and character-appropriate",
  "category": "creative",
  "template": "Please improve this dialogue to make it more natural, engaging, and true to the characters. Add subtext, improve pacing, and ensure each character has a distinct voice:\n\n{text}"
}
```

## Technical Writing Templates

### API Documentation

**Use Case**: Improve technical API documentation

```javascript
{
  "name": "API Documentation Enhancer",
  "description": "Improves API documentation for clarity, completeness, and developer-friendliness",
  "category": "technical",
  "template": "Please improve this API documentation to be clearer, more comprehensive, and developer-friendly. Include proper formatting, clear parameter descriptions, example requests/responses, and error handling information:\n\n{text}"
}
```

**Example Usage**:
- **Input**: "POST /users - creates user. needs name and email."
- **Output**:
```
## POST /users

Creates a new user account in the system.

### Parameters
- `name` (string, required): Full name of the user
- `email` (string, required): Valid email address for the user account

### Example Request
```json
{
  "name": "John Doe",
  "email": "john.doe@example.com"
}
```

### Example Response
```json
{
  "id": 123,
  "name": "John Doe",
  "email": "john.doe@example.com",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Error Responses
- `400 Bad Request`: Invalid input parameters
- `409 Conflict`: Email address already exists
```

### Code Comment Enhancer

**Use Case**: Improve code comments and documentation

```javascript
{
  "name": "Code Comment Enhancer",
  "description": "Improves code comments to be more descriptive, helpful, and maintainable",
  "category": "technical",
  "template": "Please improve these code comments to be more descriptive and helpful for other developers. Explain the 'why' not just the 'what', include any important context or gotchas:\n\n{text}"
}
```

### Troubleshooting Guide

**Use Case**: Create clear troubleshooting documentation

```javascript
{
  "name": "Troubleshooting Guide Creator",
  "description": "Converts problem descriptions into structured troubleshooting guides",
  "category": "technical",
  "template": "Please convert this problem description into a structured troubleshooting guide with clear steps, common causes, and solutions:\n\n{text}"
}
```

## Social Media Templates

### LinkedIn Post Optimizer

**Use Case**: Optimize posts for LinkedIn engagement

```javascript
{
  "name": "LinkedIn Post Optimizer",
  "description": "Optimizes content for LinkedIn with professional tone and engagement elements",
  "category": "social",
  "template": "Please optimize this content for LinkedIn. Make it professional yet engaging, add relevant hashtags, include a call-to-action, and format for maximum readability:\n\n{text}"
}
```

**Example Usage**:
- **Input**: "finished big project at work feeling proud"
- **Output**:
```
🎉 Just wrapped up a major project that's been months in the making!

There's nothing quite like the satisfaction of seeing a complex initiative come together through teamwork, persistence, and creative problem-solving.

Key takeaways from this experience:
✅ Clear communication is everything
✅ Small wins build momentum
✅ Great teams make impossible things possible

What's the most rewarding project you've completed recently? I'd love to hear about your wins in the comments! 👇

#ProjectManagement #Teamwork #ProfessionalGrowth #Success
```

### Twitter Thread Creator

**Use Case**: Convert long content into Twitter thread format

```javascript
{
  "name": "Twitter Thread Creator",
  "description": "Breaks down long content into engaging Twitter thread format with proper numbering",
  "category": "social",
  "template": "Please convert this content into a Twitter thread format. Break it into tweets under 280 characters each, number them (1/n format), make each tweet engaging, and include relevant hashtags:\n\n{text}"
}
```

### Instagram Caption Writer

**Use Case**: Create engaging Instagram captions

```javascript
{
  "name": "Instagram Caption Creator",
  "description": "Creates engaging Instagram captions with hooks, storytelling, and relevant hashtags",
  "category": "social",
  "template": "Please create an engaging Instagram caption from this content. Include a strong hook, tell a story, add relevant emojis, and include strategic hashtags for discovery:\n\n{text}"
}
```

## Academic Templates

### Research Paper Abstract

**Use Case**: Create academic abstracts from research summaries

```javascript
{
  "name": "Research Abstract Creator",
  "description": "Converts research summaries into properly formatted academic abstracts",
  "category": "academic",
  "template": "Please convert this research summary into a properly formatted academic abstract. Include background, methodology, key findings, and implications. Use formal academic language and structure:\n\n{text}"
}
```

### Literature Review Synthesizer

**Use Case**: Synthesize multiple sources into coherent literature review

```javascript
{
  "name": "Literature Review Synthesizer",
  "description": "Synthesizes information from multiple sources into coherent literature review sections",
  "category": "academic",
  "template": "Please synthesize this information from multiple sources into a coherent literature review section. Identify themes, compare findings, note gaps, and maintain proper academic tone:\n\n{text}"
}
```

### Citation Formatter

**Use Case**: Improve citation integration in academic writing

```javascript
{
  "name": "Citation Integrator",
  "description": "Improves how citations are integrated into academic writing for better flow",
  "category": "academic",
  "template": "Please improve how citations are integrated into this academic text. Make the writing flow naturally while properly attributing sources and maintaining scholarly tone:\n\n{text}"
}
```

## Specialized Templates

### Legal Document Simplifier

**Use Case**: Make legal language more accessible

```javascript
{
  "name": "Legal Language Simplifier",
  "description": "Converts complex legal language into plain English while maintaining accuracy",
  "category": "custom",
  "template": "Please rewrite this legal text in plain English that a general audience can understand. Maintain the legal accuracy but remove unnecessary jargon and complex sentence structures:\n\n{text}"
}
```

### Medical Information Translator

**Use Case**: Make medical information patient-friendly

```javascript
{
  "name": "Medical Information Translator",
  "description": "Converts medical jargon into patient-friendly language while maintaining accuracy",
  "category": "custom",
  "template": "Please translate this medical information into patient-friendly language. Remove jargon, explain medical terms, and make it accessible while maintaining medical accuracy:\n\n{text}"
}
```

### Recipe Formatter

**Use Case**: Format and improve recipe instructions

```javascript
{
  "name": "Recipe Formatter",
  "description": "Formats and improves recipe instructions for clarity and ease of following",
  "category": "custom",
  "template": "Please format and improve these recipe instructions. Make steps clear and sequential, specify measurements and timing, add helpful tips, and ensure easy-to-follow format:\n\n{text}"
}
```

## Advanced Template Techniques

### Multi-Step Templates

**Use Case**: Complex transformations requiring multiple steps

```javascript
{
  "name": "Comprehensive Editor",
  "description": "Performs comprehensive editing including grammar, style, tone, and structure",
  "category": "general",
  "template": "Please perform comprehensive editing on this text following these steps:\n1. Fix grammar, spelling, and punctuation\n2. Improve sentence structure and flow\n3. Enhance clarity and readability\n4. Maintain the original tone and meaning\n5. Ensure professional presentation\n\nText to edit:\n{text}"
}
```

### Conditional Templates

**Use Case**: Different approaches based on content type

```javascript
{
  "name": "Smart Content Optimizer",
  "description": "Optimizes content differently based on whether it's formal or casual",
  "category": "general",
  "template": "Please optimize this text. If it appears to be formal/business content, make it more professional and structured. If it appears to be casual/personal content, make it more engaging and conversational while improving clarity:\n\n{text}"
}
```

### Context-Aware Templates

**Use Case**: Templates that consider surrounding context

```javascript
{
  "name": "Context-Aware Improver",
  "description": "Improves text while considering its likely context and audience",
  "category": "general",
  "template": "Please improve this text by considering its likely context and intended audience. Adjust tone, formality, and style appropriately while enhancing clarity and impact:\n\n{text}"
}
```

## Template Testing Examples

### Testing a New Template

```javascript
// Test configuration
const testConfig = {
  templateId: "meeting-minutes-formatter",
  testSamples: [
    "john sarah mike present talked budget need 50k sarah check finance friday",
    "discussed project timeline behind schedule need extra resources",
    "quarterly review went well sales up 15% marketing budget approved"
  ],
  expectedOutcomes: [
    "Should format as structured meeting minutes",
    "Should identify action items and owners",
    "Should use professional language"
  ]
};

// Run test
const results = await templateManager.testTemplate(testConfig);
```

### Template Performance Optimization

```javascript
// Before optimization
{
  "template": "Please take this text and make it better by improving the grammar and making it sound more professional and also fix any spelling errors and make sure the tone is appropriate for business communication: {text}"
}

// After optimization
{
  "template": "Please improve this text for business communication by:\n1. Correcting grammar and spelling\n2. Enhancing professional tone\n3. Ensuring clarity and conciseness\n\n{text}"
}
```

## Best Practices for Template Creation

### Template Writing Guidelines

1. **Be Specific**: Clear instructions produce better results
2. **Use Structure**: Numbered lists or bullet points for complex tasks
3. **Set Context**: Explain the purpose and audience
4. **Include Examples**: When helpful, provide examples in the template
5. **Test Thoroughly**: Test with various input types

### Template Organization

1. **Descriptive Names**: Use clear, searchable names
2. **Detailed Descriptions**: Explain when and how to use the template
3. **Appropriate Categories**: Choose the right category for discoverability
4. **Consistent Style**: Maintain consistent formatting across templates

### Template Maintenance

1. **Regular Testing**: Periodically test templates with new content
2. **Performance Monitoring**: Track success rates and response times
3. **User Feedback**: Collect and incorporate user feedback
4. **Version Control**: Use template versioning for improvements

For more examples, see:
- [Basic Usage Examples](basic-usage.md)
- [Provider Integration Examples](providers.md)
- [Development Examples](development.md)
