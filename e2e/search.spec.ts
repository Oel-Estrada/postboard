import { expect, test } from './test'
import { messages } from '../src/i18n/messages'
import { posts, users } from '../src/test/fixtures'
import { mockApi } from './mockApi'

const [leanne, , clementine] = users

test('finds a user by name and opens their posts', async ({ page }) => {
  await mockApi(page)
  await page.goto('/')

  const search = page.getByRole('searchbox', { name: messages.users.searchLabel })
  const userList = page.getByRole('list').first()

  // Leading spaces and lower case still find both "Clem…" users.
  await search.fill('  clem')
  await expect(userList.getByRole('button')).toHaveCount(2)

  await userList.getByRole('button', { name: clementine.name }).click()
  await expect(page.getByText(messages.posts.empty)).toBeVisible()

  await search.fill('')
  await userList.getByRole('button', { name: leanne.name }).click()
  const leannePosts = posts.filter((post) => post.userId === leanne.id)
  await expect(page.getByRole('article')).toHaveCount(leannePosts.length)
  for (const post of leannePosts) {
    await expect(page.getByRole('heading', { name: post.title })).toBeVisible()
  }
  // The <title> React renders wins over the static one in index.html.
  await expect(page).toHaveTitle(messages.app.pageTitle(leanne.name))
  // Static metadata in index.html: a description, and the browser UI in the paper colour.
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /\w/)
  await expect(page.locator('meta[name="theme-color"]')).toHaveAttribute('content', '#eef1f4')
})
