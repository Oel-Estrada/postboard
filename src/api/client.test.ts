import { delay, http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'
import { server } from '../test/server'
import { API_BASE_URL, HttpError, request } from './client'

const THINGS_URL = `${API_BASE_URL}/things`

describe('request', () => {
  it('resolves with the parsed JSON body', async () => {
    server.use(http.get(THINGS_URL, () => HttpResponse.json({ id: 1 })))

    await expect(request('/things')).resolves.toEqual({ id: 1 })
  })

  it('throws an HttpError with the status when the response is not ok', async () => {
    server.use(
      http.get(THINGS_URL, () => new HttpResponse(null, { status: 500 })),
    )

    const error = await request('/things').catch((reason: unknown) => reason)

    expect(error).toBeInstanceOf(HttpError)
    expect(error).toHaveProperty('status', 500)
  })

  it('rejects when the network fails', async () => {
    server.use(http.get(THINGS_URL, () => HttpResponse.error()))

    const error = await request('/things').catch((reason: unknown) => reason)

    expect(error).toBeInstanceOf(Error)
    expect(error).not.toBeInstanceOf(HttpError)
  })

  it('rejects with an AbortError when the signal is aborted', async () => {
    server.use(
      http.get(THINGS_URL, async () => {
        await delay()
        return HttpResponse.json({ id: 1 })
      }),
    )
    const controller = new AbortController()

    const pending = request('/things', { signal: controller.signal })
    controller.abort()

    await expect(pending).rejects.toHaveProperty('name', 'AbortError')
  })
})
