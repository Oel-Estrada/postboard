import { expect, test, type Page } from '@playwright/test'
import { messages } from '../src/i18n/messages'
import { users } from '../src/test/fixtures'
import { mockApi } from './mockApi'

test.use({ viewport: { width: 320, height: 640 } })

const clementina = users[3]

function hasHorizontalScroll(page: Page): Promise<boolean> {
  return page.evaluate(
    () => document.documentElement.scrollWidth > document.documentElement.clientWidth,
  )
}

test('goes from the list to the posts and back on a 320px screen', async ({ page }) => {
  await mockApi(page)
  await page.goto('/')

  // includeHidden: the same list is found while it is hidden on the detail view.
  const userList = page.getByRole('list', { includeHidden: true }).first()
  const search = page.getByRole('searchbox', { name: messages.users.searchLabel })
  await expect(userList.getByRole('button')).toHaveCount(users.length)
  expect(await hasHorizontalScroll(page)).toBe(false)

  await search.fill('clem')
  await userList.getByRole('button', { name: clementina.name }).click()

  const detailHeading = page.getByRole('heading', {
    level: 2,
    name: clementina.name,
    includeHidden: true,
  })
  await expect(userList).toBeHidden()
  await expect(detailHeading).toBeFocused()
  expect(await hasHorizontalScroll(page)).toBe(false)

  await page.getByRole('button', { name: messages.app.backToUsers }).click()

  await expect(detailHeading).toBeHidden()
  await expect(userList.getByRole('button', { name: clementina.name })).toBeFocused()
  await expect(search).toHaveValue('clem')
})
