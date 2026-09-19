import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 300_000,
  workers: 1,
  reporter: 'list',
})
