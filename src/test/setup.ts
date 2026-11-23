import '@testing-library/jest-dom/vitest'
import { cleanup, configure } from '@testing-library/react'
import { afterAll, afterEach, beforeAll } from 'vitest'
import { server } from './server'

// The first request of each test worker starts cold (MSW interceptor, fetch,
// first zod parse) while the other workers run in parallel, and can take over
// the default 1000 ms of waitFor/findBy. This only changes how long they wait
// before giving up, not what any test checks.
configure({ asyncUtilTimeout: 5000 })

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
