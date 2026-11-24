import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  expect: {
    timeout: 10000,
  },
  testDir: './e2e/docs',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 3 : undefined,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report-ssg', open: 'never' }]],
  outputDir: 'test-results-ssg',
  use: {
    baseURL: 'http://localhost:4899',
    locale: 'zh-CN',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'ssg-desktop',
      testMatch: '**/*.spec.ts',
      // search.spec.ts asserts the dev-only Vite DevTools shortcut conflict guard.
      testIgnore: ['search.spec.ts'],
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'ssg-mobile',
      testMatch: [
        'release-navigation.spec.ts',
        'route-chunk-recovery.ssg.spec.ts',
        'release-styles.ssg.spec.ts',
        'api-reference.spec.ts',
        'api-hydration.ssg.spec.ts',
        'sidebar.spec.ts',
        'footnote-preview.ssg.spec.ts',
      ],
      // sidebar group suites already cover 1440px & 390px.
      grepInvert: /sidebar groups at/,
      use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' as const },
    },
  ],
  webServer: [{
    command: 'pnpm -C docs exec vite preview --port 4899 --strictPort',
    url: 'http://localhost:4899',
    reuseExistingServer: false,
  }],
})
