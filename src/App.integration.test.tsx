import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from './App'
import { messages } from './i18n/messages'
import { users } from './test/fixtures'

const ervin = users[1]
const ervinButtonName = `${ervin.name} ${messages.users.usernameHandle(ervin.username)}`

describe('App', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('opens the selected user and goes back to the list on a narrow viewport', async () => {
    vi.stubGlobal(
      'matchMedia',
      vi.fn((query: string) => ({ matches: true, media: query })),
    )
    const user = userEvent.setup()
    render(<App />)

    expect(
      screen.getByRole('heading', { level: 1, name: messages.app.title }),
    ).toBeInTheDocument()
    expect(screen.getByText(messages.app.selectUser)).toBeInTheDocument()

    await user.click(await screen.findByRole('button', { name: ervinButtonName }))

    expect(screen.getByRole('heading', { level: 2, name: ervin.name })).toHaveFocus()

    await user.click(screen.getByRole('button', { name: messages.app.backToUsers }))

    expect(
      screen.queryByRole('button', { name: messages.app.backToUsers }),
    ).not.toBeInTheDocument()
    expect(screen.getByRole('button', { current: true })).toHaveAccessibleName(ervinButtonName)
    expect(screen.getByRole('button', { current: true })).toHaveFocus()
  })
})
