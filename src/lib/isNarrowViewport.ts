import { NARROW_VIEWPORT_QUERY } from './breakpoints'

/**
 * Tells whether the viewport is narrower than the `md` breakpoint (the mobile layout).
 *
 * @returns `true` below `md`; `false` from `md` up or when `matchMedia` is unavailable.
 */
export function isNarrowViewport(): boolean {
  if (typeof window.matchMedia !== 'function') return false
  return window.matchMedia(NARROW_VIEWPORT_QUERY).matches
}
