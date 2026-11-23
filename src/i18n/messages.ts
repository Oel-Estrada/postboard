/**
 * English UI copy: every visible or accessible text of the app lives here.
 *
 * Grouped by area. It is intentionally not `as const`, so another locale can be
 * declared as `{ ... } satisfies typeof messages`. Texts that include data are
 * functions.
 */
export const messages = {
  app: {
    title: 'Postboard',
    pageTitle: (name: string) => `${name} · Postboard`,
    selectUser: 'Select a user to see their posts.',
    backToUsers: 'Back to users',
  },
  common: {
    tryAgain: 'Try again',
  },
  users: {
    searchLabel: 'Search users',
    usernameHandle: (username: string) => `@${username}`,
    loading: 'Loading users…',
    loadError: "Couldn't load users.",
    noUsersMatch: (query: string) => `No users match "${query}".`,
  },
  form: {
    titleRequired: 'Enter a title.',
    bodyRequired: 'Enter the post text.',
    submit: 'Publish post',
    submitting: 'Publishing…',
    heading: 'New post',
    titleLabel: 'Title',
    bodyLabel: 'Text',
    published: 'Post published.',
    publishError: "Couldn't publish the post. Try again.",
  },
  posts: {
    pending: 'Publishing…',
    empty: 'This user has no posts yet.',
    loading: 'Loading posts…',
    loadError: "Couldn't load posts.",
    postsCount: (count: number) => `Posts (${count})`,
  },
}
