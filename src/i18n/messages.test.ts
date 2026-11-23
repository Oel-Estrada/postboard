import { describe, expect, it } from 'vitest'
import { messages } from './messages'

// Components and their tests read texts from `messages`, so a broken function
// would pass there too. Texts built from data are checked here against literals.
describe('messages', () => {
  it('interpolates data into the texts that need it', () => {
    expect(messages.app.pageTitle('Ervin Howell')).toBe('Ervin Howell · Postboard')
    expect(messages.users.usernameHandle('Bret')).toBe('@Bret')
    expect(messages.users.noUsersMatch('zzz')).toBe('No users match "zzz".')
  })
})
