import { useRef, useState } from 'react'
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
  const searchRef = useRef<HTMLInputElement>(null)

  // Try again goes away with the error, so focus moves to the search box
  // instead of dropping to <body>.
  function handleRetry() {
    users.retry()
    searchRef.current?.focus()
  }

  return (
    // From md it fills the column, so the list can shrink and scroll below the search.
    <div className="flex flex-col gap-4 md:min-h-0 md:flex-1 md:pt-1 md:pb-2 md:pr-4">
      {/* Visually hidden: names the column for screen reader heading navigation.
          sr-only is absolutely positioned, so it adds no gap to the flex layout. */}
      <h2 className="sr-only">{messages.users.heading}</h2>
      <UserSearch ref={searchRef} value={query} onChange={setQuery} />
      {users.status === 'loading' && <LoadingMessage>{messages.users.loading}</LoadingMessage>}
      {users.status === 'error' && (
        <ErrorMessage onRetry={handleRetry}>{messages.users.loadError}</ErrorMessage>
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
      <p aria-live="polite" className="text-sm text-muted">
        {users.length === 0 ? messages.users.noUsersMatch(query.trim()) : null}
      </p>
    </>
  )
}
