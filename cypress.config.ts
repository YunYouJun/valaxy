import { defineConfig } from 'cypress'

export default defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3333',
    chromeWebSecurity: false,
    specPattern: 'cypress/e2e/**/*.spec.*',
    supportFile: false,
  },
  env: {
    'theme-yun': 'http://localhost:3333/',
    'docs': 'http://localhost:4859/',
  },
})
