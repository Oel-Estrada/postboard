/** Matches Tailwind's `md` breakpoint (48rem). Keep both in sync. */
export const MD_BREAKPOINT_REM = 48

/** Media query for viewports narrower than `md`, in range syntax. */
export const NARROW_VIEWPORT_QUERY = `(width < ${MD_BREAKPOINT_REM}rem)`
