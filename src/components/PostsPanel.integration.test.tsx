import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent, { type UserEvent } from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { API_BASE_URL } from '../api/client'
import { messages } from '../i18n/messages'
import { writeCreatedPosts } from '../lib/createdPostsStorage'
import type { NewPost } from '../schemas'
import { posts, users } from '../test/fixtures'
import { server } from '../test/server'
import { PostsPanel } from './PostsPanel'

const leanne = users[0]
const leannePosts = posts.filter((post) => post.userId === leanne.id)

/** Holds every POST /posts until the test calls the returned release function. */
function holdPublishing(status = 201) {
  let release!: () => void
  const gate = new Promise<void>((resolve) => {
    release = resolve
  })
  server.use(
    http.post<never, NewPost>(`${API_BASE_URL}/posts`, async ({ request }) => {
      const newPost = await request.json()
      await gate
      return status === 201
        ? HttpResponse.json({ ...newPost, id: 101 }, { status })
        : new HttpResponse(null, { status })
    }),
  )
  return () => {
    release()
  }
}

async function publish(user: UserEvent, title: string, body = `${title} text`) {
  const titleField = screen.getByRole('textbox', { name: messages.form.titleLabel })
  const bodyField = screen.getByRole('textbox', { name: messages.form.bodyLabel })
  // user-event keeps its own copy of what it typed, and React's form reset
  // does not update it: without clear(), a second post would be "FirstSecond".
  await user.clear(titleField)
  await user.type(titleField, title)
  await user.clear(bodyField)
  await user.type(bodyField, body)
  await user.click(screen.getByRole('button', { name: messages.form.submit }))
}

/** Titles of the listed posts, in order. */
function listedTitles() {
  return within(screen.getByRole('list'))
    .getAllByRole('heading', { level: 4 })
    .map((heading) => heading.textContent)
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('PostsPanel', () => {
  it('shows a new post as pending and then above the API posts', async () => {
    const user = userEvent.setup()
    const release = holdPublishing()
    render(<PostsPanel user={leanne} />)

    expect(screen.getByRole('heading', { level: 2, name: leanne.name })).toBeInTheDocument()
    expect(screen.getByText(leanne.email)).toBeInTheDocument()
    expect(screen.getByText(leanne.company.name)).toBeInTheDocument()
    expect(screen.getByText(messages.posts.loading)).toBeInTheDocument()
    // While loading, the user does not look as if they had no posts.
    expect(screen.queryByText(messages.posts.empty)).not.toBeInTheDocument()
    await waitFor(() => {
      expect(listedTitles()).toEqual(leannePosts.map(({ title }) => title))
    })
    expect(screen.queryByText(messages.posts.loading)).not.toBeInTheDocument()

    // Records the most times "Hello" is listed at once: the pending copy and
    // the saved post share a key, so it must never show twice.
    let mostHellos = 0
    const observer = new MutationObserver(() => {
      const hellos = listedTitles().filter((title) => title === 'Hello').length
      mostHellos = Math.max(mostHellos, hellos)
    })
    observer.observe(screen.getByRole('list'), { childList: true, subtree: true })

    await publish(user, 'Hello')

    const pending = await within(screen.getByRole('list')).findByText(messages.posts.pending)
    const pendingArticle = pending.closest('article')
    expect(pendingArticle).toHaveTextContent('Hello')

    release()

    await waitFor(() => {
      expect(within(screen.getByRole('list')).queryByText(messages.posts.pending)).toBeNull()
    })
    observer.disconnect()
    expect(listedTitles()).toEqual(['Hello', ...leannePosts.map(({ title }) => title)])
    expect(mostHellos).toBe(1)
    // Same key, so React updates the pending article instead of replacing it.
    expect(within(screen.getByRole('list')).getAllByRole('article')[0]).toBe(pendingArticle)
  })

  it('shows two created posts even though the API returns the same id', async () => {
    const consoleError = vi.spyOn(console, 'error')
    const user = userEvent.setup()
    render(<PostsPanel user={leanne} />)
    expect(
      await screen.findByRole('heading', {
        level: 3,
        name: messages.posts.postsCount(leannePosts.length),
      }),
    ).toBeInTheDocument()

    await publish(user, 'First')
    // The form clears when publishing ends, not when the pending post shows.
    expect(await screen.findByText(messages.form.published)).toBeInTheDocument()
    await publish(user, 'Second')
    await waitFor(() => {
      expect(listedTitles()).toEqual([
        'Second',
        'First',
        ...leannePosts.map(({ title }) => title),
      ])
    })

    expect(
      screen.getByRole('heading', {
        level: 3,
        name: messages.posts.postsCount(leannePosts.length + 2),
      }),
    ).toBeInTheDocument()
    // React reports repeated keys with console.error.
    expect(consoleError).not.toHaveBeenCalled()
  })

  it('rolls back the pending post and stores nothing when publishing fails', async () => {
    const user = userEvent.setup()
    const release = holdPublishing(500)
    render(<PostsPanel user={leanne} />)
    await waitFor(() => {
      expect(listedTitles()).toHaveLength(leannePosts.length)
    })

    await publish(user, 'Hello')
    expect(await within(screen.getByRole('list')).findByText(messages.posts.pending)).toBeVisible()

    release()

    expect(await screen.findByRole('alert')).toHaveTextContent(messages.form.publishError)
    expect(listedTitles()).toEqual(leannePosts.map(({ title }) => title))
    expect(localStorage.getItem('postboard:created-posts:v1:1')).toBeNull()
  })

  it('shows a posts error and recovers with Try again, keeping created posts', async () => {
    const user = userEvent.setup()
    writeCreatedPosts(localStorage, leanne.id, [
      { userId: leanne.id, id: 101, title: 'Saved before', body: 'Text', key: 'saved' },
    ])
    server.use(
      http.get(`${API_BASE_URL}/posts`, () => new HttpResponse(null, { status: 500 }), {
        once: true,
      }),
    )
    render(<PostsPanel user={leanne} />)

    expect(await screen.findByRole('alert')).toHaveTextContent(messages.posts.loadError)
    expect(listedTitles()).toEqual(['Saved before'])

    await user.click(screen.getByRole('button', { name: messages.common.tryAgain }))

    await waitFor(() => {
      expect(listedTitles()).toEqual(['Saved before', ...leannePosts.map(({ title }) => title)])
    })
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('still publishes when storage is unavailable', async () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
    })
    const user = userEvent.setup()
    render(<PostsPanel user={leanne} />)
    await waitFor(() => {
      expect(listedTitles()).toHaveLength(leannePosts.length)
    })

    await publish(user, 'Hello')

    expect(await screen.findByText(messages.form.published)).toBeInTheDocument()
    expect(listedTitles()).toEqual(['Hello', ...leannePosts.map(({ title }) => title)])
    expect(within(screen.getByRole('list')).queryByText(messages.posts.pending)).toBeNull()
  })
})
