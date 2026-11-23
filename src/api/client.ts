/** Base URL of the JSONPlaceholder API. */
export const API_BASE_URL = 'https://jsonplaceholder.typicode.com'

/** Error thrown when the API answers with a non-2xx status. */
export class HttpError extends Error {
  readonly status: number

  /**
   * @param status - HTTP status code of the response.
   * @param message - Human-readable description of the failure.
   */
  constructor(status: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

/**
 * Fetches `API_BASE_URL + path` and parses the JSON body.
 *
 * @param path - API path starting with `/`, including any query string.
 * @param init - Options passed to `fetch` (method, headers, body, signal…).
 * @returns The parsed JSON body, as `unknown`: callers validate it with a zod schema.
 * @throws {HttpError} When the response is not ok (`res.ok === false`).
 * @throws Network and abort errors (`AbortError`) as `fetch` raises them, unwrapped.
 */
export async function request(path: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(API_BASE_URL + path, init)

  if (!res.ok) {
    throw new HttpError(res.status, `Request to ${path} failed with status ${res.status}`)
  }

  return res.json()
}
