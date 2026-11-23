import { useState } from 'react'
import { useUsers } from '../hooks/useUsers'
import { messages } from '../i18n/messages'
import { filterUsersByName } from '../lib/filterUsersByName'
import type { User } from '../schemas'
import { ErrorMessage } from './ErrorMessage'
import { LoadingMessage } from './LoadingMessage'
import { UserList } from './UserList'
import { UserSearch } from './UserSearch'

interface UsersPanelProps {
  selectedUserId: number | null
  onSelectUser: (user: User) => void
}

/**
 * Users column: loads the users and lets the user search them by name and pick one.
 *
 * Shows a loading status, an error with "Try again", or the filtered list.
 *
 * @param props.selectedUserId - Id of the selected user, or `null` when none is.
 * @param props.onSelectUser - Called with the user that is picked.
 */
export function UsersPanel({ selectedUserId, onSelectUser }: UsersPanelProps) {
  const users = useUsers()
  const [query, setQuery] = useState('')

  return (
    <div>
      <UserSearch value={query} onChange={setQuery} />
      {users.status === 'loading' && <LoadingMessage>{messages.users.loading}</LoadingMessage>}
      {users.status === 'error' && (
        <ErrorMessage onRetry={users.retry}>{messages.users.loadError}</ErrorMessage>
      )}
      {users.status === 'success' && (
        <SearchResults
          users={filterUsersByName(users.data, query)}
          query={query}
          selectedUserId={selectedUserId}
          onSelectUser={onSelectUser}
        />
      )}
    </div>
  )
}

interface SearchResultsProps extends UsersPanelProps {
  users: User[]
  query: string
}

function SearchResults({ users, query, selectedUserId, onSelectUser }: SearchResultsProps) {
  return (
    <>
      <UserList users={users} selectedUserId={selectedUserId} onSelect={onSelectUser} />
      {/* Always rendered, so screen readers announce the text when it appears. */}
      <p aria-live="polite">
        {users.length === 0 ? messages.users.noUsersMatch(query.trim()) : null}
      </p>
    </>
  )
}
