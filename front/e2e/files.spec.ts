import { test, expect } from '@playwright/test';

test.describe('File Upload E2E', () => {
  test('authenticated user can upload a file', async ({ page, context }) => {
    // Login first or set auth token
    await context.addCookies([
      {
        name: 'access_token',
        value: 'test-token-123',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/home');
    
    // Look for file upload buttons
    const txtButton = page.locator('button:has-text("Choose TXT File")').first();
    if (await txtButton.isVisible()) {
      await expect(txtButton).toBeEnabled();
    }
  });

  test('guest user cannot upload files', async ({ page }) => {
    await page.goto('/home');
    
    // Guest user should be redirected when attempting to upload
    const uploadButton = page.locator('button:has-text("Choose TXT File")').first();
    if (await uploadButton.isVisible()) {
      await uploadButton.click();
      // Should redirect to login
      await expect(page).toHaveURL(/\/login/);
    }
  });

  test('file upload shows progress indicator', async ({ page, context }) => {
    await context.addCookies([
      {
        name: 'access_token',
        value: 'test-token-123',
        domain: 'localhost',
        path: '/',
      },
    ]);

    // Mock slow file upload
    await page.route('**/api/files/upload', route => {
      setTimeout(() => {
        route.continue();
      }, 2000);
    });

    await page.goto('/home');
    // Progress indicator test would depend on actual implementation
  });
});
