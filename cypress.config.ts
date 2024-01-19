import { defineConfig } from 'cypress'

const baseUrl = 'http://localhost:4860'

export default defineConfig({
  projectId: 'valaxy',
  e2e: {
    baseUrl,
    chromeWebSecurity: false,
    specPattern: 'cypress/e2e/**/*.spec.*',
    supportFile: false,
  },
  env: {
    'docs': 'http://localhost:4859/',
    'theme-yun': baseUrl,
  },
})
