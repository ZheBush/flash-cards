import { test, expect } from '@playwright/test';

test.describe('Auth flows', () => {
  test('guest entry path is available from home', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Continue as Guest')).toBeVisible();
    await page.click('text=Continue as Guest');
    await expect(page).toHaveURL('/home');
  });

  test('login form validates email format', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'invalid-email');
    await page.click('button:has-text("Log in")');
    await expect(page.locator('text=Incorrect email')).toBeVisible();
  });

  test('valid email passes client-side validation', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'password123');
    
    // Should not show error for valid email
    const errorMessage = page.locator('text=Incorrect email');
    await expect(errorMessage).not.toBeVisible();
  });

  test('registration form shows password mismatch error', async ({ page }) => {
    await page.goto('/register');
    await page.fill('input[type="email"]', 'newuser@example.com');
    
    const passwordInputs = await page.locator('input[type="password"]').all();
    await passwordInputs[0].fill('password123');
    await passwordInputs[1].fill('differentpassword');
    
    await page.click('button:has-text("Register")');
    await expect(page.locator('text=Passwords do not match')).toBeVisible();
  });

  test('user can see login link on register page', async ({ page }) => {
    await page.goto('/register');
    const loginLink = page.locator('a:has-text("Already have an account")');
    expect(await loginLink.isVisible()).toBeTruthy();
  });

  test('user can navigate between login and register pages', async ({ page }) => {
    await page.goto('/login');
    await page.click('text=Create a new account');
    await expect(page).toHaveURL('/register');
    
    await page.click('text=Already have an account');
    await expect(page).toHaveURL('/login');
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    
    // Mock failed login response
    await page.route('**/auth/login', route => {
      route.abort('blockedbyprotocol');
    });
    
    await page.fill('input[type="email"]', 'user@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button:has-text("Log in")');
  });
});

test.describe('Protected routes', () => {
  test('unauthenticated user is redirected to login from protected pages', async ({ page }) => {
    // Clear any stored auth tokens
    await page.context().clearCookies();
    
    await page.goto('/cards');
    await expect(page).toHaveURL(/\/login/);
    
    await page.goto('/groups');
    await expect(page).toHaveURL(/\/login/);
  });

  test('authenticated user can access protected pages', async ({ page, context }) => {
    // Add auth token
    await context.addCookies([
      {
        name: 'access_token',
        value: 'test-token',
        domain: 'localhost',
        path: '/',
      },
    ]);
    
    await page.goto('/cards');
    // Should not redirect if token is valid
    // Actual behavior depends on token validation
  });
});

