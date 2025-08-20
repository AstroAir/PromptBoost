# Security Policy

## 🔒 Supported Versions

We actively support the following versions of PromptBoost with security updates:

| Version | Supported          |
| ------- | ------------------ |
| 1.x.x   | ✅ Yes             |
| < 1.0   | ❌ No              |

## 🚨 Reporting a Vulnerability

We take security vulnerabilities seriously. If you discover a security vulnerability in PromptBoost, please report it responsibly.

### 📧 How to Report

**Please DO NOT report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by emailing us at:
**security@promptboost.dev** (or create a private security advisory on GitHub)

### 📋 What to Include

When reporting a vulnerability, please include:

1. **Description**: A clear description of the vulnerability
2. **Impact**: What could an attacker accomplish with this vulnerability?
3. **Reproduction**: Step-by-step instructions to reproduce the issue
4. **Proof of Concept**: If possible, include a minimal proof of concept
5. **Environment**: Browser version, OS, extension version
6. **Suggested Fix**: If you have ideas for how to fix the issue

### ⏱️ Response Timeline

- **Initial Response**: Within 48 hours
- **Triage**: Within 1 week
- **Fix Development**: Depends on severity (see below)
- **Public Disclosure**: After fix is released and users have time to update

### 🎯 Severity Levels

| Severity | Description | Response Time |
|----------|-------------|---------------|
| **Critical** | Remote code execution, data theft, privilege escalation | 24-48 hours |
| **High** | Significant security impact, data exposure | 1 week |
| **Medium** | Moderate security impact, limited exposure | 2 weeks |
| **Low** | Minor security impact, theoretical vulnerabilities | 1 month |

## 🛡️ Security Measures

### Extension Security

- **Manifest V3**: Uses the latest Chrome extension security model
- **Content Security Policy**: Strict CSP to prevent XSS attacks
- **Minimal Permissions**: Only requests necessary permissions
- **Secure Communication**: All API communications use HTTPS
- **Input Validation**: All user inputs are validated and sanitized

### Data Protection

- **Local Storage**: Sensitive data is encrypted before storage
- **API Keys**: Never logged or transmitted to our servers
- **User Content**: Text content is only sent to user-selected AI providers
- **No Tracking**: We don't track user behavior or content

### Code Security

- **Dependency Scanning**: Regular security audits of dependencies
- **Static Analysis**: Automated code security scanning
- **Code Review**: All changes undergo security review
- **Secure Defaults**: Security-first configuration defaults

## 🔐 Security Best Practices for Users

### API Key Security
- **Never share** your API keys with others
- **Use environment-specific keys** when possible
- **Rotate keys regularly** as recommended by providers
- **Monitor usage** for unexpected activity

### Extension Usage
- **Keep updated** to the latest version
- **Review permissions** when updating
- **Use on trusted sites** only
- **Report suspicious behavior** immediately

### Provider Security
- **Use reputable providers** with strong security practices
- **Review provider policies** regarding data handling
- **Understand data retention** policies of your chosen providers
- **Consider data sensitivity** before processing

## 🚫 Out of Scope

The following are generally considered out of scope for security reports:

- Issues in third-party AI provider APIs
- Browser-specific security issues not related to our extension
- Social engineering attacks
- Physical access attacks
- Issues requiring user to install malicious software
- Theoretical vulnerabilities without practical impact

## 🏆 Recognition

We believe in recognizing security researchers who help improve our security:

- **Hall of Fame**: Public recognition (with permission)
- **Acknowledgments**: Credit in release notes
- **Swag**: PromptBoost merchandise for significant findings
- **Early Access**: Beta access to new features

## 📚 Security Resources

### For Developers
- [Chrome Extension Security Guide](https://developer.chrome.com/docs/extensions/mv3/security/)
- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Secure Coding Practices](https://owasp.org/www-project-secure-coding-practices-quick-reference-guide/)

### For Users
- [Browser Extension Security Tips](https://blog.malwarebytes.com/security-world/technology/2017/07/introduction-to-browser-extension-security/)
- [API Key Security Best Practices](https://blog.gitguardian.com/secrets-api-management/)

## 📞 Contact

For security-related questions or concerns:
- **Email**: security@promptboost.dev
- **GitHub**: Create a private security advisory
- **General Questions**: Use GitHub Discussions

## 📄 Legal

This security policy is subject to our [Terms of Service](./docs/TERMS.md) and [Privacy Policy](./docs/PRIVACY.md).

---

**Last Updated**: January 2025
**Version**: 1.0
