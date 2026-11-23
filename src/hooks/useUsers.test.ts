import { act, renderHook, waitFor } from '@testing-library/react'
import { delay, http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { API_BASE_URL } from '../api/client'
import { users } from '../test/fixtures'
import { server } from '../test/server'
import { useUsers } from './useUsers'

describe('useUsers', () => {
  it('returns the users after a loading state', async () => {
    const { result } = renderHook(() => useUsers())

    expect(result.current.status).toBe('loading')
    await waitFor(() => {
      expect(result.current).toMatchObject({ status: 'success', data: users })
    })
  })

  it('returns an error and fetches again on retry', async () => {
    server.use(
      http.get(`${API_BASE_URL}/users`, () => new HttpResponse(null, { status: 500 }), {
        once: true,
      }),
    )
    const { result } = renderHook(() => useUsers())

    await waitFor(() => {
      expect(result.current.status).toBe('error')
    })

    act(() => {
      result.current.retry()
    })

    expect(result.current.status).toBe('loading')
    await waitFor(() => {
      expect(result.current).toMatchObject({ status: 'success', data: users })
    })
  })

  it('aborts the request on unmount', async () => {
    let signal: AbortSignal | undefined
    server.use(
      http.get(`${API_BASE_URL}/users`, async ({ request }) => {
        signal = request.signal
        await delay('infinite')
      }),
    )
    const { unmount } = renderHook(() => useUsers())
    await waitFor(() => {
      expect(signal).toBeDefined()
    })

    unmount()

    expect(signal?.aborted).toBe(true)
  })

  it('does not flash an error when StrictMode aborts the first request', async () => {
    // The aborted first request rejects right away. Holding the second
    // response until the test releases it keeps React from batching that
    // rejection with the success, so the test fixes the order, not the clock.
    let release!: () => void
    const gate = new Promise<void>((resolve) => {
      release = resolve
    })
    let reached = false
    server.use(
      http.get(`${API_BASE_URL}/users`, async () => {
        reached = true
        await gate
        return HttpResponse.json(users)
      }),
    )
    const statuses: string[] = []
    const { result } = renderHook(
      () => {
        const state = useUsers()
        statuses.push(state.status)
        return state
      },
      { reactStrictMode: true },
    )
    await waitFor(() => {
      expect(reached).toBe(true)
    })

    release()

    await waitFor(() => {
      expect(result.current.status).toBe('success')
    })
    expect(statuses).not.toContain('error')
  })
})
