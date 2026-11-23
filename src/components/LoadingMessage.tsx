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
  // <output> also has the status role, but it is meant for the result of a
  // calculation or user action, and not every screen reader announces it.
  // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
  return <p role="status">{children}</p>
}
