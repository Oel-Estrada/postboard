import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { LoadingMessage } from './LoadingMessage'

describe('LoadingMessage', () => {
  it('announces the message as a status', () => {
    // Test-only text: the component has no copy of its own.
    render(<LoadingMessage>Loading things…</LoadingMessage>)

    expect(screen.getByRole('status')).toHaveTextContent('Loading things…')
  })
})
