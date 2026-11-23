import { http, HttpResponse, type AnyHandler } from 'msw'
import { API_BASE_URL } from '../api/client'
import type { NewPost } from '../schemas'
import { posts, users } from './fixtures'

/**
 * Default MSW handlers shared by every test. Tests override them per case
 * with `server.use(...)`.
 */
export const handlers: AnyHandler[] = [
  http.get(`${API_BASE_URL}/users`, () => HttpResponse.json(users)),
  // MSW ignores the query string when matching, so `?userId=` is read here.
  http.get(`${API_BASE_URL}/posts`, ({ request }) => {
    const userId = Number(new URL(request.url).searchParams.get('userId'))
    return HttpResponse.json(posts.filter((post) => post.userId === userId))
  }),
  // Like the real API: 201, nothing is stored, and the id is always 101.
  http.post<never, NewPost>(`${API_BASE_URL}/posts`, async ({ request }) => {
    const newPost = await request.json()
    return HttpResponse.json({ ...newPost, id: 101 }, { status: 201 })
  }),
]
