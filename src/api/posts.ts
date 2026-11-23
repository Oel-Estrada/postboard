import { z } from 'zod'
import { postSchema, type NewPost, type Post } from '../schemas'
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
  return z.array(postSchema).parse(await request(`/posts?userId=${userId}`, { signal }))
}

/**
 * Publishes a new post and validates the response. JSONPlaceholder stores
 * nothing and always answers with `id: 101`. It takes no abort signal on
 * purpose: a published post is saved even if its user is no longer shown.
 *
 * @param input - The post to create (`userId`, `title` and `body`).
 * @returns The created post as returned by `POST /posts`.
 * @throws {HttpError} When the response is not ok; network errors pass through.
 * @throws {ZodError} When the response does not match the expected shape.
 */
export async function createPost(input: NewPost): Promise<Post> {
  const created = await request('/posts', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=UTF-8' },
    body: JSON.stringify(input),
  })
  return postSchema.parse(created)
}
