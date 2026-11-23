import type { AnyHandler } from 'msw'

/**
 * Default MSW handlers shared by every test. Tests override them per case
 * with `server.use(...)`.
 */
export const handlers: AnyHandler[] = []
