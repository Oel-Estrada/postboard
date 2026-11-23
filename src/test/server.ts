import { setupServer } from 'msw/node'
import { handlers } from './handlers'

/** MSW server that intercepts every request made by the unit and integration tests. */
export const server = setupServer(...handlers)
