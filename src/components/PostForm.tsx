import { useActionState, useId, useLayoutEffect, useRef } from 'react'
import { messages } from '../i18n/messages'
import { validatePost, type PostFormErrors } from '../lib/validatePost'
import type { PostFormValues } from '../schemas'
import { SubmitButton } from './SubmitButton'

interface PostFormProps {
  onPublish: (values: PostFormValues) => Promise<void>
}

interface PostFormState {
  errors: PostFormErrors
  /** What the fields show after the action: React resets the form to these defaults. */
  submitted: PostFormValues
  published: boolean
}

const emptyValues: PostFormValues = { title: '', body: '' }
const initialState: PostFormState = { errors: {}, submitted: emptyValues, published: false }

/**
 * Form to publish a new post, built on a React form action (`useActionState`).
 *
 * Title and text are required and trimmed. Invalid fields get an accessible
 * error and focus moves to the first one. On success the form clears and
 * announces it; if publishing fails, what was typed stays and an error shows.
 *
 * @param props.onPublish - Publishes the trimmed values; rejects when it fails.
 */
export function PostForm({ onPublish }: PostFormProps) {
  const [state, formAction] = useActionState(publishAction, initialState)
  const titleRef = useRef<HTMLInputElement>(null)
  const bodyRef = useRef<HTMLTextAreaElement>(null)
  const id = useId()
  const titleId = `${id}-title`
  const bodyId = `${id}-body`

  async function publishAction(_previous: PostFormState, formData: FormData) {
    const typed: PostFormValues = {
      title: String(formData.get('title') ?? ''),
      body: String(formData.get('body') ?? ''),
    }
    const errors = validatePost(typed)
    if (Object.keys(errors).length > 0) {
      return { errors, submitted: typed, published: false }
    }

    try {
      await onPublish({ title: typed.title.trim(), body: typed.body.trim() })
      return { errors: {}, submitted: emptyValues, published: true }
    } catch {
      return { errors: { form: messages.form.publishError }, submitted: typed, published: false }
    }
  }

  // After a failed validation, focus goes to the first field to fix. A layout
  // effect runs in the same commit that shows the errors, so focus arrives with
  // them; a passive effect can run later, leaving focus on <body> meanwhile
  // (the submit button was disabled while the action ran).
  useLayoutEffect(() => {
    if (state.errors.title) titleRef.current?.focus()
    else if (state.errors.body) bodyRef.current?.focus()
  }, [state])

  return (
    <form action={formAction} noValidate>
      <h3>{messages.form.heading}</h3>
      <div>
        <label htmlFor={titleId} className="block">
          {messages.form.titleLabel}
        </label>
        <input
          ref={titleRef}
          id={titleId}
          name="title"
          required
          defaultValue={state.submitted.title}
          aria-invalid={state.errors.title ? true : undefined}
          aria-describedby={state.errors.title ? `${titleId}-error` : undefined}
          className="min-h-11 w-full"
        />
        {state.errors.title && (
          <p id={`${titleId}-error`} role="alert">
            {state.errors.title}
          </p>
        )}
      </div>
      <div>
        <label htmlFor={bodyId} className="block">
          {messages.form.bodyLabel}
        </label>
        <textarea
          ref={bodyRef}
          id={bodyId}
          name="body"
          required
          defaultValue={state.submitted.body}
          aria-invalid={state.errors.body ? true : undefined}
          aria-describedby={state.errors.body ? `${bodyId}-error` : undefined}
          className="min-h-11 w-full"
        />
        {state.errors.body && (
          <p id={`${bodyId}-error`} role="alert">
            {state.errors.body}
          </p>
        )}
      </div>
      {state.errors.form && <p role="alert">{state.errors.form}</p>}
      {/* Always rendered: a live region whose text changes is announced reliably. */}
      {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role */}
      <p role="status">{state.published ? messages.form.published : null}</p>
      <SubmitButton />
    </form>
  )
}
