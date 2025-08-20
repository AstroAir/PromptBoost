# PromptBoost Architecture Documentation

## Overview

PromptBoost v2.0 features a completely refactored architecture with improved modularity, maintainability, and extensibility. This document outlines the new architecture and design decisions.

## Architecture Principles

### 1. Modular Design

- **Separation of Concerns**: Each module has a single, well-defined responsibility
- **Loose Coupling**: Modules interact through well-defined interfaces
- **High Cohesion**: Related functionality is grouped together

### 2. Service-Oriented Architecture

- **Centralized Services**: Core functionality is provided by singleton services
- **Event-Driven Communication**: Services communicate through events
- **Dependency Injection**: Services can be easily tested and mocked

### 3. Provider Pattern

- **Unified Interface**: All AI providers implement the same interface
- **Extensibility**: New providers can be easily added
- **Fallback Support**: Automatic fallback to alternative providers

## Directory Structure

```
PromptBoost/
├── config/                   # Centralized configuration system
│   ├── Constants.js         # All hard-coded values and constants
│   ├── ConfigSchema.js      # Configuration schema and validation
│   └── README.md            # Configuration system documentation
├── utils/                    # Shared utility modules
│   ├── ErrorHandler.js      # Centralized error handling
│   ├── Logger.js            # Unified logging system
│   ├── ConfigValidator.js   # Configuration validation
│   ├── ApiHelper.js         # Common API utilities
│   └── README.md
├── services/                 # Core business logic services
│   ├── TemplateManager.js   # Template management service
│   ├── ConfigurationManager.js # Settings management service
│   └── README.md
├── providers/                # AI provider implementations
│   ├── base/                # Base provider classes
│   │   ├── Provider.js      # Abstract provider base class
│   │   └── ProviderRegistry.js # Provider registration system
│   ├── openai/              # OpenAI provider
│   ├── anthropic/           # Anthropic provider
│   ├── google/              # Google Gemini provider
│   ├── cohere/              # Cohere provider
│   ├── huggingface/         # Hugging Face provider
│   ├── local/               # Local model provider
│   ├── openrouter/          # OpenRouter provider
│   └── README.md
├── templates/               # Template system modules
│   ├── TemplateEditor.js    # Enhanced template editor
│   ├── TemplateValidator.js # Template validation system
│   ├── TemplateVersioning.js # Version control system
│   ├── TemplateTester.js    # Testing framework
│   └── README.md
├── tests/                   # Comprehensive test suite
│   ├── unit/               # Unit tests
│   ├── integration/        # Integration tests
│   ├── mocks/              # Mock implementations
│   ├── fixtures/           # Test data
│   └── setup/              # Test configuration
├── docs/                   # Documentation
├── background.js           # Background service worker
├── content.js             # Content script
├── popup/                 # Extension popup
├── options/               # Settings page
└── manifest.json          # Extension manifest
```

## Core Components

### 1. Background Service Worker (`background.js`)

**Purpose**: Central coordinator for all extension functionality

**Key Responsibilities**:

- Message routing between components
- API calls to LLM providers
- Settings and template management
- Extension lifecycle management

**Architecture Features**:

- Provider system integration
- Service dependency injection
- Comprehensive error handling
- Performance monitoring

### 2. Content Script (`content.js`)

**Purpose**: User interaction handler on web pages

**Key Responsibilities**:

- Triple spacebar detection
- Text selection and replacement
- UI overlay management
- History tracking

**Architecture Features**:

- Event-driven interaction handling
- Modular UI components
- Undo/redo functionality
- Cross-site compatibility

### 3. Services Layer

#### TemplateManager

**Purpose**: Centralized template management

**Features**:

- CRUD operations for templates
- Version control and history
- Template validation and testing
- Import/export functionality
- Performance analytics

#### ConfigurationManager

**Purpose**: Settings and configuration management

**Features**:

- Per-page configuration support
- Settings validation and migration
- Backup and restore functionality
- Cross-component synchronization

### 4. Provider System

#### Base Provider (`Provider.js`)

**Purpose**: Abstract base class for all AI providers

**Interface**:

```javascript
class Provider {
  async authenticate(credentials)
  async callAPI(prompt, options)
  validateConfig(config)
  getDefaultModel()
  getAvailableModels()
  getConfigSchema()
}
```

#### Provider Registry (`ProviderRegistry.js`)

**Purpose**: Provider management and discovery

**Features**:

- Dynamic provider registration
- Fallback provider management
- Configuration validation
- Instance caching

### 5. Template System

#### Template Editor (`TemplateEditor.js`)

**Purpose**: Enhanced template editing interface

**Features**:

- CodeMirror integration
- Syntax highlighting
- Real-time validation
- Live preview functionality

#### Template Versioning (`TemplateVersioning.js`)

**Purpose**: Version control for templates

**Features**:

- History tracking
- Rollback capabilities
- Change comparison
- Automatic cleanup

#### Template Tester (`TemplateTester.js`)

**Purpose**: Automated template testing

**Features**:

- Validation testing
- Performance testing
- API integration testing
- Quality assessment

### 6. Utilities Layer

#### ErrorHandler (`ErrorHandler.js`)

**Purpose**: Centralized error management

**Features**:

- Error categorization
- User-friendly messages
- Logging integration
- Recovery strategies

#### Logger (`Logger.js`)

**Purpose**: Unified logging system

**Features**:

- Configurable log levels
- Performance logging
- Development vs production modes
- Structured logging

## Data Flow Architecture

### 1. Text Optimization Flow

```
User Input → Content Script → Background Script → Provider → API → Response Processing → Text Replacement
```

### 2. Template Management Flow

```
Template Editor → Template Manager → Versioning System → Storage
                        ↓
Testing Framework → Validation → Analytics → Event Emission
```

## Design Patterns

### 1. Singleton Pattern

- **Used for**: Services (TemplateManager, ConfigurationManager)
- **Benefit**: Ensures single instance and consistent state

### 2. Factory Pattern

- **Used for**: Provider creation and registration
- **Benefit**: Flexible provider instantiation

### 3. Observer Pattern

- **Used for**: Event-driven communication between services
- **Benefit**: Loose coupling and reactive updates

### 4. Strategy Pattern

- **Used for**: Provider selection and fallback mechanisms
- **Benefit**: Runtime provider switching

### 5. Command Pattern

- **Used for**: Undo/redo functionality
- **Benefit**: Reversible operations

## Performance Considerations

### 1. Memory Management

- Service singletons prevent memory leaks
- Template caching with LRU eviction
- Provider instance pooling
- Automatic cleanup of old data

### 2. Network Optimization

- Request batching where possible
- Response caching for identical requests
- Connection pooling for providers
- Retry logic with exponential backoff

### 3. UI Responsiveness

- Asynchronous operations throughout
- Progressive loading for large datasets
- Debounced user input handling
- Lazy loading of components

## Security Architecture

### 1. Data Protection

- API keys stored in secure Chrome storage
- No sensitive data in logs
- Input sanitization for all user data
- HTTPS-only communication

### 2. Permission Model

- Minimal required permissions
- Scoped access to necessary APIs
- Content Security Policy enforcement
- Cross-origin request validation

### 3. Error Handling

- Sensitive data removed from error messages
- Graceful degradation on failures
- User-friendly error reporting
- Automatic recovery mechanisms

## Extensibility

### 1. Provider System

- Plugin-like architecture for new providers
- Standardized configuration schemas
- Automatic UI generation for settings
- Hot-swappable provider instances

### 2. Template System

- Custom template types
- Plugin-based validators
- Extensible testing framework
- Custom editor components

### 3. Service Architecture

- Dependency injection for testability
- Event-driven communication
- Modular service registration
- Cross-service data sharing

## Migration and Compatibility

### 1. Version Migration

- Automatic settings migration between versions
- Template format upgrades
- Provider configuration updates
- Backward compatibility maintenance

### 2. Browser Compatibility

- Manifest V3 compliance
- Cross-browser API abstraction
- Feature detection and fallbacks
- Progressive enhancement

### 3. API Compatibility

- Existing message passing interfaces are maintained
- New interfaces are added alongside old ones
- Deprecation warnings for old APIs

## Future Extensibility

### 1. Plugin System

- Architecture supports future plugin system
- Providers can be loaded as plugins
- Templates can be packaged as plugins

### 2. API Versioning

- Internal APIs are versioned for compatibility
- Migration paths are planned
- Breaking changes are minimized

### 3. Monitoring and Analytics

- Built-in performance monitoring
- Usage analytics framework
- Error reporting system

## Recent Architectural Improvements (v2.0)

### Configuration System Refactoring

**Problem Solved**: Eliminated code duplication and hard-coded values scattered throughout the codebase.

**Implementation**:
- **Centralized Constants**: All hard-coded values moved to `src/config/Constants.js`
- **Configuration Schema**: Complete schema definition in `src/config/ConfigSchema.js`
- **Single Source of Truth**: Default configurations defined once and reused
- **Validation Framework**: Schema-based configuration validation

**Benefits**:
- Reduced maintenance overhead
- Improved consistency across components
- Easier to add new configuration options
- Better type safety and documentation

### Provider System Standardization

**Problem Solved**: Inconsistent error handling, authentication patterns, and response processing across providers.

**Implementation**:
- **Enhanced Error Handling**: Standardized error categorization with user-friendly messages
- **Unified Authentication**: Consistent authentication interface with provider-specific implementations
- **Response Processing Pipeline**: Standardized response handling with automatic rate limit updates
- **Rate Limiting Enhancement**: Centralized rate limits with header-based updates

**Benefits**:
- Consistent user experience across all providers
- Easier to add new providers
- Better error handling and debugging
- Improved security through standardized authentication

### Architectural Decision Records (ADRs)

The project now includes comprehensive ADRs documenting major architectural decisions:
- **ADR-001**: Configuration Management Consolidation
- **ADR-002**: Provider System Standardization
- **ADR-003**: Background Script Decomposition

These ADRs provide context for future development and ensure architectural consistency.

## Future Architecture Goals

### Planned Improvements
- **Background Script Decomposition**: Break down monolithic background script into focused modules
- **Enhanced Error Handling**: Implement consistent error patterns across all components
- **OAuth PKCE Integration**: Enhanced authentication flows for supported providers
- **Provider Health Monitoring**: Real-time monitoring of provider availability and performance

This architecture provides a solid foundation for future development while maintaining backward compatibility and ensuring excellent user experience.
