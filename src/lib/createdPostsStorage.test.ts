import { afterEach, describe, expect, it, vi } from 'vitest'
import type { PostEntry } from '../schemas'
import { getBrowserStorage, readCreatedPosts, writeCreatedPosts } from './createdPostsStorage'

const created: PostEntry = {
  userId: 1,
  id: 101,
  title: 'Hello',
  body: 'My first post',
  key: '0b6a6c3e-8f3e-4c1a-9a57-3f4f0a1d2b11',
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('createdPostsStorage', () => {
  it('writes posts under a versioned key per user and reads them back', () => {
    expect(writeCreatedPosts(localStorage, 1, [created])).toBe(true)

    expect(JSON.parse(localStorage.getItem('postboard:created-posts:v1:1') ?? 'null')).toEqual([
      created,
    ])
    expect(readCreatedPosts(localStorage, 1)).toEqual([created])
    expect(readCreatedPosts(localStorage, 2)).toEqual([])
  })

  it('ignores corrupt data and keeps only valid entries of the user', () => {
    const key = 'postboard:created-posts:v1:1'
    for (const corrupt of ['{not json', '{}', 'null']) {
      localStorage.setItem(key, corrupt)
      expect(readCreatedPosts(localStorage, 1)).toEqual([])
    }

    localStorage.setItem(
      key,
      JSON.stringify([
        created,
        { ...created, userId: 2 },
        { ...created, id: '101' },
        { title: 'No id, body or key' },
        'a string',
        null,
      ]),
    )

    expect(readCreatedPosts(localStorage, 1)).toEqual([created])
  })

  it('never throws when storage is blocked or full', () => {
    const storage = localStorage
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new DOMException('The quota has been exceeded.', 'QuotaExceededError')
    })
    vi.spyOn(window, 'localStorage', 'get').mockImplementation(() => {
      throw new DOMException('The operation is insecure.', 'SecurityError')
    })

    expect(readCreatedPosts(storage, 1)).toEqual([])
    expect(writeCreatedPosts(storage, 1, [created])).toBe(false)
    expect(getBrowserStorage()).toBeNull()
    expect(readCreatedPosts(null, 1)).toEqual([])
    expect(writeCreatedPosts(null, 1, [created])).toBe(false)
  })
})
