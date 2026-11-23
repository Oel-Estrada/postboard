import { render, screen, within } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { messages } from '../i18n/messages'
import type { DisplayPost } from '../types'
import { PostList } from './PostList'

function post(overrides: Partial<DisplayPost>): DisplayPost {
  return { userId: 1, id: 1, title: 'Title', body: 'Text', key: 'post-1', ...overrides }
}

describe('PostList', () => {
  it('renders markup in titles and text as plain text', () => {
    const markup = '<img src=x onerror=alert(1)>'
    render(<PostList posts={[post({ title: markup, body: `<b>${markup}</b>` })]} />)

    expect(screen.getByRole('heading', { level: 4, name: markup })).toBeInTheDocument()
    expect(screen.getByText(`<b>${markup}</b>`)).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('marks pending posts as publishing', () => {
    render(
      <PostList
        posts={[
          post({ title: 'Pending', key: 'new', pending: true }),
          post({ title: 'Published', key: 'post-1' }),
        ]}
      />,
    )

    const [pending, published] = screen.getAllByRole('article')
    expect(pending).toHaveAttribute('aria-busy', 'true')
    expect(within(pending).getByText(messages.posts.pending)).toBeInTheDocument()
    expect(published).not.toHaveAttribute('aria-busy')
    expect(within(published).queryByText(messages.posts.pending)).not.toBeInTheDocument()
  })

  it('shows an empty message when there are no posts', () => {
    render(<PostList posts={[]} />)

    expect(screen.getByText(messages.posts.empty)).toBeInTheDocument()
    expect(screen.queryByRole('list')).not.toBeInTheDocument()
  })
})
