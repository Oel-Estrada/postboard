import { useFormStatus } from 'react-dom'
import { messages } from '../i18n/messages'

/**
 * Submit button of the new post form. While the form action is pending it is
 * disabled and says "Publishing…", so a post cannot be sent twice.
 *
 * Must be rendered inside a `<form>`: `useFormStatus` reads its parent form.
 */
export function SubmitButton() {
  const { pending } = useFormStatus()

  return (
    <button type="submit" disabled={pending} className="min-h-11">
      {pending ? messages.form.submitting : messages.form.submit}
    </button>
  )
}
