# PromptBoost Core Components

This directory contains the main extension entry points that handle core functionality and browser integration.

## Files

### `background.js`
**Purpose**: Service worker that acts as the central coordinator for the extension

**Responsibilities**:
- Initializes and coordinates all core modules
- Manages service dependency injection
- Provides unified entry point for the extension

**Key Classes**:
- `PromptBoostBackground` - Main controller class

**Architecture Features**:
- Modular architecture with dependency injection
- Comprehensive error handling and logging
- Service registration and management
- Event-driven communication

### `MessageRouter.js`
**Purpose**: Centralized message routing system

**Responsibilities**:
- Routes messages between extension components
- Handles communication with content scripts, popup, and options page
- Provides standardized response handling
- Manages message validation and error handling

**Key Classes**:
- `MessageRouter` - Main message routing class

**Architecture Features**:
- Centralized message handler registration
- Automatic error handling and response formatting
- Support for both tab-based and runtime messaging
- Message broadcasting capabilities

### `ApiController.js`
**Purpose**: API management and LLM provider interactions

**Responsibilities**:
- Handles all LLM API calls and text optimization
- Manages provider testing and validation
- Provides unified API interface for all providers
- Implements retry logic and error handling

**Key Classes**:
- `ApiController` - Main API management class

**Architecture Features**:
- Comprehensive retry logic with exponential backoff
- Provider-agnostic API interface
- Performance monitoring and timing
- Standardized error categorization

### `LifecycleManager.js`
**Purpose**: Extension lifecycle and installation management

**Responsibilities**:
- Handles extension installation and updates
- Manages configuration migrations
- Initializes default settings and templates
- Provides version compatibility checking

**Key Classes**:
- `LifecycleManager` - Main lifecycle management class

**Architecture Features**:
- Version-specific migration support
- Default template and configuration setup
- Chrome compatibility verification
- Event-driven lifecycle notifications

### `AuthenticationManager.js`
**Purpose**: Authentication and OAuth flow management

**Responsibilities**:
- Manages OAuth flows for supported providers
- Handles API key validation and testing
- Implements PKCE (Proof Key for Code Exchange) for security
- Provides unified authentication interface

**Key Classes**:
- `AuthenticationManager` - Main authentication class

**Architecture Features**:
- PKCE-compliant OAuth implementation
- Secure credential validation
- Provider-specific authentication patterns
- Automatic token refresh capabilities

### `content.js`
**Purpose**: Content script that handles user interactions on web pages

**Responsibilities**:
- Triple spacebar detection and timing
- Text selection and replacement
- UI overlay management (loading indicators, undo buttons)
- History tracking and undo functionality
- Cross-site compatibility handling

**Key Classes**:
- `PromptBoostContent` - Main content script controller

**Architecture Features**:
- Event-driven interaction handling
- Modular UI components
- Robust text manipulation
- Performance optimization for various websites

### `content.css`
**Purpose**: Styles for content script UI elements

**Features**:
- Loading indicators and progress bars
- Undo button styling
- Error message displays
- Responsive design for various screen sizes
- High z-index to ensure visibility on all sites

## Integration Points

- **Background ↔ Content**: Message passing for optimization requests and results
- **Background ↔ Popup/Options**: Settings synchronization and API testing
- **Content ↔ Web Pages**: DOM manipulation and event handling

## Development Notes

- All imports use relative paths from the core directory
- Error handling follows the centralized ErrorHandler pattern
- Logging uses the Logger utility for consistent output
- Performance-critical code is optimized for minimal impact on web pages
