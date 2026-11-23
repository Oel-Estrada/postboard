import type { Page } from '@playwright/test'
import { API_BASE_URL } from '../src/api/client'
import { posts, users } from '../src/test/fixtures'

interface MockApiOptions {
  /** Start with `GET /users` answering 500, until `setUsersFailing(false)`. */
  usersFailing?: boolean
}

/** Controls a mocked API while a test runs. */
export interface MockApi {
  /**
   * Switches `GET /users` between failing (500) and answering. A switch, not a
   * request count, so the result does not depend on how many requests the app makes.
   */
  setUsersFailing: (failing: boolean) => void
}

const api = new URL(API_BASE_URL)

function isApi(url: URL, pathname: string): boolean {
  return url.origin === api.origin && url.pathname === pathname
}

/**
 * Mocks the network of a page: blocks every request that does not go to
 * localhost and serves JSONPlaceholder with the data of `src/test/fixtures.ts`.
 *
 * Like the real API, `POST /posts` answers 201, stores nothing and always
 * returns `id: 101`.
 *
 * @param page - The page whose requests are mocked.
 * @param options - `usersFailing` makes `GET /users` fail with 500 from the start.
 * @returns A switch for the `GET /users` failure.
 */
export async function mockApi(page: Page, options: MockApiOptions = {}): Promise<MockApi> {
  let usersFailing = options.usersFailing ?? false

  // Registered first, so it runs last: Playwright tries the most recent route
  // first. Whatever the routes below do not serve, and is not local, is aborted.
  await page.route(
    (url) => url.hostname !== 'localhost',
    (route) => route.abort(),
  )

  await page.route(
    (url) => isApi(url, '/users'),
    (route) =>
      usersFailing ? route.fulfill({ status: 500, json: {} }) : route.fulfill({ json: users }),
  )

  await page.route(
    (url) => isApi(url, '/posts'),
    async (route) => {
      const request = route.request()
      if (request.method() === 'POST') {
        const newPost: unknown = request.postDataJSON()
        await route.fulfill({ status: 201, json: { ...(newPost as object), id: 101 } })
        return
      }
      const userId = Number(new URL(request.url()).searchParams.get('userId'))
      await route.fulfill({ json: posts.filter((post) => post.userId === userId) })
    },
  )

  return {
    setUsersFailing: (failing) => {
      usersFailing = failing
    },
  }
}
