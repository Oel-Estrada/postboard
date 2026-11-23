import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './server'

// Tests never reach the real network: any request without a handler fails.
// MSW 3 renamed `onUnhandledRequest` to `onUnhandledFrame`.
beforeAll(() => {
  server.listen({ onUnhandledFrame: 'error' })
})

afterEach(() => {
  // Vitest globals are off, so Testing Library cannot register its own cleanup.
  cleanup()
  server.resetHandlers()
})

afterAll(() => {
  server.close()
})
