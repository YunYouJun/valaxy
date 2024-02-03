import { defineConfig } from 'cypress'

const ports = {
  'docs': 4859,
  'theme-yun': 4860,
  'create-valaxy': 4861,
}

// ports to env url
const env = Object.fromEntries(
  Object.entries(ports).map(([key, value]) => [
    key,
    `http://localhost:${value}/`,
  ]),
)

const baseUrl = env['theme-yun']

export default defineConfig({
  projectId: 'valaxy',
  e2e: {
    baseUrl,
    chromeWebSecurity: false,
    specPattern: 'cypress/e2e/**/*.spec.*',
    supportFile: false,
  },
  env,
})
