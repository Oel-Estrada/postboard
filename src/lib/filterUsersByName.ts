import type { User } from '../schemas'

/**
 * Filters users by name on the client, ignoring case and surrounding spaces.
 *
 * @param users - Users to filter.
 * @param query - Text typed in the search box.
 * @returns The users whose name contains the trimmed query, or every user when it is empty.
 */
export function filterUsersByName(users: User[], query: string): User[] {
  const needle = query.trim().toLowerCase()
  if (!needle) return users
  return users.filter((user) => user.name.toLowerCase().includes(needle))
}
