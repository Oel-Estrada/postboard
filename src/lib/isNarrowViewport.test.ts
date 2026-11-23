import { afterEach, describe, expect, it, vi } from 'vitest'
import { NARROW_VIEWPORT_QUERY } from './breakpoints'
import { isNarrowViewport } from './isNarrowViewport'

describe('isNarrowViewport', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('is true when the viewport is below the md breakpoint', () => {
    const matchMedia = vi.fn((query: string) => ({ matches: true, media: query }))
    vi.stubGlobal('matchMedia', matchMedia)

    expect(isNarrowViewport()).toBe(true)
    expect(matchMedia).toHaveBeenCalledWith(NARROW_VIEWPORT_QUERY)
    expect(NARROW_VIEWPORT_QUERY).toBe('(width < 48rem)')
  })
})
