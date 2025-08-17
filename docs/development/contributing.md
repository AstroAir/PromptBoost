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
- Fill out the PR template completely
- Link related issues using keywords (fixes #123)
- Add screenshots for UI changes
- Request review from maintainers

### 3. Review Process

- Address all review feedback
- Keep discussions constructive and focused
- Update your branch if requested
- Ensure CI checks pass

### 4. Merging

- Squash commits if requested
- Ensure commit messages follow conventions
- Delete feature branch after merge

## Testing Requirements

### Test Coverage

- Maintain minimum 80% test coverage
- Add unit tests for new functions/classes
- Add integration tests for new features
- Update existing tests when modifying code

### Test Types

```bash
# Run all tests
npm test

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

### Writing Tests

- Follow existing test patterns
- Use descriptive test names
- Test both success and error cases
- Mock external dependencies
- Keep tests focused and isolated

## Code Style Guidelines

### JavaScript Standards

- Use ES6+ features consistently
- Follow ESLint configuration
- Use meaningful variable and function names
- Implement proper error handling
- Add JSDoc comments for public APIs

### File Organization

- Group related functionality
- Use consistent naming conventions
- Keep files under 500 lines
- Implement proper imports/exports

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

Types:

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Test additions/modifications
- `chore`: Maintenance tasks

Examples:

- `feat(providers): add Anthropic Claude support`
- `fix(content): resolve spacebar detection timing issue`
- `docs(api): update provider interface documentation`

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

### Adding New LLM Providers

1. Create provider class extending base Provider
2. Implement required interface methods
3. Add provider to registry
4. Update options UI
5. Add comprehensive tests
6. Update documentation

### Template System Enhancements

1. Extend TemplateManager functionality
2. Add validation rules
3. Update template editor UI
4. Add testing capabilities
5. Document new features

### UI/UX Improvements

1. Follow existing design patterns
2. Ensure responsive design
3. Test across different browsers
4. Add accessibility features
5. Update CSS documentation

### Performance Optimizations

1. Profile performance impact
2. Add benchmarks for improvements
3. Document optimization techniques
4. Test memory usage
5. Update performance guidelines

## Getting Help

### Communication Channels

- **GitHub Issues**: Bug reports and feature requests
- **GitHub Discussions**: General questions and ideas
- **Pull Request Comments**: Code-specific discussions

### Resources

- [Development Setup](setup.md)
- [Testing Guide](testing.md)
- [Architecture Documentation](../architecture/overview.md)
- [API Reference](../api/)

### Mentorship

New contributors are welcome! Don't hesitate to:

- Ask questions in issues or discussions
- Request code reviews and feedback
- Seek guidance on implementation approaches
- Participate in community discussions

Thank you for contributing to PromptBoost! Your efforts help make this project better for everyone.
