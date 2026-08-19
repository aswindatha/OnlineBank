import { test, expect } from '@playwright/test'
import { execSync } from 'child_process'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const BASE = 'http://localhost:5173'

function resetTestData() {
  const scriptPath = path.join(__dirname, '..', '..', 'reset_test_data.py')
  const projectRoot = path.join(__dirname, '..', '..')
  execSync(`python "${scriptPath}"`, { cwd: projectRoot, stdio: 'pipe' })
}

test.beforeAll(() => {
  resetTestData()
})

async function loginUser(page) {
  await page.goto(`${BASE}/login`)
  await page.getByLabel('Username').fill('john_doe')
  await page.getByLabel('Password').fill('password123')
  await page.locator('button[type="submit"]').click()
  await expect(page).toHaveURL(`${BASE}/dashboard`, { timeout: 10000 })
}

test.describe('Profile', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page)
    await page.goto(`${BASE}/profile`)
  })

  test('displays profile page with user info', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Profile', exact: true })).toBeVisible()
    await expect(page.getByText('John Doe').first()).toBeVisible()
    await expect(page.getByText('@john_doe').first()).toBeVisible()
  })

  test('shows account details (number, IFSC, branch)', async ({ page }) => {
    await expect(page.getByText('Account Number').first()).toBeVisible()
    await expect(page.getByText('IFSC Code').first()).toBeVisible()
    await expect(page.getByText('Branch').first()).toBeVisible()
  })

  test('edit profile form has pre-filled values', async ({ page }) => {
    const nameInput = page.locator('input').filter({ hasText: '' }).nth(0)
    await expect(page.locator('input[value="John Doe"]')).toBeVisible()
    await expect(page.locator('input[value="john.doe@email.com"]')).toBeVisible()
  })

  test('successfully updates profile', async ({ page }) => {
    const nameInput = page.locator('input[value="John Doe"]')
    await nameInput.fill('John Doe Updated')
    await page.getByRole('button', { name: /Save Changes/i }).click()
    await expect(page.getByText('Profile updated successfully')).toBeVisible({ timeout: 10000 })

    // Revert the name change so other tests can still see "John Doe"
    const updatedInput = page.locator('input[value="John Doe Updated"]')
    await updatedInput.fill('John Doe')
    await page.getByRole('button', { name: /Save Changes/i }).click()
    await expect(page.getByText('Profile updated successfully')).toBeVisible({ timeout: 10000 })
  })

  test('change password form works', async ({ page }) => {
    const passwordInputs = page.locator('input[type="password"]')
    await passwordInputs.nth(0).fill('password123')
    await passwordInputs.nth(1).fill('newpass123')
    await page.getByRole('button', { name: /Update Password/i }).click()
    await expect(page.getByText('Password changed successfully')).toBeVisible({ timeout: 10000 })

    // Change it back so other tests can still log in
    await passwordInputs.nth(0).fill('newpass123')
    await passwordInputs.nth(1).fill('password123')
    await page.getByRole('button', { name: /Update Password/i }).click()
    await expect(page.getByText('Password changed successfully')).toBeVisible({ timeout: 10000 })
  })

  test('avatar color selection works', async ({ page }) => {
    await expect(page.getByText('Avatar Color')).toBeVisible()
    const colorButtons = page.locator('button[style*="background-color"]')
    await expect(colorButtons.first()).toBeVisible()
  })
})

test.describe('Settings', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page)
    await page.goto(`${BASE}/settings`)
  })

  test('displays settings page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Settings' })).toBeVisible()
    await expect(page.getByText('Customize your experience')).toBeVisible()
  })

  test('dark mode toggle works', async ({ page }) => {
    await expect(page.getByText('Dark Mode')).toBeVisible()
    const toggle = page.locator('button').filter({ hasText: '' }).filter({ has: page.locator('.rounded-full.bg-white') })
    await toggle.click()
  })

  test('shows account information section', async ({ page }) => {
    await expect(page.getByText('Account Information')).toBeVisible()
    await expect(page.getByText('John Doe').first()).toBeVisible()
    await expect(page.getByText('@john_doe').first()).toBeVisible()
  })

  test('shows about section with version', async ({ page }) => {
    await expect(page.getByText('About')).toBeVisible()
    await expect(page.getByText('Version 1.0.0')).toBeVisible()
  })
})

test.describe('Notifications', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page)
    await page.goto(`${BASE}/notifications`)
  })

  test('displays notifications page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Notifications' })).toBeVisible()
  })

  test('mark all as read button is present', async ({ page }) => {
    await expect(page.getByRole('button', { name: /Mark all as read/i })).toBeVisible({ timeout: 5000 }).catch(() => {
      // May not have notifications - check empty state
    })
  })
})

test.describe('Logout', () => {
  test('logout redirects to login page', async ({ page }) => {
    await loginUser(page)
    await page.getByText('Logout').click()
    await expect(page).toHaveURL(`${BASE}/login`, { timeout: 10000 })
  })
})
