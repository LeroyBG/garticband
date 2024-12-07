import { test, expect } from '@playwright/test';

test('has start button', async ({ page }) => {
  await page.goto('http://localhost:5173');

  await expect(page.getByRole('link', { name: 'Create Game'})).toBeVisible();
});

test('start button creates lobby', async ({ page }) => {
  await page.goto('http://localhost:5173')

  await page.getByRole('link', { name: 'Create Game' }).click()

  await expect(page.getByText('Players')).toBeVisible()
})

test('leave button visible', async ({ page }) => {
  await page.goto('http://localhost:5173')

  await page.getByRole('link', { name: 'Create Game' }).click()

  await expect(page.getByRole('link', { name: 'Leave'})).toBeVisible()
})

test('leave button visible', async ({ page }) => {
  await page.goto('http://localhost:5173')

  await page.getByRole('link', { name: 'Create Game' }).click()

  await expect(page.getByText('Copy ID')).toBeVisible()
})

test('leave button works', async ({ page }) => {
  await page.goto('http://localhost:5173')

  await page.getByRole('link', { name: 'Create Game' }).click()

  await page.getByRole('link', { name: 'Leave'}).click()

  await expect(page.getByRole('link', { name: 'Create Game' })).toBeVisible()
})