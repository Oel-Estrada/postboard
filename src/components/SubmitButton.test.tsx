import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { messages } from '../i18n/messages'
import { SubmitButton } from './SubmitButton'

describe('SubmitButton', () => {
  it('is disabled and shows Publishing… while the form action is pending', async () => {
    const user = userEvent.setup()
    render(
      <form action={() => new Promise<void>(() => {})}>
        <SubmitButton />
      </form>,
    )
    const button = screen.getByRole('button', { name: messages.form.submit })
    expect(button).toBeEnabled()

    await user.click(button)

    expect(await screen.findByRole('button', { name: messages.form.submitting })).toBeDisabled()
  })
})
