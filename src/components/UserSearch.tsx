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
    <search>
      <label htmlFor={inputId} className="block">
        {messages.users.searchLabel}
      </label>
      {/* Names are identifiers, not prose: no autocorrect or capitalisation. */}
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
        className="min-h-11 w-full"
      />
    </search>
  )
}
