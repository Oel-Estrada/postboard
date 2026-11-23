import { http, HttpResponse, type AnyHandler } from 'msw'
import { API_BASE_URL } from '../api/client'
import { users } from './fixtures'

/**
 * Default MSW handlers shared by every test. Tests override them per case
 * with `server.use(...)`.
 */
export const handlers: AnyHandler[] = [
  http.get(`${API_BASE_URL}/users`, () => HttpResponse.json(users)),
]
