import { defineConfig, devices } from '@playwright/test'

const PORT = 4173
const BASE_URL = `http://localhost:${PORT}`

/**
 * End-to-end tests: only e2e/, only Chromium, against the production build.
 *
 * The server is `vite preview` over a fresh `vite build`, so the tests check
 * what ships (and React's development-only StrictMode double effects do not
 * run). It is never reused: an old preview could be serving an old build.
 */
export default defineConfig({
  testDir: './e2e',
  forbidOnly: !!process.env.CI,
  // A flaky E2E should fail, not pass on a second try.
  retries: 0,
  reporter: 'list',
  use: {
    baseURL: BASE_URL,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: {
    command: `pnpm build && pnpm preview --port ${PORT} --strictPort`,
    url: BASE_URL,
    reuseExistingServer: false,
    timeout: 120_000,
  },
})
