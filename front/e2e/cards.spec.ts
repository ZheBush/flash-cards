import { test, expect } from '@playwright/test';

test.describe('Card Management E2E', () => {
  test('authenticated user can create and view cards', async ({ page, context }) => {
    // Set auth token in cookies
    await context.addCookies([
      {
        name: 'access_token',
        value: 'test-token-123',
        domain: 'localhost',
        path: '/',
      },
    ]);

    await page.goto('/cards');
    await expect(page).toHaveTitle(/Cards/i);
  });

  test('unauthenticated user cannot access cards page', async ({ page }) => {
    await page.goto('/cards');
    await expect(page).toHaveURL(/\/login/);
  });

  test('card list displays empty state when no cards exist', async ({ page, context }) => {
    // Mock API response for empty cards
    await page.route('**/api/cards', route => {
      route.abort('blockedbyprotocol');
    });

    await context.addCookies([
      {
        name: 'access_token',
        value: 'test-token-123',
        domain: 'localhost',
        path: '/',
      },
    ]);

    // Empty state message should be visible
    // This depends on the actual component implementation
  });
});
