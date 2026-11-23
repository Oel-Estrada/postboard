import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { messages } from '../i18n/messages'
import { users } from '../test/fixtures'
import { UserList } from './UserList'

describe('UserList', () => {
  it('renders a button per user and marks the selected one as current', () => {
    render(<UserList users={users} selectedUserId={1} onSelect={vi.fn()} />)

    expect(screen.getAllByRole('button')).toHaveLength(users.length)
    for (const user of users) {
      // The monogram is decorative, so the name is just the user's name and handle.
      expect(
        screen.getByRole('button', {
          name: `${user.name} ${messages.users.usernameHandle(user.username)}`,
        }),
      ).toBeInTheDocument()
    }
    expect(screen.getByRole('button', { current: true })).toHaveTextContent('Leanne Graham')
  })
})
