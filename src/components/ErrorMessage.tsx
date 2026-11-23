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
    <div
      role="alert"
      className="flex flex-wrap items-center gap-x-4 gap-y-2 border border-l-4 border-rule border-l-danger bg-card p-3"
    >
      <p className="text-danger">{children}</p>
      <button
        type="button"
        onClick={onRetry}
        className="min-h-11 cursor-pointer border border-muted bg-card px-4 font-medium hover:bg-paper"
      >
        {messages.common.tryAgain}
      </button>
    </div>
  )
}
