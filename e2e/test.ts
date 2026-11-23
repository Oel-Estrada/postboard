import { test as base, expect } from '@playwright/test'

interface ConsoleGuardFixtures {
  /**
   * Console errors a spec expects, such as the browser's own log of a request
   * the spec makes fail on purpose. Set it per spec with `test.use`.
   */
  allowedConsoleErrors: RegExp[]
  failOnConsoleErrors: void
}

/**
 * Playwright's `test` with a guard that runs in every spec: the spec fails if
 * the page logs a console error or warning (React reports problems there) or
 * throws an uncaught error. Specs import `test` and `expect` from here.
 */
export const test = base.extend<ConsoleGuardFixtures>({
  allowedConsoleErrors: [[], { option: true }],
  failOnConsoleErrors: [
    async ({ page, allowedConsoleErrors }, use) => {
      const problems: string[] = []
      page.on('console', (message) => {
        const type = message.type()
        if (type !== 'error' && type !== 'warning') return
        const text = message.text()
        if (allowedConsoleErrors.some((pattern) => pattern.test(text))) return
        problems.push(`console.${type}: ${text}`)
      })
      page.on('pageerror', (error) => {
        problems.push(`pageerror: ${error.message}`)
      })

      await use()

      expect(problems, 'console errors, warnings or uncaught page errors').toEqual([])
    },
    { auto: true },
  ],
})

export { expect }
