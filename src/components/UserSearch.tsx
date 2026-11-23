import { useId, type Ref } from 'react'
import { messages } from '../i18n/messages'

interface UserSearchProps {
  value: string
  onChange: (value: string) => void
  ref?: Ref<HTMLInputElement>
}

/**
 * Labelled search box for filtering users by name, inside a `<search>` landmark.
 *
 * @param props.value - Current text of the search box (controlled).
 * @param props.onChange - Called with the new text on every change.
 * @param props.ref - Ref to the input, to move focus to it.
 */
export function UserSearch({ value, onChange, ref }: UserSearchProps) {
  const inputId = useId()

  return (
    <search className="block">
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-ink">
        {messages.users.searchLabel}
      </label>
      <div className="relative">
        {/* Decorative magnifier: the label already names the field. */}
        <svg
          aria-hidden="true"
          viewBox="0 0 16 16"
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        >
          <circle cx="7" cy="7" r="4.5" />
          <path d="m10.5 10.5 3.5 3.5" />
        </svg>
        {/* Names are identifiers, not prose: no autocorrect or capitalisation.
            The border is muted, not rule: an input's edge needs 3:1 (WCAG 1.4.11). */}
        <input
          ref={ref}
          id={inputId}
          type="search"
          value={value}
          onChange={(event) => {
            onChange(event.target.value)
          }}
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
          placeholder={messages.users.searchPlaceholder}
          className="min-h-11 w-full border border-muted bg-card pr-3 pl-9 text-ink placeholder:text-muted"
        />
      </div>
    </search>
  )
}
