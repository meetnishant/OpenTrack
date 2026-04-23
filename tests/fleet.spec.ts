import { test, expect } from '@playwright/test';

test('should filter vehicle list by ID', async ({ page }) => {
  // 1. Login
  await page.goto('/');
  await page.fill('input[placeholder="demo"]', 'demo');
  await page.fill('input[placeholder="••••••••"]', 'Secrte#123');
  await page.click('button[type="submit"]');
  await expect(page).toHaveURL('/dashboard');

  // 2. Wait for mock vehicles to be broadcasted (give it some time)
  // Mock vehicles usually have IDs like V-1, V-2, etc.
  await page.waitForSelector('text=V-', { timeout: 15000 });

  // 3. Search for a specific ID
  await page.fill('input[placeholder="Search Vehicle ID..."]', 'V-100');

  // 4. Verify list is filtered
  const visibleVehicles = page.locator('button:has-text("V-")');
  const count = await visibleVehicles.count();
  
  // Should show V-100
  expect(count).toBeGreaterThan(0); 
  await expect(page.locator('text=V-100')).toBeVisible();
});
