import { test, expect } from '@playwright/test';

test('should login successfully with demo credentials', async ({ page }) => {
  await page.goto('/');

  // Fill credentials
  await page.fill('input[placeholder="demo"]', 'demo');
  await page.fill('input[placeholder="••••••••"]', 'Secrte#123');

  // Click login
  await page.click('button[type="submit"]');

  // Wait for redirect to dashboard
  await expect(page).toHaveURL('/dashboard', { timeout: 10000 });

  // Verify dashboard header
  await expect(page.locator('h1')).toContainText('OpenTrack Console');
});

test('should show error with invalid credentials', async ({ page }) => {
  await page.goto('/');

  await page.fill('input[placeholder="demo"]', 'wrong');
  await page.fill('input[placeholder="••••••••"]', 'wrong');
  await page.click('button[type="submit"]');

  await expect(page.locator('text=Invalid credentials')).toBeVisible();
});
