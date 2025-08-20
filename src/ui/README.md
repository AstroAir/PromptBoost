# PromptBoost User Interface Components

This directory contains all user interface components for the PromptBoost extension, organized by context and functionality.

## Directory Structure

### `/popup`
Quick access interface displayed when clicking the extension icon

**Files**:
- `popup.html` - Main popup structure with status indicators and quick actions
- `popup.css` - Responsive styling optimized for popup dimensions
- `popup.js` - JavaScript functionality for popup interactions
- `README.md` - Detailed popup component documentation

**Features**:
- Extension toggle switch
- Current settings display (provider, model, API key status)
- Quick action buttons (Settings, Test API, Help)
- Status indicators and connection testing
- Responsive layout for various popup sizes

### `/options`
Comprehensive settings and configuration interface

**Files**:
- `options.html` - Full-featured settings page with tabbed interface
- `options.css` - Comprehensive styling for all settings components
- `options.js` - Complex JavaScript for settings management
- `README.md` - Detailed options page documentation

**Features**:
- Tabbed interface for organized settings
- Provider configuration and API key management
- Template management (create, edit, test, import/export)
- Advanced settings and preferences
- Usage analytics and history
- Search and filtering capabilities

## Architecture Principles

### Component Organization
- Each UI context has its own directory
- Related files (HTML, CSS, JS) are co-located
- Shared utilities are imported from parent directories

### Responsive Design
- Mobile-first approach for popup interface
- Desktop-optimized layout for options page
- Consistent design language across components

### State Management
- Chrome storage API for persistence
- Event-driven updates between components
- Optimistic UI updates with error handling

### Accessibility
- Semantic HTML structure
- ARIA labels and roles
- Keyboard navigation support
- High contrast mode compatibility

## Development Guidelines

- Use relative imports for component-specific resources
- Follow established CSS naming conventions
- Implement proper error handling and user feedback
- Test across different screen sizes and browsers
- Maintain consistent visual design patterns
