# ADR-003: Background Script Decomposition

## Status
Proposed

## Context
The current `background.js` file is a monolithic script that handles multiple responsibilities:
- API calls to various LLM providers
- Message routing between extension components
- Settings and template management
- Extension lifecycle management
- Provider system integration
- OAuth authentication flows

This monolithic approach leads to:
- Difficulty in testing individual components
- Increased complexity and maintenance overhead
- Tight coupling between different concerns
- Harder to understand and modify specific functionality

## Decision
We will decompose the background script into focused modules:

1. **Create separate modules** for different responsibilities
2. **Implement proper separation of concerns**
3. **Use dependency injection** for better testability
4. **Maintain backward compatibility** with existing message APIs

## Consequences

### Positive
- Better separation of concerns and modularity
- Easier to test individual components
- Improved maintainability and readability
- Better error isolation and handling
- Easier to add new features

### Negative
- Increased number of files to manage
- Need to update import statements and dependencies
- Requires careful planning to maintain compatibility

## Implementation Plan

### Phase 1: Create Core Modules
1. Create `src/core/MessageRouter.js` for message handling
2. Create `src/core/ApiController.js` for API management
3. Create `src/core/LifecycleManager.js` for extension lifecycle
4. Create `src/core/AuthenticationManager.js` for OAuth flows

### Phase 2: Refactor Background Script
1. Update `background.js` to use modular architecture
2. Implement dependency injection through ApplicationContext
3. Maintain existing message API compatibility
4. Add proper error handling and logging

### Phase 3: Testing and Validation
1. Add unit tests for each module
2. Add integration tests for message flow
3. Verify backward compatibility
4. Performance testing and optimization

## Acceptance Criteria
- [ ] Background script decomposed into focused modules
- [ ] Proper separation of concerns implemented
- [ ] Dependency injection working correctly
- [ ] All existing message APIs maintained
- [ ] Unit tests for each module
- [ ] Integration tests passing
- [ ] Performance maintained or improved
