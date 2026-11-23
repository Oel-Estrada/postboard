import { useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { PostsPanel } from './components/PostsPanel'
import { UsersPanel } from './components/UsersPanel'
import { messages } from './i18n/messages'
import { isNarrowViewport } from './lib/isNarrowViewport'
import type { User } from './schemas'

/**
 * Root component of Postboard: a mobile-first list and detail layout.
 *
 * Below `md` only one view shows at a time (the user list or the detail);
 * from `md` up both sit side by side.
 *
 * @returns The application shell.
 */
function App() {
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('list')
  const usersColumnRef = useRef<HTMLDivElement>(null)
  const detailHeadingRef = useRef<HTMLHeadingElement>(null)

  function handleSelectUser(user: User) {
    // flushSync shows the detail before focus moves to it.
    flushSync(() => {
      setSelectedUser(user)
      setMobileView('detail')
    })
    // On mobile the list disappears, so focus follows the user to the detail.
    if (isNarrowViewport()) detailHeadingRef.current?.focus()
  }

  function handleBackToUsers() {
    flushSync(() => {
      setMobileView('list')
    })
    usersColumnRef.current?.querySelector<HTMLElement>('[aria-current="true"]')?.focus()
  }

  return (
    <>
      {/* React 19 hoists <title> to <head>; it needs a single string child. */}
      <title>
        {selectedUser ? messages.app.pageTitle(selectedUser.name) : messages.app.title}
      </title>
      <header className="px-4 py-3">
        <h1>{messages.app.title}</h1>
      </header>
      <main className="px-4 md:grid md:grid-cols-[20rem_1fr] md:gap-6">
        <div
          ref={usersColumnRef}
          className={mobileView === 'list' ? 'block' : 'hidden md:block'}
        >
          <UsersPanel
            selectedUserId={selectedUser?.id ?? null}
            onSelectUser={handleSelectUser}
          />
        </div>
        <div className={mobileView === 'detail' ? 'block' : 'hidden md:block'}>
          {mobileView === 'detail' && (
            <button type="button" onClick={handleBackToUsers} className="min-h-11 md:hidden">
              {messages.app.backToUsers}
            </button>
          )}
          {selectedUser ? (
            // The key gives each user a fresh panel: form, optimistic posts and requests.
            <PostsPanel
              key={selectedUser.id}
              user={selectedUser}
              headingRef={detailHeadingRef}
            />
          ) : (
            <p>{messages.app.selectUser}</p>
          )}
        </div>
      </main>
    </>
  )
}

export default App
