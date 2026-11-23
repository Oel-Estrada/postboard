import type { ReactNode } from 'react'

interface LoadingMessageProps {
  children: ReactNode
}

/**
 * Loading indicator announced politely to screen readers (`role="status"`).
 *
 * @param props.children - The loading text, taken from `messages` by the caller.
 */
export function LoadingMessage({ children }: LoadingMessageProps) {
  return (
    // <output> also has the status role, but it is meant for the result of a
    // calculation or user action, and not every screen reader announces it.
    // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
    <p role="status" className="flex items-center gap-2 py-2 text-muted">
      {/* Decorative: the text says it is loading. It only spins without reduced motion. */}
      <span
        aria-hidden="true"
        className="size-4 shrink-0 rounded-full border-2 border-rule border-t-muted motion-safe:animate-spin"
      />
      {children}
    </p>
  )
}
