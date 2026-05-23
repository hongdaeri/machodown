import { defineConfig } from '@playwright/test'
import { join } from 'path'

export default defineConfig({
  testDir: './e2e',
  timeout: 30_000,
  retries: 1,
  workers: 1,
  use: {
    trace: 'on-first-retry',
    screenshot: 'only-on-failure'
  },
  projects: [
    {
      name: 'electron',
      testMatch: '**/*.spec.ts',
      use: {
        // built app entry point — run `npm run build` before e2e
        launchOptions: {
          args: [join(__dirname, 'out/main/index.js')]
        }
      }
    }
  ],
  reporter: [['list'], ['html', { open: 'never' }]]
})
