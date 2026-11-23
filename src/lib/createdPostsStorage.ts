import { postEntrySchema, type PostEntry } from '../schemas'

// The API stores nothing, so the posts the user creates are kept in
// localStorage. Every access is defensive: storage can be unavailable, full or
// blocked, and what is stored can be corrupt or from an older format.

/** Versioned prefix: a new format gets a new version instead of reading old data. */
export const CREATED_POSTS_KEY_PREFIX = 'postboard:created-posts:v1'

/**
 * @param userId - Id of the user who created the posts.
 * @returns The storage key of that user's created posts.
 */
export function getCreatedPostsKey(userId: number): string {
  return `${CREATED_POSTS_KEY_PREFIX}:${userId}`
}

/**
 * @param value - Anything read from storage.
 * @returns Whether `value` is a valid {@link PostEntry}.
 */
export function isPostEntry(value: unknown): value is PostEntry {
  return postEntrySchema.safeParse(value).success
}

/**
 * @returns `window.localStorage`, or `null` when even accessing it throws
 * (for example a `SecurityError` when storage is blocked).
 */
export function getBrowserStorage(): Storage | null {
  try {
    return window.localStorage
  } catch {
    return null
  }
}

/**
 * Reads the posts a user created. Never throws.
 *
 * @param storage - Where the posts are kept, or `null` when it is unavailable.
 * @param userId - Id of the user who created them.
 * @returns The valid entries of that user; `[]` when there are none, the data
 * is corrupt or storage fails.
 */
export function readCreatedPosts(storage: Storage | null, userId: number): PostEntry[] {
  let stored: unknown
  try {
    stored = JSON.parse(storage?.getItem(getCreatedPostsKey(userId)) ?? '[]')
  } catch {
    return []
  }
  if (!Array.isArray(stored)) return []
  return stored.filter(isPostEntry).filter((entry) => entry.userId === userId)
}

/**
 * Replaces the posts a user created. Never throws.
 *
 * @param storage - Where the posts are kept, or `null` when it is unavailable.
 * @param userId - Id of the user who created them.
 * @param posts - Every created post of that user, newest first.
 * @returns `true` when they were saved; `false` when storage is unavailable,
 * full or blocked.
 */
export function writeCreatedPosts(
  storage: Storage | null,
  userId: number,
  posts: PostEntry[],
): boolean {
  if (!storage) return false
  try {
    storage.setItem(getCreatedPostsKey(userId), JSON.stringify(posts))
    return true
  } catch {
    return false
  }
}
