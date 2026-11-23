import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import App from './App'
import { messages } from './i18n/messages'

describe('App', () => {
  it('renders the app heading', () => {
    render(<App />)

    expect(
      screen.getByRole('heading', { level: 1, name: messages.app.title }),
    ).toBeInTheDocument()
  })
})
