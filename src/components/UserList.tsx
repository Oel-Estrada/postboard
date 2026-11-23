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
    // From md the list reaches the detail panel, so the selected tab can join it,
    // and it is the only part of the column that scrolls.
    // Tailwind removes the list style, and Safari then drops the list
    // semantics; role="list" restores them.
    // oxlint-disable-next-line jsx-a11y/no-redundant-roles
    <ul role="list" className="flex flex-col gap-0.5 md:-mr-4 md:min-h-0 md:scrollbar-discreet md:overflow-y-auto">
      {users.map((user) => {
        const isSelected = user.id === selectedUserId
        return (
          <li key={user.id}>
            <button
              type="button"
              aria-current={isSelected ? 'true' : undefined}
              onClick={() => {
                onSelect(user)
              }}
              // The ring goes inside: the scrolling list would clip it outside.
              className={`relative flex min-h-11 w-full cursor-pointer items-center gap-3 rounded-l-md border border-transparent px-3 py-1 text-left focus-visible:-outline-offset-2 ${
                isSelected
                  ? // Accent bar on the left; from md, a folder tab with no right
                    // border that reaches the column's edge, over the panel's border.
                    "before:absolute before:inset-y-2 before:left-0 before:w-1 before:rounded-r-full before:bg-accent before:content-[''] md:border-rule md:border-r-transparent md:bg-card"
                  : 'hover:bg-card'
              }`}
            >
              <span
                aria-hidden="true"
                className={`flex size-9 shrink-0 items-center justify-center rounded-full border text-sm font-semibold ${
                  isSelected ? 'border-accent bg-accent text-card' : 'border-rule bg-paper text-muted'
                }`}
              >
                {getInitials(user.name)}
              </span>
              <span className="min-w-0">
                <span className="block leading-5 text-ink">{user.name}</span>{' '}
                <span className="block text-sm/4 text-muted">
                  {messages.users.usernameHandle(user.username)}
                </span>
              </span>
            </button>
          </li>
        )
      })}
    </ul>
  )
}
