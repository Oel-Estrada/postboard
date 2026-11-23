import { describe, expect, it } from 'vitest'
import { users } from '../test/fixtures'
import { filterUsersByName } from './filterUsersByName'

describe('filterUsersByName', () => {
  it('returns every user when the query is empty or only spaces', () => {
    expect(filterUsersByName(users, '')).toEqual(users)
    expect(filterUsersByName(users, '   ')).toEqual(users)
  })

  it('matches names ignoring case and surrounding spaces', () => {
    expect(filterUsersByName(users, '  CLEM  ').map((user) => user.name)).toEqual([
      'Clementine Bauch',
      'Clementina DuBuque',
    ])
  })
})
