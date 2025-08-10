# Development Guidelines and Instructions

## Core Principles

### 1. **ASK, DON'T ASSUME**
- **NEVER** assume what code exists or how it's structured
- **ALWAYS** read the actual file contents before making changes
- **ALWAYS** check the current state of variables, functions, and dependencies
- If unsure about implementation details, **ASK** for clarification

### 2. **READ BEFORE WRITE**
- Use `read_file` to understand the current code structure
- Use `grep_search` to find existing implementations
- Use `semantic_search` to understand the codebase context
- Verify variable names, function signatures, and data structures

### 3. **VALIDATE SCOPE AND CONTEXT**
- Check variable scope and lifecycle
- Verify function parameters and return types
- Understand the data flow and dependencies
- Ensure proper error handling

## MVC Architecture Guidelines

### When to Create New Components

#### **Models** (`/Backend/models/`)
Create new models when:
- Adding new database entities
- Need complex data validation
- Require database relationship management
- Need data transformation logic

#### **Views** (`/Frontend/src/pages/`, `/Frontend/src/components/`)
Create new views when:
- Adding new user interfaces
- Creating reusable UI components
- Need complex state management
- Require different layouts or presentations

#### **Controllers** (`/Backend/controllers/`)
Create new controllers when:
- Adding new API endpoints
- Need business logic separation
- Handling complex request/response flows
- Managing different data sources

#### **Services** (`/Backend/services/`)
Create new services when:
- Need reusable business logic
- Managing external API integrations
- Complex data processing
- Cross-cutting concerns (auth, validation, etc.)

## Error Prevention Checklist

### Before Making Changes
- [ ] Read the entire relevant file
- [ ] Understand the data flow
- [ ] Check variable scope and lifecycle
- [ ] Verify function signatures
- [ ] Understand error handling patterns

### During Development
- [ ] Use exact variable names from the code
- [ ] Maintain consistent code style
- [ ] Add proper error handling
- [ ] Include meaningful console logs
- [ ] Follow existing patterns

### After Making Changes
- [ ] Test the changes immediately
- [ ] Check for console errors
- [ ] Verify API responses
- [ ] Test edge cases
- [ ] Document any assumptions made

## Common Mistakes to Avoid

### 1. **Variable Scope Issues**
```javascript
// ❌ BAD: Using variables outside their scope
if (condition) {
  const data = fetchData();
}
console.log(data); // ReferenceError: data is not defined

// ✅ GOOD: Proper scope management
let data;
if (condition) {
  data = fetchData();
}
if (data) {
  console.log(data);
}
```

### 2. **Assuming API Endpoints Exist**
```javascript
// ❌ BAD: Assuming endpoint exists
const response = await fetch('/api/users/daily-earnings');

// ✅ GOOD: Check if endpoint exists first
// Use grep_search to find existing endpoints
// Read route files to understand available APIs
```

### 3. **Not Handling Missing Dependencies**
```javascript
// ❌ BAD: Assuming function exists
const result = someFunction(data);

// ✅ GOOD: Check if function exists and handle errors
if (typeof someFunction === 'function') {
  const result = someFunction(data);
} else {
  console.error('someFunction is not defined');
}
```

## Development Workflow

### 1. **Investigation Phase**
1. Use `semantic_search` to understand the feature context
2. Use `grep_search` to find related code
3. Use `read_file` to understand implementation details
4. Check existing patterns and conventions

### 2. **Planning Phase**
1. Identify what needs to be created vs. modified
2. Understand the data flow requirements
3. Plan the MVC structure
4. Consider error handling and edge cases

### 3. **Implementation Phase**
1. Start with the backend (Models → Controllers → Routes)
2. Then implement frontend (Services → Components → Pages)
3. Test each layer before moving to the next
4. Add proper error handling and logging

### 4. **Validation Phase**
1. Test the happy path
2. Test error scenarios
3. Verify console logs and debugging info
4. Check for memory leaks or performance issues

## File Organization

### Backend Structure
```
Backend/
├── models/          # Data models and database interactions
├── controllers/     # Request handling and business logic
├── services/        # Reusable business logic
├── routes/          # API endpoint definitions
├── middleware/      # Cross-cutting concerns
└── config/          # Configuration files
```

### Frontend Structure
```
Frontend/src/
├── pages/           # Main application pages
├── components/      # Reusable UI components
├── services/        # API interaction logic
├── contexts/        # React context providers
├── hooks/           # Custom React hooks
├── utils/           # Utility functions
└── Common/          # Shared components
```

## Questions to Ask Before Coding

1. **What exactly needs to be implemented?**
2. **What are the existing patterns I should follow?**
3. **What data structure is expected?**
4. **How should errors be handled?**
5. **What are the dependencies and prerequisites?**
6. **Are there existing similar implementations I can reference?**
7. **What is the expected user experience?**
8. **What edge cases need to be considered?**
9. **Do not open server or build if not needed to check API**

## When in Doubt

**STOP and ASK for clarification instead of making assumptions!**

The cost of asking questions is much lower than the cost of fixing broken assumptions.
