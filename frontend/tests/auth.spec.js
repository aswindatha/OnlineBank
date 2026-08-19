import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5173'

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`)
  })

  test('displays top nav bar with logo and nav tabs', async ({ page }) => {
    await expect(page.locator('header')).toBeVisible()
    await expect(page.getByText('OnlineBank').first()).toBeVisible()
    await expect(page.getByRole('button', { name: 'Personal' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Business' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Wealth' })).toBeVisible()
    await expect(page.getByRole('button', { name: 'Help' })).toBeVisible()
  })

  test('switches marketing content when clicking nav tabs', async ({ page }) => {
    await page.getByRole('button', { name: 'Business' }).click()
    await expect(page.getByText('Business banking')).toBeVisible()
    await expect(page.getByText('Bulk vendor payments')).toBeVisible()

    await page.getByRole('button', { name: 'Wealth' }).click()
    await expect(page.getByText('Wealth management')).toBeVisible()
    await expect(page.getByText('Portfolio performance tracking')).toBeVisible()

    await page.getByRole('button', { name: 'Personal' }).click()
    await expect(page.getByText('Banking reimagined')).toBeVisible()
    await expect(page.getByText('Instant deposits & withdrawals')).toBeVisible()
  })

  test('opens help modal with contact options', async ({ page }) => {
    await page.getByRole('button', { name: 'Help' }).click()
    await expect(page.getByText('How can we help?')).toBeVisible()
    await expect(page.getByText('Call Us')).toBeVisible()
    await expect(page.getByText('1800-123-4567').first()).toBeVisible()
    await expect(page.getByText('support@onlinebank.com')).toBeVisible()
  })

  test('closes help modal on backdrop click', async ({ page }) => {
    await page.getByRole('button', { name: 'Help' }).click()
    await expect(page.getByText('How can we help?')).toBeVisible()
    await page.mouse.click(10, 10)
    await expect(page.getByText('How can we help?')).not.toBeVisible()
  })

  test('footer links open informational modals', async ({ page }) => {
    await page.getByRole('button', { name: 'Privacy Policy' }).click()
    await expect(page.getByText('Privacy Policy').nth(1)).toBeVisible()
    await expect(page.getByText('demo banking application')).toBeVisible()
  })

  test('Create account button navigates to register', async ({ page }) => {
    await page.getByRole('button', { name: 'Create account' }).click()
    await expect(page).toHaveURL(`${BASE}/register`)
  })

  test('Forgot password link navigates to forgot-password', async ({ page }) => {
    await page.getByRole('link', { name: 'Forgot password?' }).click()
    await expect(page).toHaveURL(`${BASE}/forgot-password`)
  })

  test('shows error on invalid credentials', async ({ page }) => {
    await page.getByLabel('Username').fill('wronguser')
    await page.getByLabel('Password').fill('wrongpass')
    await page.locator('button[type="submit"]').click()
    await expect(page.getByText(/Invalid username or password/i)).toBeVisible({ timeout: 10000 })
  })

  test('logs in as regular user and redirects to dashboard', async ({ page }) => {
    await page.getByLabel('Username').fill('john_doe')
    await page.getByLabel('Password').fill('password123')
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL(`${BASE}/dashboard`, { timeout: 10000 })
    await expect(page.getByText('Welcome back, John Doe')).toBeVisible()
  })

  test('logs in as admin and redirects to admin panel', async ({ page }) => {
    await page.getByLabel('Username').fill('admin')
    await page.getByLabel('Password').fill('admin123')
    await page.locator('button[type="submit"]').click()
    await expect(page).toHaveURL(`${BASE}/admin`, { timeout: 10000 })
    await expect(page.getByText('Admin Panel')).toBeVisible()
  })
})

test.describe('Register Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/register`)
  })

  test('displays registration form with all fields', async ({ page }) => {
    await expect(page.getByText('Create Account').first()).toBeVisible()
    await expect(page.getByLabel('Username')).toBeVisible()
    await expect(page.getByLabel('Password')).toBeVisible()
    await expect(page.getByLabel('Full Name')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Phone')).toBeVisible()
    await expect(page.getByLabel('Account Type')).toBeVisible()
    await expect(page.getByLabel('Address')).toBeVisible()
  })

  test('back to login button works', async ({ page }) => {
    await page.getByText('Back to login').click()
    await expect(page).toHaveURL(`${BASE}/login`)
  })

  test('Sign In button in nav navigates to login', async ({ page }) => {
    await page.getByRole('button', { name: 'Sign In' }).click()
    await expect(page).toHaveURL(`${BASE}/login`)
  })

  test('shows error for duplicate username', async ({ page }) => {
    await page.getByLabel('Username').fill('john_doe')
    await page.getByLabel('Password').fill('test1234')
    await page.getByLabel('Full Name').fill('Test User')
    await page.getByLabel('Email').fill('test@test.com')
    await page.getByLabel('Phone').fill('1234567890')
    await page.getByLabel('Address').fill('123 Test Street')
    await page.locator('button[type="submit"]').click()
    await expect(page.getByText(/already exists|Registration failed/i)).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Forgot Password Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/forgot-password`)
  })

  test('displays forgot password form', async ({ page }) => {
    await expect(page.getByText('Forgot Password')).toBeVisible()
    await expect(page.getByText('Reset your account password')).toBeVisible()
    await expect(page.getByLabel('Username')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
  })

  test('back to login button works', async ({ page }) => {
    await page.getByText('Back to login').click()
    await expect(page).toHaveURL(`${BASE}/login`)
  })

  test('shows error for invalid username/email combo', async ({ page }) => {
    await page.getByLabel('Username').fill('nonexistent')
    await page.getByLabel('Email').fill('wrong@email.com')
    await page.locator('button[type="submit"]').click()
    await expect(page.getByText(/No account found|reset failed/i)).toBeVisible({ timeout: 10000 })
  })

  test('successfully resets password for valid user', async ({ page }) => {
    await page.getByLabel('Username').fill('john_doe')
    await page.getByLabel('Email').fill('john.doe@email.com')
    await page.locator('button[type="submit"]').click()
    await expect(page.getByText('Password reset successful!')).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('temporary password')).toBeVisible()
  })
})
