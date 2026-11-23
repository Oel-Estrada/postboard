import { expect, test } from '@playwright/test'
import { messages } from '../src/i18n/messages'
import { users } from '../src/test/fixtures'
import { mockApi } from './mockApi'

test('recovers from an API error with Try again', async ({ page }) => {
  const api = await mockApi(page, { usersFailing: true })
  await page.goto('/')

  const loadError = page.getByRole('alert').filter({ hasText: messages.users.loadError })
  await expect(loadError).toBeVisible()

  // The API comes back right before the retry, however many requests the app made.
  api.setUsersFailing(false)
  await loadError.getByRole('button', { name: messages.common.tryAgain }).click()

  await expect(loadError).toBeHidden()
  await expect(page.getByRole('list').first().getByRole('button')).toHaveCount(users.length)
})
