# Frontend Testing Guide

## Overview

This frontend test suite includes:
- **Unit Tests**: React component testing using Jest and React Testing Library
- **E2E Tests**: End-to-end browser testing using Playwright
- **Coverage**: Authentication, file uploads, card management, and user flows

## Setup

### 1. Install Dependencies

```bash
cd front
npm install
```

Dependencies are already configured in `package.json`:
- `@testing-library/react` - Component testing utilities
- `@testing-library/jest-dom` - DOM matchers
- `jest` - Test runner (via react-scripts)
- `@playwright/test` - E2E testing framework

### 2. Test Structure

```
front/
├── src/
│   ├── __tests__/              # Unit tests
│   │   ├── Login.test.tsx      # Login component tests
│   │   ├── Register.test.tsx   # Registration component tests
│   │   ├── Home.test.tsx       # Home/dashboard component tests
│   │   └── Cards.test.tsx      # Cards listing tests
│   └── setupTests.ts           # Jest configuration
├── e2e/                        # E2E tests
│   ├── auth.spec.ts            # Authentication flows
│   ├── cards.spec.ts           # Card management flows
│   └── files.spec.ts           # File upload flows
└── playwright.config.ts        # Playwright configuration
```

## Running Tests

### Unit Tests (React Components)

#### Run all unit tests
```bash
npm run test:unit
```

#### Run tests in watch mode (during development)
```bash
npm test
```

#### Run tests with coverage report
```bash
npm run test:unit -- --coverage
```

#### Run specific test file
```bash
npm run test:unit -- Login.test.tsx
```

#### Run tests matching a pattern
```bash
npm run test:unit -- --testNamePattern="email validation"
```

### E2E Tests (Playwright)

#### Prerequisites
- Backend API running on `http://localhost:8000`
- Frontend running on `http://localhost:3001` (Playwright starts it automatically)

#### Run all E2E tests
```bash
npm run test:e2e
```

#### Run specific E2E test file
```bash
npm run test:e2e e2e/auth.spec.ts
```

#### Run E2E tests with UI mode (visual debugging)
```bash
npx playwright test --ui
```

#### Run E2E tests in headed mode (see browser)
```bash
npx playwright test --headed
```

#### Run E2E tests in debug mode (step through)
```bash
npx playwright test --debug
```

#### View E2E test report
```bash
npx playwright show-report
```

## Test Cases

### Unit Tests

#### Login Component (`src/__tests__/Login.test.tsx`)
- ✅ Renders login form with email and password inputs
- ✅ Validates email format and shows error message
- ✅ Calls login and stores access token on successful submit
- ✅ Handles login API error and shows error message
- ✅ Handles network errors gracefully
- ✅ Calls guest session when "Continue as Guest" button is clicked
- ✅ Disables login button while loading

#### Registration Component (`src/__tests__/Register.test.tsx`)
- ✅ Renders registration form with required fields
- ✅ Shows password confirmation error when passwords don't match
- ✅ Validates email format before submitting
- ✅ Shows "user already exists" error when server returns 400
- ✅ Successfully registers and calls login with server response
- ✅ Handles network errors during registration
- ✅ Disables register button while submitting

#### Home Component (`src/__tests__/Home.test.tsx`)
- ✅ **Guest User**: Renders home page with file upload options
- ✅ **Guest User**: Redirects to login when clicking TXT file button
- ✅ **Guest User**: Redirects to login when clicking PDF file button
- ✅ **Authenticated User**: Allows file upload interaction
- ✅ **Authenticated User**: Displays user email when authenticated
- ✅ **Loading State**: Shows loading indicator while checking authentication

#### Cards Component (`src/__tests__/Cards.test.tsx`)
- ✅ Redirects unauthenticated users to login
- ✅ Renders cards container for authenticated user
- ✅ Handles API errors when fetching cards

### E2E Tests

#### Authentication (`e2e/auth.spec.ts`)
- ✅ Guest entry path is available from home
- ✅ Login form validates email format
- ✅ Valid email passes client-side validation
- ✅ Registration form shows password mismatch error
- ✅ User can see login link on register page
- ✅ User can navigate between login and register pages
- ✅ Login with invalid credentials shows error
- ✅ Unauthenticated user is redirected to login from protected pages
- ✅ Authenticated user can access protected pages

#### Card Management (`e2e/cards.spec.ts`)
- ✅ Authenticated user can create and view cards
- ✅ Unauthenticated user cannot access cards page
- ✅ Card list displays empty state when no cards exist

#### File Upload (`e2e/files.spec.ts`)
- ✅ Authenticated user can upload a file
- ✅ Guest user cannot upload files
- ✅ File upload shows progress indicator

## Test Coverage Goals

| Feature | Target | Status |
|---------|--------|--------|
| Authentication | 85%+ | ✅ Complete |
| File Operations | 80%+ | ✅ Complete |
| User Management | 75%+ | ✅ Complete |
| Card Operations | 80%+ | ✅ Complete |
| **Overall** | **80%+** | ✅ **Complete** |

## Debugging Tests

### Debug Unit Tests
```bash
# Run single test in debug mode
node --inspect-brk node_modules/.bin/jest --runInBand Login.test.tsx

# Then open: chrome://inspect
```

### Debug E2E Tests
```bash
# Open Playwright Inspector
npx playwright test --debug

# Or run in UI mode for visual feedback
npx playwright test --ui
```

### View Detailed Test Output
```bash
# Run with verbose output
npm run test:unit -- --verbose

# Run with full error messages
npm run test:unit -- --no-coverage
```

## Common Issues & Solutions

### Issue: "Cannot find module AuthContext"
**Solution**: Ensure mocks are set up in `beforeEach()`:
```typescript
jest.mock('../AuthContext.tsx', () => ({
  useAuth: () => ({ /* mock implementation */ })
}));
```

### Issue: "Timeout waiting for element to appear"
**Solution**: Increase timeout and use `waitFor()`:
```typescript
await waitFor(() => {
  expect(screen.getByText(/error/i)).toBeInTheDocument();
}, { timeout: 3000 });
```

### Issue: "Playwright tests fail with 'Connection refused'"
**Solution**: Ensure backend is running:
```bash
cd back
python -m uvicorn app.main:app --reload
```

### Issue: "localStorage is not defined"
**Solution**: Jest automatically provides localStorage, but for custom storage, mock it:
```typescript
Object.defineProperty(window, 'localStorage', {
  value: { getItem: jest.fn(), setItem: jest.fn() }
});
```

## Best Practices

1. **Test User Behavior, Not Implementation**
   - Test what users see and interact with
   - Use `screen.getByRole()` over `screen.getByTestId()`

2. **Use Semantic Queries**
   ```typescript
   // Good
   screen.getByRole('button', { name: /log in/i })
   
   // Avoid
   screen.getByClassName('login-btn')
   ```

3. **Mock External Dependencies**
   - Mock fetch/axios calls
   - Mock AuthContext
   - Mock Router navigation

4. **Keep Tests Focused**
   - One behavior per test
   - Clear test names describing what is tested

5. **Use BeforeEach for Setup**
   ```typescript
   beforeEach(() => {
     jest.resetAllMocks();
     (window.fetch as jest.Mock) = jest.fn();
   });
   ```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Frontend Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '18'
      - run: cd front && npm install
      - run: npm run test:unit
      - run: npm run test:e2e
```

## Additional Resources

- [React Testing Library Docs](https://testing-library.com/react)
- [Jest Documentation](https://jestjs.io/)
- [Playwright Documentation](https://playwright.dev/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## Performance Metrics

Expected test execution times:
- Unit tests: ~15-30 seconds
- E2E tests: ~30-60 seconds (depends on network)
- Full suite: ~45-90 seconds

## Continuous Testing

For development workflow:
```bash
# Terminal 1: Backend
cd back
python -m uvicorn app.main:app --reload

# Terminal 2: Frontend dev server
cd front
npm start

# Terminal 3: Run tests in watch mode
cd front
npm test
```

## Support

For issues or questions:
1. Check test error messages carefully
2. Review the test file comments
3. Check component implementation in `src/`
4. Review E2E test traces: `npx playwright show-report`
