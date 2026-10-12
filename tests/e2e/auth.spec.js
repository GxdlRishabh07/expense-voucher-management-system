import { test, expect } from '@playwright/test';

test.describe('Role-Based Authentication & Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.evaluate(() => localStorage.clear());
    await page.reload();
  });

  test('Employee login and dashboard access', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Prachay Securities' })).toBeVisible();

    // One-click demo login for Rahul Sharma (Employee)
    await page.locator('[data-testid="demo-login-rahul"]').click();

    // Verify employee dashboard
    await expect(page.locator('[data-testid="employee-stat-grid"]')).toBeVisible();
    await expect(page.locator('header').getByText('Rahul Sharma', { exact: true })).toBeVisible();
    await expect(page.locator('header').getByText('Employee', { exact: true })).toBeVisible();

    // Verify Employee navigation links exist
    await expect(page.locator('[data-testid="nav-dashboard"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-create-voucher"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-my-vouchers"]')).toBeVisible();

    // Verify Director/Accounts links do NOT exist for Employee
    await expect(page.locator('[data-testid="nav-pending-approvals"]')).not.toBeVisible();
  });

  test('Director login and approval access', async ({ page }) => {
    await page.goto('/');

    await page.locator('[data-testid="demo-login-director"]').click();

    // Verify Director dashboard
    await expect(page.locator('[data-testid="director-stat-grid"]')).toBeVisible();
    await expect(page.locator('header').getByText('Amit Verma (Director)', { exact: true })).toBeVisible();
    await expect(page.locator('header').getByText('Director', { exact: true })).toBeVisible();

    // Verify Director navigation links
    await expect(page.locator('[data-testid="nav-pending-approvals"]')).toBeVisible();
    await expect(page.locator('[data-testid="nav-all-vouchers"]')).toBeVisible();

    // Employee create voucher should NOT be visible to Director
    await expect(page.locator('[data-testid="nav-create-voucher"]')).not.toBeVisible();
  });

  test('Accounts Team login and monitoring access', async ({ page }) => {
    await page.goto('/');

    await page.locator('[data-testid="demo-login-accounts"]').click();

    // Verify Accounts dashboard
    await expect(page.locator('[data-testid="accounts-stat-grid"]')).toBeVisible();
    await expect(page.locator('header').getByText('Sneha Rao (Accounts)', { exact: true })).toBeVisible();
    await expect(page.locator('header').getByText('Accounts Team', { exact: true })).toBeVisible();

    // Cannot create vouchers
    await expect(page.locator('[data-testid="nav-create-voucher"]')).not.toBeVisible();
    await expect(page.locator('[data-testid="nav-pending-approvals"]')).not.toBeVisible();
  });

  test('User registration and custom account login', async ({ page }) => {
    const timestamp = Date.now();
    const testEmail = `newuser_${timestamp}@prachay.com`;
    const testName = `Rishabh User ${timestamp.toString().slice(-4)}`;
    const testPassword = 'Password@123';

    await page.goto('/');

    // Switch to Create Account tab
    await page.locator('[data-testid="tab-register"]').click();
    await expect(page.locator('[data-testid="register-name-input"]')).toBeVisible();

    // Fill in registration form
    await page.locator('[data-testid="register-name-input"]').fill(testName);
    await page.locator('[data-testid="register-email-input"]').fill(testEmail);
    await page.locator('[data-testid="register-password-input"]').fill(testPassword);
    await page.locator('[data-testid="register-department-select"]').selectOption('Engineering');
    await page.locator('[data-testid="register-role-select"]').selectOption('employee');

    // Submit registration
    await page.locator('[data-testid="register-submit-btn"]').click();

    // Verifies redirection to login tab and pre-filled email
    await expect(page.locator('[data-testid="login-email-input"]')).toHaveValue(testEmail);

    // Enter password and log in
    await page.locator('[data-testid="login-password-input"]').fill(testPassword);
    await page.locator('[data-testid="login-submit-btn"]').click();

    // Verify dashboard rendered with the new user's name
    await expect(page.locator('[data-testid="employee-stat-grid"]')).toBeVisible();
    await expect(page.locator('header').getByText(testName, { exact: true })).toBeVisible();
    await expect(page.locator('header').getByText('Employee', { exact: true })).toBeVisible();

    // Verify logout works
    await page.locator('[data-testid="logout-btn"]').click();
    await expect(page.getByRole('heading', { name: 'Prachay Securities' })).toBeVisible();
  });
});
