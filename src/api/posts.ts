import { z } from 'zod'
import { postSchema, type Post } from '../schemas'
import { request } from './client'

/**
 * Fetches the posts of one user and validates the response.
 *
 * @param userId - Id of the user whose posts are requested.
 * @param signal - Aborts the request when it becomes stale (for example, the user changes).
 * @returns The posts from `GET /posts?userId={userId}`.
 * @throws {HttpError} When the response is not ok; network and abort errors pass through.
 * @throws {ZodError} When the response does not match the expected shape.
 */
export async function getPostsByUser(userId: number, signal?: AbortSignal): Promise<Post[]> {
  return z.array(postSchema).parse(await request<unknown>(`/posts?userId=${userId}`, { signal }))
}
