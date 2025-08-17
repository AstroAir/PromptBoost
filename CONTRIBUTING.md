# Contributing to PromptBoost

Thank you for your interest in contributing to PromptBoost! This document provides guidelines and information for contributors.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [Contributing Guidelines](#contributing-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing Requirements](#testing-requirements)
- [Code Style Guidelines](#code-style-guidelines)
- [Documentation Standards](#documentation-standards)

## Code of Conduct

This project adheres to a code of conduct that we expect all contributors to follow:

- **Be respectful**: Treat all community members with respect and kindness
- **Be inclusive**: Welcome newcomers and help them get started
- **Be constructive**: Provide helpful feedback and suggestions
- **Be collaborative**: Work together to improve the project
- **Be patient**: Remember that everyone has different experience levels

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- Chrome or Chromium-based browser for testing
- Git for version control
- Text editor or IDE with JavaScript support

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/your-username/promptboost.git
   cd promptboost
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Load Extension in Browser**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode"
   - Click "Load unpacked" and select the project directory

4. **Run Tests**
   ```bash
   npm test
   ```

## Contributing Guidelines

### Types of Contributions

We welcome various types of contributions:

- **Bug Reports**: Help us identify and fix issues
- **Feature Requests**: Suggest new functionality
- **Code Contributions**: Implement features or fix bugs
- **Documentation**: Improve or add documentation
- **Testing**: Add or improve test coverage
- **UI/UX Improvements**: Enhance user experience

### Before You Start

1. **Check Existing Issues**: Look for existing issues or discussions
2. **Create an Issue**: For significant changes, create an issue first
3. **Discuss Approach**: Get feedback on your proposed solution
4. **Assign Yourself**: Assign the issue to yourself when ready to work

### Branch Naming Convention

Use descriptive branch names with prefixes:
- `feature/description` - New features
- `bugfix/description` - Bug fixes
- `docs/description` - Documentation updates
- `test/description` - Test improvements
- `refactor/description` - Code refactoring

Examples:
- `feature/anthropic-claude-support`
- `bugfix/spacebar-detection-timing`
- `docs/api-documentation-update`

## Pull Request Process

### 1. Preparation
- Ensure your branch is up to date with main
- Run all tests and ensure they pass
- Update documentation if needed
- Add tests for new functionality

### 2. Creating the Pull Request
- Use a clear, descriptive title
- Provide detailed description of changes
- Reference related issues using `#issue-number`
- Include screenshots for UI changes
- Mark as draft if work is in progress

### 3. Pull Request Template
```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement
- [ ] Code refactoring

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] Manual testing completed
- [ ] New tests added (if applicable)

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No breaking changes (or clearly documented)
```

### 4. Review Process
- Maintainers will review your PR
- Address feedback promptly
- Keep discussions constructive
- Be open to suggestions and changes

## Testing Requirements

### Unit Tests
- Write unit tests for all new functions and methods
- Maintain minimum 80% code coverage
- Test both success and error scenarios
- Use descriptive test names

### Integration Tests
- Add integration tests for new user workflows
- Test cross-component communication
- Verify end-to-end functionality

### Manual Testing
- Test in multiple browsers (Chrome, Edge, Firefox)
- Verify functionality on different websites
- Test with various text types and lengths
- Validate error handling and edge cases

### Running Tests
```bash
# Run all tests
npm test

# Run specific test types
npm run test:unit
npm run test:integration

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

## Code Style Guidelines

### JavaScript Standards
- Use ES6+ features where appropriate
- Follow consistent naming conventions
- Use meaningful variable and function names
- Keep functions small and focused
- Add JSDoc comments for all public methods

### Code Formatting
- Use 2 spaces for indentation
- Use semicolons consistently
- Use single quotes for strings
- Keep lines under 100 characters
- Use trailing commas in objects and arrays

### ESLint Configuration
The project uses ESLint for code quality:
```bash
# Check code style
npm run lint

# Fix auto-fixable issues
npm run lint:fix
```

### Example Code Style
```javascript
/**
 * Optimizes text using the specified template.
 * @param {string} text - The text to optimize
 * @param {string} templateId - The template ID to use
 * @returns {Promise<string>} The optimized text
 */
async function optimizeWithTemplate(text, templateId) {
  if (!text || !templateId) {
    throw new Error('Text and template ID are required');
  }
  
  const template = await getTemplate(templateId);
  return await callLLMAPI(text, template);
}
```

## Documentation Standards

### JSDoc Comments
- Document all public methods and classes
- Include parameter types and descriptions
- Specify return types and values
- Add usage examples for complex functions
- Use `@since` tags for version tracking

### README Updates
- Update relevant README files for new features
- Include usage examples and screenshots
- Document configuration options
- Update troubleshooting sections

### Code Comments
- Explain complex logic and algorithms
- Document workarounds and browser-specific code
- Use TODO comments for future improvements
- Keep comments up to date with code changes

## Specific Contribution Areas

### Adding LLM Providers
1. Update `background.js` with new provider logic
2. Add provider-specific API call method
3. Update options page with provider configuration
4. Add comprehensive tests
5. Update documentation

### Creating New Templates
1. Add template to default templates in `background.js`
2. Update template management UI
3. Add template validation
4. Include usage examples
5. Test with various text types

### UI/UX Improvements
1. Follow existing design patterns
2. Ensure accessibility compliance
3. Test across different screen sizes
4. Maintain browser compatibility
5. Update relevant documentation

### Performance Optimizations
1. Profile performance before and after changes
2. Add performance tests if applicable
3. Document performance improvements
4. Consider memory usage impact
5. Test with large text inputs

## Getting Help

### Resources
- **Documentation**: Check existing documentation first
- **Issues**: Search existing issues for similar problems
- **Discussions**: Use GitHub Discussions for questions
- **Code Review**: Ask for feedback during development

### Communication Channels
- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Request Comments**: Code-specific discussions
- **Email**: For security-related issues only

## Recognition

Contributors are recognized in several ways:
- Listed in CHANGELOG.md for their contributions
- Mentioned in release notes for significant features
- Added to contributors list in README.md
- Invited to become maintainers for consistent contributors

## License

By contributing to PromptBoost, you agree that your contributions will be licensed under the same MIT License that covers the project. See [LICENSE](LICENSE) for details.

Thank you for contributing to PromptBoost! 🚀
