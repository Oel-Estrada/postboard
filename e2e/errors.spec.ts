import { expect, test } from './test'
import { messages } from '../src/i18n/messages'
import { users } from '../src/test/fixtures'
import { mockApi } from './mockApi'

// The browser logs the 500 this spec causes on purpose; nothing else may be logged.
test.use({ allowedConsoleErrors: [/Failed to load resource: .* status of 500/] })

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
  // Try again disappeared with the alert; focus goes to the search box, not to <body>.
  await expect(page.getByRole('searchbox', { name: messages.users.searchLabel })).toBeFocused()
})
