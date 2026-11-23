import { useCallback, useState } from 'react'
import { getBrowserStorage, readCreatedPosts, writeCreatedPosts } from '../lib/createdPostsStorage'
import type { PostEntry } from '../schemas'

/**
 * Posts the user created for `userId`, kept in localStorage because the API
 * stores nothing. Storage is read once, on mount.
 *
 * @param userId - Id of the user whose created posts are shown.
 * @returns `createdPosts`, newest first, and `saveCreatedPost`, which stores a
 * post under its own `entry.userId` (also after unmounting) and shows it
 * first. It never throws: if storage fails, the post stays in memory only.
 */
export function useCreatedPosts(userId: number): {
  createdPosts: PostEntry[]
  saveCreatedPost: (entry: PostEntry) => void
} {
  const [createdPosts, setCreatedPosts] = useState(() =>
    readCreatedPosts(getBrowserStorage(), userId),
  )

  const saveCreatedPost = useCallback((entry: PostEntry) => {
    // Written outside any state updater: React skips updaters once the
    // component has unmounted, and the post would be lost.
    const storage = getBrowserStorage()
    writeCreatedPosts(storage, entry.userId, [entry, ...readCreatedPosts(storage, entry.userId)])
    setCreatedPosts((current) => [entry, ...current])
  }, [])

  return { createdPosts, saveCreatedPost }
}
