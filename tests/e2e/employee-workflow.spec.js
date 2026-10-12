import { test, expect } from '@playwright/test';

test.describe('Employee Voucher Lifecycle (Draft, Edit, Sign, Submit)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('[data-testid="demo-login-rahul"]').click();
    await expect(page.locator('[data-testid="employee-stat-grid"]')).toBeVisible();
  });

  test('Validates mandatory fields on create voucher', async ({ page }) => {
    await page.locator('[data-testid="nav-create-voucher"]').click();
    await expect(page.locator('[data-testid="voucher-create-page"]')).toBeVisible();

    // Clear required fields and try submitting
    await page.locator('[data-testid="input-expense-title"]').fill('');
    await page.locator('[data-testid="input-amount"]').fill('');

    // Try save draft
    await page.locator('[data-testid="btn-save-draft"]').click();

    // Validation errors should appear
    await expect(page.locator('[data-testid="error-expense-title"]')).toBeVisible();
    await expect(page.locator('[data-testid="error-amount"]')).toBeVisible();
  });

  test('Creates a voucher as Draft and edits it', async ({ page }) => {
    await page.locator('[data-testid="nav-create-voucher"]').click();

    // Fill valid particulars
    await page.locator('[data-testid="input-expense-title"]').fill('Quarterly Team Sprint Offsite');
    await page.locator('[data-testid="input-category"]').selectOption('Meals & Entertainment');
    await page.locator('[data-testid="input-amount"]').fill('7500');
    await page.locator('[data-testid="input-expense-description"]').fill('Team lunch and discussion for Q4 goals.');

    // Save as draft
    await page.locator('[data-testid="btn-save-draft"]').click();

    // Should navigate to detail page with Draft badge
    await expect(page.locator('[data-testid="voucher-detail-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="badge-Draft"]')).toBeVisible();
    await expect(page.locator('[data-testid="detail-edit-draft-btn"]')).toBeVisible();

    // Now edit the draft
    await page.locator('[data-testid="detail-edit-draft-btn"]').click();
    await expect(page.locator('[data-testid="voucher-edit-page"]')).toBeVisible();

    // Change amount to 8200
    await page.locator('[data-testid="edit-amount-input"]').fill('8200');
    await page.locator('[data-testid="edit-save-draft-btn"]').click();

    // Verify updated amount on detail page
    await expect(page.locator('[data-testid="detail-amount"]')).toContainText('8,200');
  });

  test('Draws signature and submits voucher for approval', async ({ page }) => {
    await page.locator('[data-testid="nav-create-voucher"]').click();

    await page.locator('[data-testid="input-expense-title"]').fill('Official Cloud Infrastructure Certificate');
    await page.locator('[data-testid="input-category"]').selectOption('Software & IT');
    await page.locator('[data-testid="input-amount"]').fill('4500');

    // Attempting to submit without signature must fail
    await page.locator('[data-testid="btn-submit-voucher"]').click();
    await expect(page.locator('[data-testid="error-employee-signature"]')).toBeVisible();

    // Draw on signature canvas
    const canvas = page.locator('[data-testid="employee-canvas"]');
    await canvas.scrollIntoViewIfNeeded();
    const box = await canvas.boundingBox();
    if (box) {
      await page.mouse.move(box.x + 20, box.y + 30);
      await page.mouse.down();
      await page.mouse.move(box.x + 100, box.y + 50);
      await page.mouse.move(box.x + 150, box.y + 30);
      await page.mouse.up();
    }

    // Apply drawn signature
    await page.locator('[data-testid="employee-apply-btn"]').click();
    await expect(page.locator('[data-testid="employee-active-img"]')).toBeVisible();

    // Submit for approval
    await page.locator('[data-testid="btn-submit-voucher"]').click();

    // Should now transition to Pending Approval
    await expect(page.locator('[data-testid="voucher-detail-page"]')).toBeVisible();
    await expect(page.locator('[data-testid="badge-Pending Approval"]')).toBeVisible();

    // Edit button must NOT be visible since voucher is now read-only
    await expect(page.locator('[data-testid="detail-edit-draft-btn"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="detail-delete-draft-btn"]')).not.toBeVisible();
  });
});
