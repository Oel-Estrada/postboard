import { describe, expect, it } from 'vitest'
import { messages } from '../i18n/messages'
import { validatePost } from './validatePost'

describe('validatePost', () => {
  it('requires a title and a text, also when they only contain spaces', () => {
    expect(validatePost({ title: '', body: '   ' })).toEqual({
      title: messages.form.titleRequired,
      body: messages.form.bodyRequired,
    })
  })
})
