import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { messages } from '../i18n/messages'
import { ErrorMessage } from './ErrorMessage'

describe('ErrorMessage', () => {
  it('announces the message as an alert and retries from Try again', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    // Test-only text: the message comes from the caller.
    render(<ErrorMessage onRetry={onRetry}>Couldn't load things.</ErrorMessage>)

    expect(screen.getByRole('alert')).toHaveTextContent("Couldn't load things.")

    await user.click(screen.getByRole('button', { name: messages.common.tryAgain }))

    expect(onRetry).toHaveBeenCalledTimes(1)
  })
})
