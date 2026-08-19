import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5173'

async function loginAdmin(page) {
  await page.goto(`${BASE}/login`)
  await page.getByLabel('Username').fill('admin')
  await page.getByLabel('Password').fill('admin123')
  await page.locator('button[type="submit"]').click()
  await expect(page).toHaveURL(`${BASE}/admin`, { timeout: 10000 })
}

test.describe('Admin Panel', () => {
  test.beforeEach(async ({ page }) => {
    await loginAdmin(page)
  })

  test('displays admin panel with title', async ({ page }) => {
    await expect(page.getByText('Admin Panel')).toBeVisible()
    await expect(page.getByText('System administration and management')).toBeVisible()
  })

  test('shows dashboard tab with stats', async ({ page }) => {
    await expect(page.getByText('Total Users')).toBeVisible()
    await expect(page.getByText('Total Balance')).toBeVisible()
    await expect(page.getByText('Total Transactions')).toBeVisible()
  })

  test('shows monthly activity chart', async ({ page }) => {
    await expect(page.getByText('Monthly Activity')).toBeVisible()
  })

  test('shows recent activity section', async ({ page }) => {
    await expect(page.getByText('Recent Activity')).toBeVisible()
  })

  test('navigates to Users tab', async ({ page }) => {
    await page.getByRole('button', { name: 'Users', exact: true }).click()
    await expect(page.getByText('User').first()).toBeVisible({ timeout: 5000 })
    await expect(page.getByText('@john_doe')).toBeVisible({ timeout: 5000 })
  })

  test('can add a new user', async ({ page }) => {
    await page.getByRole('button', { name: 'Users', exact: true }).click()
    await page.getByRole('button', { name: /Add User/i }).click()
    await expect(page.getByText(/Add New User/i)).toBeVisible({ timeout: 5000 })
  })

  test('can toggle user status', async ({ page }) => {
    await page.getByRole('button', { name: 'Users', exact: true }).click()
    await page.waitForTimeout(1000)
    // Toggle the last user to avoid breaking john_doe which other tests depend on
    const toggleBtn = page.locator('button[title="Deactivate"], button[title="Activate"]').last()
    if (await toggleBtn.isVisible({ timeout: 5000 })) {
      await toggleBtn.click()
      await page.waitForTimeout(2000)
      // Toggle back to restore original state
      const restoreBtn = page.locator('button[title="Deactivate"], button[title="Activate"]').last()
      if (await restoreBtn.isVisible({ timeout: 5000 })) {
        await restoreBtn.click()
        await page.waitForTimeout(2000)
      }
    }
  })

  test('can edit a user', async ({ page }) => {
    await page.getByRole('button', { name: 'Users', exact: true }).click()
    await page.waitForTimeout(1000)
    const editBtn = page.locator('button[title="Edit"]').first()
    if (await editBtn.isVisible({ timeout: 5000 })) {
      await editBtn.click()
      await expect(page.getByText(/Edit User/i)).toBeVisible({ timeout: 5000 })
    }
  })

  test('navigates to Transactions tab', async ({ page }) => {
    await page.getByRole('button', { name: 'Transactions', exact: true }).click()
    await expect(page.getByPlaceholder(/Search by user/i)).toBeVisible({ timeout: 5000 })
  })

  test('can filter admin transactions by type', async ({ page }) => {
    await page.getByRole('button', { name: 'Transactions', exact: true }).click()
    await page.waitForTimeout(1000)
    const filterBtn = page.locator('button').filter({ hasText: 'Deposit' }).first()
    if (await filterBtn.isVisible({ timeout: 5000 })) {
      await filterBtn.click()
      await page.waitForTimeout(1000)
    }
  })

  test('admin sidebar shows admin-specific links', async ({ page }) => {
    await expect(page.getByText('Admin Panel').first()).toBeVisible()
  })

  test('logout works from admin panel', async ({ page }) => {
    await page.getByText('Logout').click()
    await expect(page).toHaveURL(`${BASE}/login`, { timeout: 10000 })
  })
})

test.describe('Admin Route Protection', () => {
  test('non-admin user cannot access /admin directly', async ({ page }) => {
    await page.goto(`${BASE}/login`)
    await page.getByLabel('Username').fill('john_doe')
    await page.getByLabel('Password').fill('password123')
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL(`${BASE}/dashboard`, { timeout: 10000 })

    await page.goto(`${BASE}/admin`)
    await expect(page).toHaveURL(`${BASE}/dashboard`)
  })
})
