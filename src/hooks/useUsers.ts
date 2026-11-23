import { useCallback, useEffect, useState } from 'react'
import { getUsers } from '../api/users'
import type { User } from '../schemas'
import type { AsyncState } from '../types'

/**
 * Loads every user on mount and aborts the request on unmount.
 *
 * @returns The load state of the users and `retry`, which goes back to
 * `loading` and requests them again.
 */
export function useUsers(): AsyncState<User[]> & { retry: () => void } {
  const [state, setState] = useState<AsyncState<User[]>>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    getUsers(controller.signal).then(
      (data) => {
        if (!controller.signal.aborted) setState({ status: 'success', data })
      },
      (error: unknown) => {
        if (controller.signal.aborted) return
        setState({
          status: 'error',
          error: error instanceof Error ? error : new Error(String(error)),
        })
      },
    )

    return () => {
      controller.abort()
    }
  }, [attempt])

  const retry = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((current) => current + 1)
  }, [])

  return { ...state, retry }
}
