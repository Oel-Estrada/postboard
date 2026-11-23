import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { readCreatedPosts, writeCreatedPosts } from '../lib/createdPostsStorage'
import type { PostEntry } from '../schemas'
import { useCreatedPosts } from './useCreatedPosts'

function entry(userId: number, title: string): PostEntry {
  return { userId, id: 101, title, body: `${title} text`, key: `key-${title}` }
}

describe('useCreatedPosts', () => {
  it('starts with the stored posts and keeps new ones after remounting', () => {
    const stored = entry(1, 'Stored')
    const created = entry(1, 'Created')
    writeCreatedPosts(localStorage, 1, [stored])

    const first = renderHook(() => useCreatedPosts(1))
    expect(first.result.current.createdPosts).toEqual([stored])

    act(() => {
      first.result.current.saveCreatedPost(created)
    })

    expect(first.result.current.createdPosts).toEqual([created, stored])
    first.unmount()

    const second = renderHook(() => useCreatedPosts(1))
    expect(second.result.current.createdPosts).toEqual([created, stored])
  })

  it('stores the post under its own userId even after unmounting', () => {
    // The panel already shows user 2 when the post of user 1 finishes publishing.
    const { result, unmount } = renderHook(() => useCreatedPosts(2))
    const { saveCreatedPost } = result.current
    unmount()

    // Two posts: once an update is pending, React no longer runs state
    // updaters of an unmounted component, so a write inside one would be lost.
    const first = entry(1, 'First')
    const second = entry(1, 'Second')
    saveCreatedPost(first)
    saveCreatedPost(second)

    expect(readCreatedPosts(localStorage, 1)).toEqual([second, first])
    expect(readCreatedPosts(localStorage, 2)).toEqual([])
  })
})
