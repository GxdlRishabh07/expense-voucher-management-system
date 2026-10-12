import { test, expect } from '@playwright/test';
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../..');

test.describe('Director Approval & Rejection Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Reset database state to guarantee fresh pending vouchers
    execSync('npm run seed --prefix server', { cwd: projectRoot });
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
    await page.locator('[data-testid="demo-login-director"]').click();
    await expect(page.locator('[data-testid="director-stat-grid"]')).toBeVisible();
  });

  test('Director approves a pending voucher with mandatory signature', async ({ page }) => {
    await page.locator('[data-testid="nav-pending-approvals"]').click();
    await expect(page.locator('[data-testid="vouchers-list-page"]')).toBeVisible();

    const firstRow = page.locator('tbody tr').first();
    await firstRow.locator('button:has-text("View")').click();

    await expect(page.locator('[data-testid="voucher-detail-page"]')).toBeVisible();
    await page.locator('[data-testid="director-approve-action-btn"]').click();

    await expect(page.locator('[data-testid="approve-modal"]')).toBeVisible();

    const canvas = page.locator('[data-testid="director-canvas"]');
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 30, box.y + 40);
      await page.mouse.down();
      await page.mouse.move(box.x + 120, box.y + 60);
      await page.mouse.up();
    }
    await page.locator('[data-testid="director-apply-btn"]').click();
    await expect(page.locator('[data-testid="director-active-img"]')).toBeVisible();

    await page.locator('[data-testid="confirm-approve-btn"]').click();

    await expect(page.locator('[data-testid="badge-Approved"]')).toBeVisible();
    await expect(page.locator('[data-testid="detail-approved-banner"]')).toBeVisible();
  });

  test('Director rejects a pending voucher with mandatory reason', async ({ page }) => {
    await page.locator('[data-testid="nav-pending-approvals"]').click();
    await expect(page.locator('[data-testid="vouchers-list-page"]')).toBeVisible();

    const row = page.locator('tbody tr').first();
    await row.locator('button:has-text("View")').click();

    await expect(page.locator('[data-testid="voucher-detail-page"]')).toBeVisible();

    await page.locator('[data-testid="director-reject-action-btn"]').click();
    await expect(page.locator('[data-testid="reject-modal"]')).toBeVisible();

    await page.locator('[data-testid="rejection-reason-textarea"]').fill('Expenditure limit exceeded for this quarter. Please obtain prior budget authorization.');
    await page.locator('[data-testid="confirm-reject-btn"]').click();

    await expect(page.locator('[data-testid="badge-Rejected"]')).toBeVisible();
    await expect(page.locator('[data-testid="detail-rejection-banner"]')).toBeVisible();
    await expect(page.locator('[data-testid="detail-rejection-reason"]')).toContainText('Expenditure limit exceeded for this quarter');
  });

  test('Director verifies Pending Approvals and All Approvals show distinct data', async ({ page }) => {
    // 1. On Dashboard: Verify Pending Approvals tab displays review action button
    await expect(page.locator('[data-testid="director-tab-pending"]')).toBeVisible();
    await page.locator('[data-testid="director-tab-pending"]').click();
    await expect(page.locator('tbody tr button:has-text("Review & Decide")').first()).toBeVisible();

    // 2. On Dashboard: Switch to All Approvals tab and verify different rows
    await page.locator('[data-testid="director-tab-approved"]').click();
    await expect(page.locator('tbody tr button:has-text("View")').first()).toBeVisible();

    // 3. Navigate to Sidebar "Pending Approvals" -> list filtered to Pending Approval
    await page.locator('[data-testid="nav-pending-approvals"]').click();
    await expect(page.locator('[data-testid="vouchers-list-page"]')).toBeVisible();
    await expect(page.locator('h1')).toContainText('Pending Approval Requests');
    await expect(page.locator('[data-testid="filter-status-select"]')).toHaveValue('Pending Approval');

    // 4. Navigate to Sidebar "All Approvals" -> list filtered to Approved
    await page.locator('[data-testid="nav-all-approvals"]').click();
    await expect(page.locator('[data-testid="vouchers-list-page"]')).toBeVisible();
    await expect(page.locator('h1')).toContainText('All Approved Vouchers');
    await expect(page.locator('[data-testid="filter-status-select"]')).toHaveValue('Approved');

    // 5. Navigate to Sidebar "All Vouchers" -> list displays all statuses without lock
    await page.locator('[data-testid="nav-all-vouchers"]').click();
    await expect(page.locator('[data-testid="vouchers-list-page"]')).toBeVisible();
    await expect(page.locator('h1')).toContainText('All Organization Vouchers');
    await expect(page.locator('[data-testid="filter-status-select"]')).toHaveValue('');
  });
});
