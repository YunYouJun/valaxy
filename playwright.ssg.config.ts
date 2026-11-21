import process from 'node:process'
import { defineConfig, devices } from '@playwright/test'

const suite = process.env.PLAYWRIGHT_SSG_SUITE || 'all'
const includeDocs = suite === 'all' || suite === 'docs'
const includeYun = suite === 'all' || suite === 'yun'

export default defineConfig({
  testDir: './e2e/docs',
  testMatch: [
    'release-navigation.spec.ts',
    'release-motion.spec.ts',
    'release-styles.ssg.spec.ts',
    'api-reference.spec.ts',
    'api-hydration.ssg.spec.ts',
    'sidebar.spec.ts',
    'footnote-preview.ssg.spec.ts',
  ],
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report-ssg', open: 'never' }]],
  outputDir: 'test-results-ssg',
  use: {
    baseURL: 'http://localhost:4899',
    locale: 'zh-CN',
    trace: 'retain-on-failure',
  },
  projects: [
    ...includeDocs
      ? [
          { name: 'ssg-desktop', use: { ...devices['Desktop Chrome'] } },
          {
            name: 'ssg-mobile',
            // release-motion overrides to a 1440px desktop viewport; sidebar group suites already cover 1440px & 390px.
            testIgnore: ['release-motion.spec.ts'],
            grepInvert: /sidebar groups at/,
            use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' as const },
          },
        ]
      : [],
    ...includeYun
      ? [
          {
            name: 'yun-footnote-desktop',
            testDir: './e2e/theme-yun',
            testMatch: '**/footnote-tooltip.spec.ts',
            use: { ...devices['Desktop Chrome'] },
          },
          {
            name: 'yun-footnote-mobile',
            testDir: './e2e/theme-yun',
            testMatch: '**/footnote-tooltip.spec.ts',
            use: { ...devices['iPhone 13'], defaultBrowserType: 'chromium' as const },
          },
        ]
      : [],
  ],
  webServer: [
    ...includeDocs
      ? [{
          command: 'pnpm -C docs exec vite preview --port 4899 --strictPort',
          url: 'http://localhost:4899',
          reuseExistingServer: false,
        }]
      : [],
    ...includeYun
      ? [{
          command: 'pnpm -C demo/yun exec vite preview --port 14173 --strictPort',
          url: 'http://localhost:14173',
          reuseExistingServer: false,
        }]
      : [],
  ],
})
