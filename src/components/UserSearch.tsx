import { useId } from 'react'
import { messages } from '../i18n/messages'

interface UserSearchProps {
  value: string
  onChange: (value: string) => void
}

/**
 * Labelled search box for filtering users by name, inside a `<search>` landmark.
 *
 * @param props.value - Current text of the search box (controlled).
 * @param props.onChange - Called with the new text on every change.
 */
export function UserSearch({ value, onChange }: UserSearchProps) {
  const inputId = useId()

  return (
    <search className="block">
      <label htmlFor={inputId} className="mb-1 block text-sm font-medium text-ink">
        {messages.users.searchLabel}
      </label>
      {/* Names are identifiers, not prose: no autocorrect or capitalisation.
          The border is muted, not rule: an input's edge needs 3:1 (WCAG 1.4.11). */}
      <input
        id={inputId}
        type="search"
        value={value}
        onChange={(event) => {
          onChange(event.target.value)
        }}
        autoCorrect="off"
        autoCapitalize="none"
        spellCheck={false}
        className="min-h-11 w-full border border-muted bg-card px-3 text-ink"
      />
    </search>
  )
}
