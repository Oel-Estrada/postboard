import { afterEach, describe, expect, it } from 'vitest'
import { posts } from '../test/fixtures'
import { server } from '../test/server'
import { API_BASE_URL } from './client'
import { getPostsByUser } from './posts'

describe('getPostsByUser', () => {
  afterEach(() => {
    server.events.removeAllListeners('request:start')
  })

  it('requests GET /posts filtered by userId', async () => {
    const requests: Request[] = []
    server.events.on('request:start', ({ request }) => {
      requests.push(request.clone())
    })

    await expect(getPostsByUser(1)).resolves.toEqual(
      posts.filter(({ userId }) => userId === 1),
    )

    expect(requests.map(({ method, url }) => `${method} ${url}`)).toEqual([
      `GET ${API_BASE_URL}/posts?userId=1`,
    ])
  })
})
