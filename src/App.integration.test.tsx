import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { API_BASE_URL } from './api/client'
import { messages } from './i18n/messages'
import { readCreatedPosts } from './lib/createdPostsStorage'
import type { NewPost, User } from './schemas'
import { posts, users } from './test/fixtures'
import { server } from './test/server'

const [leanne, ervin] = users
const buttonName = (user: User) => `${user.name} ${messages.users.usernameHandle(user.username)}`
const ervinButtonName = buttonName(ervin)

/** Titles of the posts in the user detail, in order. */
function listedTitles() {
  // The detail is the only named region; the users column has its own h2.
  const detail = screen.getByRole('region')
  return within(detail)
    .queryAllByRole('heading', { level: 4 })
    .map((heading) => heading.textContent)
}

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('opens the selected user and goes back to the list on a narrow viewport', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({ matches: true, media: query })),
    )
    const user = userEvent.setup()
    render(<App />)

    expect(
      screen.getByRole('heading', { level: 1, name: messages.app.title }),
    ).toBeInTheDocument()
    expect(screen.getByText(messages.app.selectUser)).toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: ervinButtonName }))

    expect(screen.getByRole('heading', { level: 2, name: ervin.name })).toHaveFocus()

    await user.click(screen.getByRole('button', { name: messages.app.backToUsers }))

    expect(
      screen.queryByRole('button', { name: messages.app.backToUsers }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { current: true })).toHaveAccessibleName(ervinButtonName)
    expect(screen.getByRole('button', { current: true })).toHaveFocus()
  })

  // Without a matchMedia stub this runs as desktop, through isNarrowViewport's fallback.
  it('shows the selected user in the page title', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(document.title).toBe(messages.app.title)

    const ervinButton = await screen.findByRole('button', { name: ervinButtonName })
    await user.click(ervinButton)

    expect(document.title).toBe(messages.app.pageTitle(ervin.name))
    // On desktop the list stays visible, so focus stays on the chosen user.
    expect(ervinButton).toHaveFocus()
  })

  it('stores the post for the original user when switching users while publishing', async () => {
    let release!: () => void
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    server.use(
      http.post<never, NewPost>(`${API_BASE_URL}/posts`, async ({ request }) => {
        const newPost = await request.json()
        await gate
        return HttpResponse.json({ ...newPost, id: 101 }, { status: 201 })
      }),
    )
    const user = userEvent.setup()
    render(<App />)
    const leannePosts = posts.filter((post) => post.userId === leanne.id).map(({ title }) => title)
    const ervinPosts = posts.filter((post) => post.userId === ervin.id).map(({ title }) => title)

    await user.click(await screen.findByRole('button', { name: buttonName(leanne) }))
    await waitFor(() => {
      expect(listedTitles()).toEqual(leannePosts)
    })
    await user.type(screen.getByRole('textbox', { name: messages.form.titleLabel }), 'Hello')
    await user.type(screen.getByRole('textbox', { name: messages.form.bodyLabel }), 'World')
    await user.click(screen.getByRole('button', { name: messages.form.submit }))
    expect(await screen.findByRole('heading', { level: 4, name: 'Hello' })).toBeInTheDocument()

    // Ervin is chosen while Leanne's post is still publishing.
    await user.click(screen.getByRole('button', { name: ervinButtonName }))
    await waitFor(() => {
      expect(listedTitles()).toEqual(ervinPosts)
    })

    release()
    await waitFor(() => {
      expect(readCreatedPosts(localStorage, leanne.id)).toHaveLength(1)
    })
    expect(listedTitles()).toEqual(ervinPosts)
    expect(readCreatedPosts(localStorage, ervin.id)).toEqual([])

    await user.click(screen.getByRole('button', { name: buttonName(leanne) }))

    await waitFor(() => {
      expect(listedTitles()).toEqual(['Hello', ...leannePosts])
    })
  })
})
