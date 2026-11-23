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
  if (posts.length === 0) return <p>{messages.posts.empty}</p>

  return (
    // Tailwind removes the list style, and Safari then drops the list
    // semantics; role="list" restores them.
    // oxlint-disable-next-line jsx-a11y/no-redundant-roles
    <ul role="list">
      {posts.map((post) => (
        <li key={post.key}>
          <article aria-busy={post.pending ? true : undefined}>
            <h4>{post.title}</h4>
            <p>{post.body}</p>
            {post.pending && <p>{messages.posts.pending}</p>}
          </article>
        </li>
      ))}
    </ul>
  )
}
