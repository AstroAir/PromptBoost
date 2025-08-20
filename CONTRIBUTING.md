# Contributing to PromptBoost

Thank you for your interest in contributing to PromptBoost! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
3. **Install dependencies**: `npm install`
4. **Run tests**: `npm test`
5. **Start developing** and make your changes
6. **Submit a pull request**

## 📋 Development Setup

### Prerequisites

- Node.js 16+ and npm
- Chrome/Edge browser for testing
- Git

### Installation

```bash
# Clone your fork
git clone https://github.com/YOUR_USERNAME/promptboost.git
cd promptboost

# Install dependencies
npm install

# Run tests to ensure everything works
npm test

# Load extension in Chrome for testing
# Go to chrome://extensions/ → Enable Developer mode → Load unpacked → Select project folder
```

## 🏗️ Project Structure

```
src/
├── core/           # Main extension entry points
├── ui/             # User interface components
├── services/       # Business logic services
├── providers/      # AI provider integrations
├── templates/      # Template management system
├── utils/          # Shared utilities
└── lib/            # Third-party integrations

docs/               # Documentation
tests/              # Test files
```

## 🎯 How to Contribute

### Reporting Bugs

1. **Check existing issues** to avoid duplicates
2. **Use the bug report template** when creating new issues
3. **Provide detailed information**:
   - Steps to reproduce
   - Expected vs actual behavior
   - Browser version and OS
   - Extension version
   - Console errors (if any)

### Suggesting Features

1. **Check existing feature requests** to avoid duplicates
2. **Use the feature request template**
3. **Explain the use case** and why it would be valuable
4. **Consider implementation complexity**

### Code Contributions

#### Before You Start

1. **Check existing issues** for work that needs to be done
2. **Comment on the issue** to let others know you're working on it
3. **Create a new branch** for your feature/fix

#### Development Guidelines

1. **Follow the existing code style**
   - Use ESLint configuration provided
   - Follow naming conventions
   - Add JSDoc comments for functions

2. **Write tests** for new functionality
   - Unit tests for individual functions
   - Integration tests for component interactions
   - Test edge cases and error conditions

3. **Update documentation**
   - Update README if needed
   - Add/update JSDoc comments
   - Update relevant documentation in `/docs`

4. **Follow the architecture**
   - Use the established directory structure
   - Follow dependency injection patterns
   - Use the EventBus for component communication

#### Code Style

- **JavaScript**: ES6+ features, async/await preferred
- **Naming**: camelCase for variables/functions, PascalCase for classes
- **Comments**: JSDoc for public APIs, inline comments for complex logic
- **Error Handling**: Use the centralized ErrorHandler
- **Logging**: Use the Logger utility consistently

#### Commit Messages

Follow conventional commit format:

```
type(scope): description

[optional body]

[optional footer]
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

Examples:
- `feat(providers): add OpenRouter OAuth support`
- `fix(templates): resolve validation error handling`
- `docs(api): update provider integration guide`

### Pull Request Process

1. **Create a descriptive title** following conventional commit format
2. **Fill out the PR template** completely
3. **Link related issues** using keywords (fixes #123)
4. **Ensure all tests pass** and add new tests if needed
5. **Update documentation** if your changes affect the API
6. **Request review** from maintainers

#### PR Requirements

- [ ] All tests pass (`npm test`)
- [ ] Code follows style guidelines (`npm run lint`)
- [ ] Documentation updated if needed
- [ ] No breaking changes (or clearly documented)
- [ ] Commit messages follow conventional format

## 🧪 Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run specific test types
npm run test:unit
npm run test:integration
```

### Writing Tests

- **Unit tests**: Test individual functions/classes in isolation
- **Integration tests**: Test component interactions
- **Mock external dependencies**: Use Jest mocks for Chrome APIs, network calls
- **Test error conditions**: Ensure proper error handling

## 📚 Documentation

### Types of Documentation

1. **Code Documentation**: JSDoc comments in source code
2. **API Documentation**: Detailed API references in `/docs/api`
3. **User Documentation**: Guides and tutorials in `/docs/guides`
4. **Architecture Documentation**: System design in `/docs/architecture`

### Documentation Standards

- **Clear and concise** explanations
- **Code examples** for complex concepts
- **Up-to-date** with current implementation
- **Accessible language** for different skill levels

## 🔒 Security

- **Report security vulnerabilities** privately via email
- **Don't include sensitive data** in code or tests
- **Follow security best practices** for browser extensions
- **Validate all user inputs** and API responses

## 🤝 Community Guidelines

### Code of Conduct

We follow the [Contributor Covenant Code of Conduct](CODE_OF_CONDUCT.md). Please read and follow it.

### Communication

- **Be respectful** and constructive in discussions
- **Help newcomers** get started
- **Share knowledge** and best practices
- **Ask questions** if you're unsure about anything

## 📞 Getting Help

- **GitHub Issues**: For bugs and feature requests
- **GitHub Discussions**: For questions and general discussion
- **Documentation**: Check `/docs` for detailed guides
- **Code Comments**: Look for inline documentation

## 🏆 Recognition

Contributors are recognized in:
- **README.md**: Major contributors listed
- **Release notes**: Contributions acknowledged
- **GitHub**: Contributor statistics visible

Thank you for contributing to PromptBoost! 🎉
