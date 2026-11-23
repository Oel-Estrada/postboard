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
  },
  common: {
    tryAgain: 'Try again',
  },
  users: {
    searchLabel: 'Search users',
    usernameHandle: (username: string) => `@${username}`,
  },
}
