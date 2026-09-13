import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e/docs',
  testMatch: 'release-navigation.spec.ts',
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report-ssg', open: 'never' }]],
  outputDir: 'test-results-ssg',
  use: {
    baseURL: 'http://localhost:4899',
    locale: 'zh-CN',
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'ssg-desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'ssg-mobile', use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' } },
  ],
  webServer: {
    command: 'pnpm -C docs exec vite preview --port 4899 --strictPort',
    url: 'http://localhost:4899',
    reuseExistingServer: false,
  },
})
