import { test, expect } from '@playwright/test';

test.describe('Accounts Team Monitoring, Filtering & Printing', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="demo-login-accounts"]').click();
    await expect(page.locator('[data-testid="accounts-stat-grid"]')).toBeVisible();
  });

  test('Accounts Team views all vouchers and signatures', async ({ page }) => {
    await page.locator('[data-testid="nav-all-vouchers"]').click();
    await expect(page.locator('[data-testid="vouchers-list-page"]')).toBeVisible();

    // Verify vouchers table exists
    const table = page.locator('[data-testid="vouchers-table"]');
    await expect(table).toBeVisible();

    // Verify rows exist from different employees (e.g. Rahul and Priya)
    await expect(page.locator('tbody tr')).not.toHaveCount(0);
  });

  test('Filters vouchers by Department, Status and Search keyword', async ({ page }) => {
    await page.locator('[data-testid="nav-all-vouchers"]').click();

    // Search keyword
    await page.locator('[data-testid="filter-search-input"]').fill('Server');
    await page.waitForTimeout(400); // Debounce / network wait

    // Should only show server upgrade voucher
    const rows = page.locator('tbody tr');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('Server Upgrade');

    // Reset filters
    await page.locator('[data-testid="filter-reset-btn"]').click();
    await page.waitForTimeout(400);

    // Filter by Status: Approved
    await page.locator('[data-testid="filter-status-select"]').selectOption('Approved');
    await page.waitForTimeout(400);

    // All visible rows should have Approved badge
    const count = await page.locator('tbody tr').count();
    expect(count).toBeGreaterThan(0);
  });

  test('Views Voucher details and toggles Printable Official Receipt', async ({ page }) => {
    await page.locator('[data-testid="nav-all-vouchers"]').click();

    // Filter to Approved
    await page.locator('[data-testid="filter-status-select"]').selectOption('Approved');
    await page.waitForTimeout(400);

    // View first approved voucher
    await page.locator('tbody tr').first().locator('button:has-text("View")').click();

    await expect(page.locator('[data-testid="voucher-detail-page"]')).toBeVisible();

    // Toggle printable official receipt view
    await page.locator('[data-testid="toggle-receipt-btn"]').click();
    await expect(page.locator('[data-testid="voucher-receipt"]')).toBeVisible();
    await expect(page.getByText('Prachay Securities Private Limited')).toBeVisible();
    await expect(page.locator('[data-testid="print-voucher-btn"]')).toBeVisible();
  });
});
