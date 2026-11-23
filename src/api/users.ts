import { z } from 'zod'
import { userSchema, type User } from '../schemas'
import { request } from './client'

/**
 * Fetches every user and validates the response.
 *
 * @param signal - Aborts the request when the caller no longer needs it.
 * @returns The users from `GET /users`, trimmed to the fields of {@link userSchema}.
 * @throws {HttpError} When the response is not ok; network and abort errors pass through.
 * @throws {ZodError} When the response does not match the expected shape.
 */
export async function getUsers(signal?: AbortSignal): Promise<User[]> {
  return z.array(userSchema).parse(await request('/users', { signal }))
}
