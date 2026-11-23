import { useCallback, useEffect, useState } from 'react'
import { getPostsByUser } from '../api/posts'
import type { PostEntry } from '../schemas'
import type { AsyncState } from '../types'

/**
 * Loads the posts of a user, aborting the previous request when `userId`
 * changes or the component unmounts.
 *
 * @param userId - Id of the user whose posts are loaded.
 * @returns The load state of the posts, each keyed `post-{id}`, and `retry`,
 * which goes back to `loading` and requests them again.
 */
export function useUserPosts(userId: number): AsyncState<PostEntry[]> & { retry: () => void } {
  const [state, setState] = useState<AsyncState<PostEntry[]>>({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    const controller = new AbortController()

    getPostsByUser(userId, controller.signal).then(
      (posts) => {
        if (controller.signal.aborted) return
        setState({
          status: 'success',
          data: posts.map((post) => ({ ...post, key: `post-${post.id}` })),
        })
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
  }, [userId, attempt])

  const retry = useCallback(() => {
    setState({ status: 'loading' })
    setAttempt((current) => current + 1)
  }, [])

  return { ...state, retry }
}
