import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { messages } from '../i18n/messages'
import { users } from '../test/fixtures'
import { UsersPanel } from './UsersPanel'

describe('UsersPanel', () => {
  it('shows a loading status and then the users', async () => {
    render(<UsersPanel selectedUserId={null} onSelectUser={vi.fn()} />)

    expect(screen.getByRole('status')).toHaveTextContent(messages.users.loading)

    expect(await screen.findAllByRole('button')).toHaveLength(users.length)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('filters the users as the user types and says when none match', async () => {
    const user = userEvent.setup()
    render(<UsersPanel selectedUserId={null} onSelectUser={vi.fn()} />)
    await screen.findAllByRole('button')
    const searchBox = screen.getByRole('searchbox', { name: messages.users.searchLabel })

    await user.type(searchBox, '  CLEM')

    expect(screen.getAllByRole('button').map((button) => button.textContent)).toEqual([
      expect.stringContaining('Clementine Bauch'),
      expect.stringContaining('Clementina DuBuque'),
    ])

    await user.clear(searchBox)
    await user.type(searchBox, '  zzz ')

    expect(screen.queryAllByRole('button')).toHaveLength(0)
    expect(screen.getByText(messages.users.noUsersMatch('zzz'))).toBeInTheDocument()
  })
})
