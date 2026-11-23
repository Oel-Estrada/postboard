import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { messages } from '../i18n/messages'
import { UserSearch } from './UserSearch'

describe('UserSearch', () => {
  it('is a labelled search box that reports what the user types', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<UserSearch value="clem" onChange={onChange} />)

    const searchBox = screen.getByRole('searchbox', { name: messages.users.searchLabel })
    expect(searchBox).toHaveValue('clem')

    await user.type(searchBox, 'e')

    expect(onChange).toHaveBeenLastCalledWith('cleme')
  })
})
