// Internal types that are never validated: nothing outside the app produces them.

/** State of an async load: loading, loaded with `data`, or failed with `error`. */
export type AsyncState<T> =
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: Error }
