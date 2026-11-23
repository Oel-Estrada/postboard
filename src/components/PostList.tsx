import { messages } from '../i18n/messages'
import type { DisplayPost } from '../types'

interface PostListProps {
  posts: DisplayPost[]
}

/**
 * List of posts, each an `<article>` with its title and text, always rendered
 * as text. A pending post is marked busy and labelled "Publishing…".
 *
 * @param props.posts - Posts to show, in order; an empty list shows a message.
 */
export function PostList({ posts }: PostListProps) {
  if (posts.length === 0) {
    return (
      <p className="flex items-center gap-3 border border-dashed border-rule p-6 text-muted">
        {/* Decorative: an empty sheet of paper. */}
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-6 shrink-0"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        >
          <path d="M6 3h8l4 4v14H6z" />
          <path d="M14 3v4h4" />
        </svg>
        {messages.posts.empty}
      </p>
    )
  }

  return (
    // Tailwind removes the list style, and Safari then drops the list
    // semantics; role="list" restores them.
    // oxlint-disable-next-line jsx-a11y/no-redundant-roles
    <ul role="list" className="flex flex-col gap-3">
      {posts.map((post) => (
        <li key={post.key}>
          {/* A pending post is told apart by its dashed edge and its label, not by colour alone. */}
          <article
            aria-busy={post.pending ? true : undefined}
            className={`border bg-card p-4 ${
              post.pending ? 'border-dashed border-muted text-muted' : 'border-rule'
            }`}
          >
            <h4 className="font-serif text-xl font-medium first-letter:uppercase">{post.title}</h4>
            <p className="mt-1 max-w-[65ch]">{post.body}</p>
            {post.pending && (
              <p className="mt-2 text-sm font-medium">{messages.posts.pending}</p>
            )}
          </article>
        </li>
      ))}
    </ul>
  )
}
