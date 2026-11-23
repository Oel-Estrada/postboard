import type { ReactNode } from 'react'
import { messages } from '../i18n/messages'

interface ErrorMessageProps {
  children: ReactNode
  onRetry: () => void
}

/**
 * Load error announced right away to screen readers (`role="alert"`), with a
 * "Try again" button.
 *
 * @param props.children - The error text, taken from `messages` by the caller.
 * @param props.onRetry - Called when the user presses "Try again".
 */
export function ErrorMessage({ children, onRetry }: ErrorMessageProps) {
  return (
    <div role="alert">
      <p>{children}</p>
      <button type="button" onClick={onRetry} className="min-h-11">
        {messages.common.tryAgain}
      </button>
    </div>
  )
}
