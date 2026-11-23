import { afterEach, describe, expect, it, vi } from 'vitest'
import { server } from './server'

describe('MSW test server', () => {
  afterEach(() => {
    server.events.removeAllListeners('request:unhandled')
    vi.restoreAllMocks()
  })

  it('rejects requests that have no handler', async () => {
    // MSW logs every unhandled request as an error; silence the expected one.
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const unhandledUrls: string[] = []
    server.events.on('request:unhandled', ({ request }) => {
      unhandledUrls.push(request.url)
    })

    await expect(
      fetch('https://jsonplaceholder.typicode.com/unhandled'),
    ).rejects.toThrow()

    // Proves MSW blocked it: a real network failure would also reject the fetch.
    expect(unhandledUrls).toEqual([
      'https://jsonplaceholder.typicode.com/unhandled',
    ])
  })
})
