import { z } from 'zod'
import { postFormSchema, type PostFormValues } from '../schemas'

/** Error message per form field, plus `form` for an error of the whole form (publishing failed). */
export type PostFormErrors = Partial<Record<keyof PostFormValues | 'form', string>>

/**
 * Validates the new post form with {@link postFormSchema}.
 *
 * @param values - The title and text as typed.
 * @returns The first error message of each invalid field (`title`, `body`);
 * an empty object when both are valid.
 */
export function validatePost(values: PostFormValues): PostFormErrors {
  const result = postFormSchema.safeParse(values)
  if (result.success) return {}

  const { fieldErrors } = z.flattenError(result.error)
  const errors: PostFormErrors = {}
  if (fieldErrors.title?.[0]) errors.title = fieldErrors.title[0]
  if (fieldErrors.body?.[0]) errors.body = fieldErrors.body[0]
  return errors
}
