import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { configDefaults, defineConfig } from 'vitest/config'

// https://vite.dev/config/ (Vitest's defineConfig also types the `test` block)
export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts',
    // findBy/waitFor may wait up to 5000 ms (asyncUtilTimeout in setup.ts). With
    // the default test timeout, also 5000 ms, one slow wait could use up the
    // whole test. This only sets how long a test may run, not what it checks.
    testTimeout: 15000,
    // Unit and integration tests live in src/; Playwright owns e2e/.
    include: ['src/**/*.test.{ts,tsx}'],
    exclude: [...configDefaults.exclude, 'e2e/**'],
  },
})
