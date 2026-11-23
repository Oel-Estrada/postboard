import { describe, expect, it } from 'vitest'
import { getInitials } from './getInitials'

describe('getInitials', () => {
  it('takes the first letter of the first two words', () => {
    expect(getInitials('Leanne Graham')).toBe('LG')
    expect(getInitials('Nicholas Runolfsdottir V')).toBe('NR')
    expect(getInitials('ervin howell')).toBe('EH')
  })

  it('skips honorifics', () => {
    expect(getInitials('Mrs. Dennis Schulist')).toBe('DS')
  })
})
