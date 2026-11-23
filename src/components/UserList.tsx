import { messages } from '../i18n/messages'
import { getInitials } from '../lib/getInitials'
import type { User } from '../schemas'

interface UserListProps {
  users: User[]
  selectedUserId: number | null
  onSelect: (user: User) => void
}

/**
 * List of users, one button each, with the selected one marked as current.
 *
 * @param props.users - Users to show, already filtered.
 * @param props.selectedUserId - Id of the selected user, or `null` when none is.
 * @param props.onSelect - Called with the user whose button is pressed.
 */
export function UserList({ users, selectedUserId, onSelect }: UserListProps) {
  return (
    // Tailwind removes the list style, and Safari then drops the list
    // semantics; role="list" restores them.
    // oxlint-disable-next-line jsx-a11y/no-redundant-roles
    <ul role="list">
      {users.map((user) => (
        <li key={user.id}>
          <button
            type="button"
            aria-current={user.id === selectedUserId ? 'true' : undefined}
            onClick={() => {
              onSelect(user)
            }}
            className="flex min-h-11 w-full items-center gap-3 text-left"
          >
            <span aria-hidden="true">{getInitials(user.name)}</span>
            <span>
              <span className="block">{user.name}</span>{' '}
              <span className="block">{messages.users.usernameHandle(user.username)}</span>
            </span>
          </button>
        </li>
      ))}
    </ul>
  )
}
