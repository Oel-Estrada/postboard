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
      <header className="border-b border-rule bg-card">
        {/* Same width as <main>, so the brand lines up with the users column. */}
        <div className="mx-auto flex min-h-14 max-w-7xl items-center gap-2.5 px-4 md:px-6">
          {/* Decorative brand mark: a folder holding two posts. Theme colours, so it
              follows the palette. */}
          <svg aria-hidden="true" viewBox="0 0 28 28" className="size-7 shrink-0">
            <path
              className="fill-ink"
              d="M2 6.5A2.5 2.5 0 0 1 4.5 4h6l2.5 3h10.5A2.5 2.5 0 0 1 26 9.5v13a2.5 2.5 0 0 1-2.5 2.5h-19A2.5 2.5 0 0 1 2 22.5Z"
            />
            <path
              className="stroke-card"
              fill="none"
              strokeWidth="2"
              strokeLinecap="round"
              d="M7 13.5h14M7 18.5h9"
            />
          </svg>
          <h1 className="text-xl font-semibold">{messages.app.title}</h1>
        </div>
      </header>
      {/* No gap between the columns: the selected user's tab has to touch the panel.
          On wide screens the layout stops at 80rem and sits in the middle. */}
      <main className="mx-auto max-w-7xl px-4 pt-4 pb-10 md:grid md:grid-cols-[18rem_minmax(0,1fr)] md:px-6">
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
            <button
              type="button"
              onClick={handleBackToUsers}
              className="mb-4 inline-flex min-h-11 cursor-pointer items-center gap-2 border border-muted bg-card px-4 font-medium hover:bg-paper md:hidden"
            >
              {/* Decorative: the text already says where it goes. */}
              <svg
                aria-hidden="true"
                viewBox="0 0 16 16"
                className="size-4 shrink-0"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M10 3 5 8l5 5" />
              </svg>
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
              // From md the panel is as tall as the window: the hint sits in its middle.
              <div className="flex flex-col items-center justify-center gap-4 py-12 text-center md:h-full md:py-0">
                {/* Decorative: an empty folder, the "office file" waiting for a user,
                    in a circle like the users' monograms. */}
                <span
                  aria-hidden="true"
                  className="flex size-20 items-center justify-center rounded-full bg-paper text-muted"
                >
                  <svg
                    viewBox="0 0 48 48"
                    className="size-10"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinejoin="round"
                  >
                    <path d="M6 12.5A2.5 2.5 0 0 1 8.5 10h9.2l4 4.5h17.8a2.5 2.5 0 0 1 2.5 2.5v19.5a2.5 2.5 0 0 1-2.5 2.5h-31A2.5 2.5 0 0 1 6 36.5Z" />
                    <path d="M6 19h36" />
                  </svg>
                </span>
                <p className="max-w-[28ch] text-muted">{messages.app.selectUser}</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </>
  )
}

export default App
