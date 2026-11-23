import { startTransition, useOptimistic, type Ref } from 'react'
import { createPost } from '../api/posts'
import { useCreatedPosts } from '../hooks/useCreatedPosts'
import { useUserPosts } from '../hooks/useUserPosts'
import { messages } from '../i18n/messages'
import { getInitials } from '../lib/getInitials'
import type { PostFormValues, User } from '../schemas'
import type { DisplayPost } from '../types'
import { ErrorMessage } from './ErrorMessage'
import { LoadingMessage } from './LoadingMessage'
import { PostForm } from './PostForm'
import { PostList } from './PostList'

interface PostsPanelProps {
  user: User
  headingRef?: Ref<HTMLHeadingElement>
}

/**
 * Detail of a user: their data, the form to publish a post and their posts.
 *
 * Shows the posts this user created (kept in localStorage) above the ones from
 * the API. A new post shows at once as pending and is stored only if the API
 * accepts it; if publishing fails, it disappears and the form shows the error.
 *
 * @param props.user - The selected user.
 * @param props.headingRef - Ref to the user's heading, to move focus to it.
 */
export function PostsPanel({ user, headingRef }: PostsPanelProps) {
  const apiPosts = useUserPosts(user.id)
  const { createdPosts, saveCreatedPost } = useCreatedPosts(user.id)
  const [visibleCreated, addPendingPost] = useOptimistic(
    createdPosts,
    (current: DisplayPost[], pending: DisplayPost) => [pending, ...current],
  )

  // Runs inside PostForm's action, so the optimistic post lasts until it ends.
  async function handlePublish(values: PostFormValues) {
    const userId = user.id
    const key = crypto.randomUUID()
    addPendingPost({ ...values, userId, id: 0, key, pending: true })
    const post = await createPost({ userId, ...values })
    // React does not treat updates after an `await` as part of the action, so
    // without this the saved post would render while the pending copy is still
    // shown. Inside a Transition both land in the same render.
    startTransition(() => {
      saveCreatedPost({ ...post, userId, key })
    })
  }

  const shownPosts = [
    ...visibleCreated,
    ...(apiPosts.status === 'success' ? apiPosts.data : []),
  ]

  return (
    <section className="flex flex-col gap-6">
      <div className="flex items-center gap-4 border-b border-rule pb-5">
        {/* Same mark as the selected user in the list. */}
        <span
          aria-hidden="true"
          className="flex size-14 shrink-0 items-center justify-center rounded-full bg-accent text-xl font-semibold text-card"
        >
          {getInitials(user.name)}
        </span>
        <div className="min-w-0">
          <h2 ref={headingRef} tabIndex={-1} className="font-serif text-2xl font-semibold">
            {user.name}
          </h2>
          {/* An email has no spaces: it may break anywhere rather than widen the page. */}
          <p className="text-sm text-muted wrap-anywhere">{user.email}</p>
          <p className="text-sm text-muted">{user.company.name}</p>
        </div>
      </div>
      <PostForm onPublish={handlePublish} />
      <div className="flex flex-col gap-3">
        <h3 className="text-xl font-semibold">{messages.posts.postsCount(shownPosts.length)}</h3>
        {/* Until the API answers, an empty list would wrongly say "no posts yet". */}
        {(apiPosts.status === 'success' || shownPosts.length > 0) && (
          <PostList posts={shownPosts} />
        )}
        {apiPosts.status === 'loading' && (
          <LoadingMessage>{messages.posts.loading}</LoadingMessage>
        )}
        {apiPosts.status === 'error' && (
          <ErrorMessage onRetry={apiPosts.retry}>{messages.posts.loadError}</ErrorMessage>
        )}
      </div>
    </section>
  )
}
