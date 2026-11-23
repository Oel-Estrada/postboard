import { act, renderHook, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { API_BASE_URL } from '../api/client'
import { posts } from '../test/fixtures'
import { server } from '../test/server'
import { useUserPosts } from './useUserPosts'

/** The fixture posts of one user, with the keys the hook gives them. */
function entriesOf(userId: number) {
  return posts
    .filter((post) => post.userId === userId)
    .map((post) => ({ ...post, key: `post-${post.id}` }))
}

describe('useUserPosts', () => {
  it('returns the user posts with stable keys after a loading state', async () => {
    const { result } = renderHook(() => useUserPosts(1))

    expect(result.current.status).toBe('loading')
    await waitFor(() => {
      expect(result.current).toMatchObject({ status: 'success', data: entriesOf(1) })
    })
    const { data } = result.current as { data: { key: string }[] }
    expect(data.map(({ key }) => key)).toEqual(['post-1', 'post-2'])
  })

  it('aborts the previous request when userId changes', async () => {
    // Both users answer only when the test releases them, so the test fixes
    // the order: user 1 is aborted, user 2 answers, then user 1's late answer.
    let releaseFirst!: () => void
    const firstGate = new Promise<void>((resolve) => {
      releaseFirst = resolve
    })
    let releaseSecond!: () => void
    const secondGate = new Promise<void>((resolve) => {
      releaseSecond = resolve
    })
    let firstSignal: AbortSignal | undefined
    let firstAnswered = false
    let secondReached = false
    server.use(
      http.get(`${API_BASE_URL}/posts`, async ({ request }) => {
        const userId = Number(new URL(request.url).searchParams.get('userId'))
        if (userId === 1) {
          firstSignal = request.signal
          await firstGate
          firstAnswered = true
        } else {
          secondReached = true
          await secondGate
        }
        return HttpResponse.json(posts.filter((post) => post.userId === userId))
      }),
    )
    const statuses: string[] = []
    const { result, rerender } = renderHook(
      ({ userId }) => {
        const state = useUserPosts(userId)
        statuses.push(state.status)
        return state
      },
      { initialProps: { userId: 1 } },
    )
    await waitFor(() => {
      expect(firstSignal).toBeDefined()
    })

    rerender({ userId: 2 })

    // The aborted request of user 1 rejects now; it must not show as an error.
    await waitFor(() => {
      expect(secondReached).toBe(true)
    })
    releaseSecond()
    await waitFor(() => {
      expect(result.current).toMatchObject({ status: 'success', data: entriesOf(2) })
    })
    expect(firstSignal?.aborted).toBe(true)

    releaseFirst()
    await waitFor(() => {
      expect(firstAnswered).toBe(true)
    })

    expect(result.current).toMatchObject({ status: 'success', data: entriesOf(2) })
    expect(statuses).not.toContain('error')
  })

  it('returns an error and fetches again on retry', async () => {
    server.use(
      http.get(`${API_BASE_URL}/posts`, () => new HttpResponse(null, { status: 500 }), {
        once: true,
      }),
    )
    const { result } = renderHook(() => useUserPosts(1))

    await waitFor(() => {
      expect(result.current.status).toBe('error')
    })

    act(() => {
      result.current.retry()
    })

    expect(result.current.status).toBe('loading')
    await waitFor(() => {
      expect(result.current).toMatchObject({ status: 'success', data: entriesOf(1) })
    })
  })
})
