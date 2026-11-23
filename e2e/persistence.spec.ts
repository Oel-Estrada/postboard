import { expect, test } from './test'
import { messages } from '../src/i18n/messages'
import { posts, users } from '../src/test/fixtures'
import { mockApi } from './mockApi'

const [leanne] = users
const newPost = { title: 'Notes from the office', body: 'Filed under L, next to the stapler.' }

test('keeps a published post after reloading the page', async ({ page }) => {
  await mockApi(page)
  await page.goto('/')

  await page.getByRole('button', { name: leanne.name }).click()
  await page.getByRole('textbox', { name: messages.form.titleLabel, exact: true }).fill(newPost.title)
  await page.getByRole('textbox', { name: messages.form.bodyLabel, exact: true }).fill(newPost.body)
  await page.getByRole('button', { name: messages.form.submit }).click()

  // Wait until it is stored, not just shown as pending.
  await expect(page.getByText(messages.form.published)).toBeVisible()
  const firstPost = page.getByRole('article').first()
  await expect(firstPost.getByRole('heading')).toHaveText(newPost.title)

  await page.reload()
  await page.getByRole('button', { name: leanne.name }).click()

  const leannePosts = posts.filter((post) => post.userId === leanne.id)
  await expect(page.getByRole('article')).toHaveCount(leannePosts.length + 1)
  await expect(firstPost.getByRole('heading')).toHaveText(newPost.title)
  await expect(firstPost).not.toHaveAttribute('aria-busy')
})
