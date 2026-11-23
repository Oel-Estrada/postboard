// Internal types that are never validated: nothing outside the app produces them.

import type { PostEntry } from './schemas'

/** A post on screen; `pending` while its POST is in flight (optimistic). */
export interface DisplayPost extends PostEntry {
  pending?: boolean
}

/** State of an async load: loading, loaded with `data`, or failed with `error`. */
export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }
