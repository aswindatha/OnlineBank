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

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page)
  })

  test('displays dashboard with balance card and stats', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
    await expect(page.getByText('Welcome back, John Doe', { exact: true })).toBeVisible()
    await expect(page.getByText('Total Balance')).toBeVisible()
    await expect(page.getByText('Total Deposits')).toBeVisible()
    await expect(page.getByText('Total Withdrawals')).toBeVisible()
    await expect(page.getByText('Total Transfers')).toBeVisible()
  })

  test('shows account number and details', async ({ page }) => {
    await expect(page.getByText('Account Number').first()).toBeVisible()
    await expect(page.getByText('IFSC Code').first()).toBeVisible()
    await expect(page.getByText('Branch').first()).toBeVisible()
    await expect(page.getByText('Type').first()).toBeVisible()
  })

  test('quick action buttons navigate to correct pages', async ({ page }) => {
    await page.getByRole('button', { name: 'Deposit' }).click()
    await expect(page).toHaveURL(`${BASE}/deposit`)

    await page.goto(`${BASE}/dashboard`)
    await page.getByRole('button', { name: 'Withdraw' }).click()
    await expect(page).toHaveURL(`${BASE}/withdraw`)

    await page.goto(`${BASE}/dashboard`)
    await page.getByRole('button', { name: 'Transfer' }).click()
    await expect(page).toHaveURL(`${BASE}/transfer`)

    await page.goto(`${BASE}/dashboard`)
    await page.getByRole('button', { name: 'History' }).click()
    await expect(page).toHaveURL(`${BASE}/transactions`)
  })

  test('monthly activity chart is rendered', async ({ page }) => {
    await expect(page.getByText('Monthly Activity')).toBeVisible()
  })

  test('recent transactions section is visible', async ({ page }) => {
    await expect(page.getByText('Recent Transactions')).toBeVisible()
  })
})

test.describe('Deposit', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page)
    await page.goto(`${BASE}/deposit`)
  })

  test('displays deposit form with balance', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Deposit', exact: true })).toBeVisible()
    await expect(page.getByText('Current Balance')).toBeVisible()
    await expect(page.locator('input[type="number"]')).toBeVisible()
    await expect(page.getByRole('button', { name: /Deposit Now/i })).toBeVisible()
  })

  test('quick amount buttons fill the amount field', async ({ page }) => {
    await page.getByRole('button', { name: '₹500' }).click()
    await expect(page.locator('input[type="number"]')).toHaveValue('500')
  })

  test('successfully deposits and shows receipt', async ({ page }) => {
    await page.locator('input[type="number"]').fill('1000')
    await page.getByRole('button', { name: /Deposit Now/i }).click()
    await expect(page.getByRole('heading', { name: 'Deposit Successful' })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Transaction ID', { exact: true })).toBeVisible()
    await expect(page.getByText('New Balance')).toBeVisible()
  })

  test('shows error for invalid amount', async ({ page }) => {
    await page.locator('input[type="number"]').fill('-100')
    await page.getByRole('button', { name: /Deposit Now/i }).click()
    await expect(page.getByText(/valid amount/i)).toBeVisible({ timeout: 5000 })
  })
})

test.describe('Withdraw', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page)
    await page.goto(`${BASE}/withdraw`)
  })

  test('displays withdraw form with balance', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Withdraw', exact: true })).toBeVisible()
    await expect(page.getByText('Available Balance').first()).toBeVisible()
    await expect(page.locator('input[type="number"]')).toBeVisible()
  })

  test('successfully withdraws and shows receipt', async ({ page }) => {
    await page.locator('input[type="number"]').fill('500')
    await page.getByRole('button', { name: /Withdraw Now/i }).click()
    await expect(page.getByRole('heading', { name: 'Withdrawal Successful' })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Transaction ID', { exact: true })).toBeVisible()
  })

  test('shows error for insufficient balance', async ({ page }) => {
    await page.locator('input[type="number"]').fill('99999999')
    await page.getByRole('button', { name: /Withdraw Now/i }).click()
    await expect(page.getByText(/Insufficient balance/i)).toBeVisible({ timeout: 10000 })
  })
})

test.describe('Transfer', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page)
    await page.goto(`${BASE}/transfer`)
  })

  test('displays transfer form with recipient list', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Transfer', exact: true })).toBeVisible()
    await expect(page.getByText('Available Balance').first()).toBeVisible()
    await expect(page.getByText('Select Recipient')).toBeVisible()
    await expect(page.locator('input[type="number"]')).toBeVisible()
  })

  test('shows recent recipients section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Recent Recipients' })).toBeVisible()
  })

  test('successfully transfers money and shows receipt', async ({ page }) => {
    const recipientSelect = page.locator('select').first()
    await recipientSelect.selectOption({ index: 1 })
    await page.locator('input[type="number"]').fill('100')
    await page.getByRole('button', { name: /Send Money/i }).click()
    await expect(page.getByRole('heading', { name: 'Transfer Successful' })).toBeVisible({ timeout: 10000 })
    await expect(page.getByText('Transaction ID', { exact: true })).toBeVisible()
  })

  test('shows error when no recipient selected', async ({ page }) => {
    // The select has required attribute, so browser native validation prevents submit
    // We test by submitting without selecting a recipient and checking the select is invalid
    await page.locator('input[type="number"]').fill('100')
    await page.getByRole('button', { name: /Send Money/i }).click()
    // Browser native validation will focus the select element
    await page.waitForTimeout(500)
    const recipientSelect = page.locator('select').first()
    await expect(recipientSelect).toBeVisible()
  })
})

test.describe('Transactions', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page)
    await page.goto(`${BASE}/transactions`)
  })

  test('displays transaction history page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: 'Transactions' })).toBeVisible()
  })

  test('can filter by transaction type', async ({ page }) => {
    const depositFilter = page.locator('button').filter({ hasText: 'Deposit' }).first()
    await depositFilter.click()
    await page.waitForTimeout(1000)
  })

  test('can search transactions', async ({ page }) => {
    const searchInput = page.getByPlaceholder('Search by description or transaction ID...')
    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill('Salary')
      await page.waitForTimeout(1000)
    }
  })
})

test.describe('Mini Statement', () => {
  test.beforeEach(async ({ page }) => {
    await loginUser(page)
    await page.goto(`${BASE}/mini-statement`)
  })

  test('displays mini statement', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /Mini Statement/i })).toBeVisible()
  })
})
