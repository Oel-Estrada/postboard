import { afterEach, describe, expect, it } from 'vitest'
import { posts } from '../test/fixtures'
import { server } from '../test/server'
import { API_BASE_URL } from './client'
import { createPost, getPostsByUser } from './posts'

/** Records a clone of every request, so the handler can still read the original body. */
function recordRequests(): Request[] {
  const requests: Request[] = []
  server.events.on('request:start', ({ request }) => {
    requests.push(request.clone())
  })
  return requests
}

afterEach(() => {
  server.events.removeAllListeners('request:start')
})

describe('getPostsByUser', () => {
  it('requests GET /posts filtered by userId', async () => {
    const requests = recordRequests()

    await expect(getPostsByUser(1)).resolves.toEqual(
      posts.filter(({ userId }) => userId === 1),
    )

    expect(requests.map(({ method, url }) => `${method} ${url}`)).toEqual([
      `GET ${API_BASE_URL}/posts?userId=1`,
    ])
  })
})

describe('createPost', () => {
  it('sends a POST /posts with the new post as JSON', async () => {
    const requests = recordRequests()
    const newPost = { userId: 1, title: 'Hello', body: 'My first post' }

    await expect(createPost(newPost)).resolves.toEqual({ ...newPost, id: 101 })

    expect(requests.map(({ method, url }) => `${method} ${url}`)).toEqual([
      `POST ${API_BASE_URL}/posts`,
    ])
    const [sent] = requests
    expect(sent?.headers.get('Content-Type')).toBe(
      'application/json; charset=UTF-8',
    )
    expect(await sent?.json()).toEqual(newPost)
  })
})
