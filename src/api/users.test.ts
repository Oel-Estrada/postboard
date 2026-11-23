import { http, HttpResponse } from 'msw'
import { afterEach, describe, expect, it } from 'vitest'
import { ZodError } from 'zod'
import { users } from '../test/fixtures'
import { server } from '../test/server'
import { API_BASE_URL } from './client'
import { getUsers } from './users'

describe('getUsers', () => {
  afterEach(() => {
    server.events.removeAllListeners('request:start')
  })

  it('requests GET /users and returns the users', async () => {
    const requests: Request[] = []
    server.events.on('request:start', ({ request }) => {
      requests.push(request.clone())
    })

    await expect(getUsers()).resolves.toEqual(users)

    expect(requests.map(({ method, url }) => `${method} ${url}`)).toEqual([
      `GET ${API_BASE_URL}/users`,
    ])
  })

  it('rejects a response with an unexpected shape', async () => {
    server.use(
      http.get(`${API_BASE_URL}/users`, () =>
        HttpResponse.json([{ id: '1', name: 'Leanne Graham' }]),
      ),
    )

    await expect(getUsers()).rejects.toBeInstanceOf(ZodError)
  })
})
