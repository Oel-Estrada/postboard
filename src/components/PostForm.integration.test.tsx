import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { messages } from '../i18n/messages'
import { PostForm } from './PostForm'

function getFields() {
  return {
    title: screen.getByRole('textbox', { name: messages.form.titleLabel }),
    body: screen.getByRole('textbox', { name: messages.form.bodyLabel }),
  }
}

describe('PostForm', () => {
  it('shows accessible errors and does not publish when fields are empty or blank', async () => {
    const user = userEvent.setup()
    const onPublish = vi.fn(() => Promise.resolve())
    render(<PostForm onPublish={onPublish} />)
    expect(
      screen.getByRole('heading', { level: 3, name: messages.form.heading }),
    ).toBeInTheDocument()
    const { title, body } = getFields()

    await user.type(body, '   ')
    await user.click(screen.getByRole('button', { name: messages.form.submit }))

    const alerts = await screen.findAllByRole('alert')
    expect(alerts.map((alert) => alert.textContent)).toEqual([
      messages.form.titleRequired,
      messages.form.bodyRequired,
    ])
    expect(title).toHaveAttribute('aria-invalid', 'true')
    expect(title).toHaveAccessibleDescription(messages.form.titleRequired)
    expect(body).toHaveAttribute('aria-invalid', 'true')
    expect(body).toHaveAccessibleDescription(messages.form.bodyRequired)
    expect(body).toHaveValue('   ')
    // Focus moves to the first field to fix.
    expect(title).toHaveFocus()
    expect(onPublish).not.toHaveBeenCalled()
  })

  it('publishes trimmed values, clears the form and announces success', async () => {
    const user = userEvent.setup()
    const onPublish = vi.fn(() => Promise.resolve())
    render(<PostForm onPublish={onPublish} />)
    const { title, body } = getFields()

    await user.type(title, '  Hello ')
    await user.type(body, ' World  ')
    await user.click(screen.getByRole('button', { name: messages.form.submit }))

    // The status region is always there; wait for its text, not for the region.
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(messages.form.published)
    })
    expect(onPublish).toHaveBeenCalledExactlyOnceWith({ title: 'Hello', body: 'World' })
    expect(title).toHaveValue('')
    expect(body).toHaveValue('')
    expect(title).not.toHaveAttribute('aria-invalid', 'true')
    // The button was disabled while publishing; focus goes on to the next post.
    expect(title).toHaveFocus()

    // A second success must change the live region too, or screen readers stay silent.
    const status = screen.getByRole('status')
    const changes: MutationRecord[] = []
    const observer = new MutationObserver((records) => changes.push(...records))
    observer.observe(status, { childList: true, subtree: true, characterData: true })
    await user.type(title, 'Again')
    await user.type(body, 'Twice')
    await user.click(screen.getByRole('button', { name: messages.form.submit }))
    await waitFor(() => {
      expect(title).toHaveValue('')
    })
    observer.disconnect()
    expect(onPublish).toHaveBeenCalledTimes(2)
    expect(changes.length).toBeGreaterThan(0)
    expect(status).toHaveTextContent(messages.form.published)
  })

  it('keeps what was typed and shows an error when publishing fails', async () => {
    const user = userEvent.setup()
    const onPublish = vi.fn(() => Promise.reject(new Error('Network down')))
    render(<PostForm onPublish={onPublish} />)
    const { title, body } = getFields()

    await user.type(title, 'Hello')
    await user.type(body, 'World')
    await user.click(screen.getByRole('button', { name: messages.form.submit }))

    expect(await screen.findByRole('alert')).toHaveTextContent(messages.form.publishError)
    expect(title).toHaveValue('Hello')
    expect(body).toHaveValue('World')
    expect(title).toHaveFocus()
    expect(screen.getByRole('status')).not.toHaveTextContent(messages.form.published)
  })

  it('publishes once on a double click', async () => {
    const user = userEvent.setup()
    // The first publish waits until the test releases it. useActionState queues
    // actions, so a second submit would only run after the first one finishes.
    let release!: () => void
    const onPublish = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          release = resolve
        }),
    )
    render(<PostForm onPublish={onPublish} />)
    const { title, body } = getFields()

    await user.type(title, 'Hello')
    await user.type(body, 'World')
    await user.dblClick(screen.getByRole('button', { name: messages.form.submit }))

    expect(
      await screen.findByRole('button', { name: messages.form.submitting }),
    ).toBeDisabled()

    release()

    // The status region is always there; wait for its text, not for the region.
    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent(messages.form.published)
    })
    expect(onPublish).toHaveBeenCalledTimes(1)
  })
})
