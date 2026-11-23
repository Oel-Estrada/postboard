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
      <header className="px-4 pt-4 pb-3 md:px-6">
        <h1 className="text-xl font-semibold">{messages.app.title}</h1>
      </header>
      {/* No gap between the columns: the selected user's tab has to touch the panel. */}
      <main className="px-4 pb-10 md:grid md:grid-cols-[18rem_minmax(0,1fr)] md:px-6">
        <div
          ref={usersColumnRef}
          // From md the column stays in view, as tall as the window; only the
          // user list scrolls. A scroll container clips what sticks out of it,
          // so the column itself overlaps the panel's left border by 1px (above
          // it, z-10) and the selected tab can cover that border from inside.
          className={`${mobileView === 'list' ? 'block' : 'hidden'} md:sticky md:flex md:top-0 md:z-10 md:-mr-px md:h-dvh md:flex-col md:self-start`}
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
          {/* Stretches to the row, so the panel is never shorter than the tab beside it. */}
          <div className="rounded-md border border-rule bg-card p-4 md:h-full md:p-6">
            {selectedUser ? (
              // The key gives each user a fresh panel: form, optimistic posts and requests.
              <PostsPanel
                key={selectedUser.id}
                user={selectedUser}
                headingRef={detailHeadingRef}
              />
            ) : (
              <p className="text-muted">{messages.app.selectUser}</p>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

export default App
