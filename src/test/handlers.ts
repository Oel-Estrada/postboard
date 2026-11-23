import { http, HttpResponse, type AnyHandler } from 'msw'
import { API_BASE_URL } from '../api/client'
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
]
