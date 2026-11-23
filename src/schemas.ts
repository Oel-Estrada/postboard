import { z } from 'zod'

// Every schema for data that comes from outside the app lives here, next to
// its inferred type, so a type can never drift from its validation.

/** A JSONPlaceholder user, trimmed to the fields the app uses (zod drops the rest). */
export const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string(),
  company: z.object({ name: z.string() }),
})

/** A user as validated by {@link userSchema}. */
export type User = z.infer<typeof userSchema>

/** A JSONPlaceholder post. */
export const postSchema = z.object({
  userId: z.number(),
  id: z.number(),
  title: z.string(),
  body: z.string(),
})

/** A post as validated by {@link postSchema}. */
export type Post = z.infer<typeof postSchema>
