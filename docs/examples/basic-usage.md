# Basic Usage Examples

This guide provides practical examples of how to use PromptBoost for common text optimization scenarios.

## Getting Started Examples

### Example 1: Email Enhancement

**Scenario**: Converting casual text to professional email format

**Original Text**:

```
hey john, can u send me the report asap? need it for the meeting tomorrow. thx
```

**Steps**:

1. Select the text in your email client
2. Press spacebar 3 times quickly
3. Choose "Professional Tone" template (or use default)

**Result**:

```
Hello John,

Could you please send me the report as soon as possible? I need it for tomorrow's meeting.

Thank you for your assistance.
```

### Example 2: Social Media Post

**Scenario**: Optimizing a social media post for better engagement

**Original Text**:

```
just finished my workout feeling great gonna eat some food now
```

**Steps**:

1. Select text in your social media platform
2. Press Ctrl+Shift+T to open template selector
3. Choose "Social Media" template

**Result**:

```
Just crushed my workout and feeling amazing! 💪 Time to refuel with some delicious food. What's your favorite post-workout meal? #fitness #workout #motivation
```

### Example 3: Document Writing

**Scenario**: Improving academic or professional writing

**Original Text**:

```
The meeting went ok. We talked about stuff and made some decisions about the project.
```

**Steps**:

1. Select text in Google Docs or Word
2. Right-click and select "PromptBoost"
3. Choose "Academic Tone" or "Professional Tone"

**Result**:

```
The meeting proceeded successfully and yielded productive discussions. We addressed key project components and reached several important strategic decisions regarding project implementation and timeline.
```

## Common Use Cases

### Business Communication

#### Meeting Notes

**Before**:

```
- talked about budget
- john said we need more money
- sarah disagrees
- need to decide by friday
```

**Template**: "Meeting Notes Formatter" (custom template)
**After**:

```
Meeting Summary:
• Budget Discussion: Team reviewed current budget allocation
• Concerns Raised: John highlighted need for additional funding
• Alternative Perspective: Sarah presented cost-saving alternatives
• Action Item: Final budget decision required by Friday
```

#### Project Updates

**Before**:

```
project is going good, finished most of the work, few things left to do
```

**Template**: "Professional Tone"
**After**:

```
The project is progressing well with the majority of deliverables completed. We have a few remaining tasks to finalize before project completion.
```

### Content Creation

#### Blog Post Introduction

**Before**:

```
today i want to talk about productivity tips that actually work
```

**Template**: "Creative Writing"
**After**:

```
In today's fast-paced world, discovering productivity strategies that deliver real results can be transformative. Let's explore proven techniques that can revolutionize your daily workflow and help you achieve more meaningful outcomes.
```

#### Product Description

**Before**:

```
this phone is really good has nice camera and battery lasts long
```

**Template**: "Marketing Copy" (custom template)
**After**:

```
Experience exceptional mobile technology with this premium smartphone featuring an advanced camera system that captures stunning photos and an extended-life battery that keeps you connected throughout your busiest days.
```

### Academic Writing

#### Research Summary

**Before**:

```
the study shows that people who exercise are happier than people who dont
```

**Template**: "Academic Tone"
**After**:

```
The research findings demonstrate a significant positive correlation between regular physical exercise and reported levels of psychological well-being, with active individuals showing measurably higher happiness indices compared to sedentary control groups.
```

#### Thesis Statement

**Before**:

```
i think social media affects how teenagers think about themselves
```

**Template**: "Academic Tone"
**After**:

```
This research examines the significant impact of social media platforms on adolescent self-perception and identity formation, analyzing how digital interactions influence teenage psychological development and self-esteem.
```

## Platform-Specific Examples

### Gmail

**Configuration**:

```javascript
// Per-page settings for Gmail
{
  "domain": "gmail.com",
  "defaultTemplate": "email-enhancement",
  "temperature": 0.3,  // More conservative for professional emails
  "maxTokens": 800
}
```

**Example Usage**:

1. Compose new email
2. Type casual message
3. Select text and use triple spacebar
4. Automatically uses email-optimized template

### Twitter/X

**Configuration**:

```javascript
// Per-page settings for Twitter
{
  "domain": "twitter.com",
  "defaultTemplate": "social-media",
  "maxTokens": 280,  // Respect character limit
  "temperature": 0.6
}
```

**Example**:
**Before**: "working on new project excited to share soon"
**After**: "Excited to share updates on my latest project! Big things coming soon 🚀 #innovation #project #excited"

### Google Docs

**Configuration**:

```javascript
// Per-page settings for Google Docs
{
  "domain": "docs.google.com",
  "defaultTemplate": "academic-tone",
  "maxTokens": 2000,  // Longer documents
  "temperature": 0.4
}
```

**Usage Pattern**:

1. Write rough draft
2. Select paragraphs one by one
3. Use PromptBoost to refine each section
4. Maintain consistent academic tone throughout

### Slack

**Configuration**:

```javascript
// Per-page settings for Slack
{
  "domain": "slack.com",
  "defaultTemplate": "casual-tone",
  "temperature": 0.7,  // More conversational
  "maxTokens": 500
}
```

**Example**:
**Before**: "can someone help me with this bug its really annoying"
**After**: "Hey team! Could someone help me troubleshoot this bug? It's been quite persistent and I'd appreciate a fresh perspective 🤔"

## Keyboard Shortcuts Examples

### Quick Optimization Workflow

```
1. Select text: "need help with this asap"
2. Press Ctrl+Shift+Space (quick optimize)
3. Result: "I need assistance with this as soon as possible"
```

### Template Selection Workflow

```
1. Select text: "meeting went well"
2. Press Ctrl+Shift+T (template selector)
3. Choose from available templates:
   - General Improvement
   - Professional Tone
   - Meeting Notes
4. Select "Professional Tone"
5. Result: "The meeting proceeded successfully"
```

### Undo Workflow

```
1. Optimize text with PromptBoost
2. Review result
3. If not satisfied, press Ctrl+Z within 30 seconds
4. Original text is restored
5. Try different template or approach
```

## Context Menu Examples

### Right-Click Workflow

1. **Select text**: "thanks for the help"
2. **Right-click** on selected text
3. **Choose "PromptBoost"** from context menu
4. **Select optimization option**:
   - Quick Optimize (uses default template)
   - Professional Tone
   - Casual Tone
   - Grammar Check
   - Custom templates...

### Context Menu with Templates

The context menu shows:

```
PromptBoost
├── Quick Optimize
├── ─────────────
├── Professional Tone
├── Casual Tone
├── Grammar Check
├── Email Enhancement
├── ─────────────
├── Recent Templates
│   ├── Meeting Notes
│   └── Social Media
├── ─────────────
├── More Templates...
└── Settings
```

## Error Handling Examples

### Common Error Scenarios

#### No Text Selected

**Error**: "Please select some text first"
**Solution**:

```
1. Highlight text with mouse
2. Ensure text is actually selected (appears highlighted)
3. Try optimization again
```

#### Text Too Long

**Error**: "Text too long (maximum 10,000 characters)"
**Solution**:

```
1. Select smaller portion of text
2. Break large text into smaller chunks
3. Optimize each chunk separately
```

#### API Key Issues

**Error**: "API key not configured" or "API request failed: 401"
**Solution**:

```
1. Open PromptBoost settings
2. Verify API key is entered correctly
3. Test API connection
4. Check API key hasn't expired
```

### Recovery Strategies

#### When Optimization Fails

```
1. Check internet connection
2. Try different AI provider
3. Use simpler template
4. Reduce text length
5. Check API quota/credits
```

#### When Results Are Poor

```
1. Try different template
2. Adjust temperature setting
3. Use more specific template
4. Break text into smaller parts
5. Add more context to selection
```

## Performance Tips

### Optimizing for Speed

1. **Use faster models**: GPT-3.5 Turbo vs GPT-4
2. **Reduce max tokens**: Lower token limits = faster responses
3. **Choose appropriate templates**: Simpler templates process faster
4. **Batch similar optimizations**: Use same template for similar text

### Optimizing for Quality

1. **Use higher-quality models**: GPT-4, Claude 3 Opus
2. **Increase max tokens**: Allow longer, more detailed responses
3. **Lower temperature**: More consistent, focused results
4. **Use specific templates**: Tailored templates for specific use cases

### Optimizing for Cost

1. **Use cheaper models**: GPT-3.5 Turbo, Claude 3 Haiku
2. **Reduce max tokens**: Lower token usage
3. **Optimize templates**: More efficient prompts
4. **Monitor usage**: Track API costs in provider dashboard

## Best Practices

### Text Selection

- **Select complete thoughts**: Full sentences work better than fragments
- **Include context**: Select enough text to provide context
- **Avoid partial words**: Don't cut off words in the middle
- **Consider formatting**: Some formatting may be lost

### Template Usage

- **Match template to purpose**: Use appropriate template for your goal
- **Start with built-in templates**: Learn from proven templates
- **Create custom templates**: For recurring specific needs
- **Test templates**: Verify templates work as expected

### Review and Editing

- **Always review results**: AI isn't perfect, check the output
- **Make manual adjustments**: Fine-tune as needed
- **Learn from results**: Improve your template selection over time
- **Use undo feature**: Don't hesitate to undo and try again

For more advanced examples, see:

- [Template Examples](templates.md)
- [Provider Integration Examples](providers.md)
- [Development Examples](development.md)
