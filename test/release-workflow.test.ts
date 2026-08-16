import { readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const releaseWorkflow = readFileSync(
  new URL('../.github/workflows/release.yml', import.meta.url),
  'utf8',
)
const addonWorkflow = readFileSync(
  new URL('../.github/workflows/release-addon.yml', import.meta.url),
  'utf8',
)

describe('npm release workflows', () => {
  it('publishes through the single OIDC-enabled release workflow', () => {
    expect(releaseWorkflow).toContain('id-token: write')
    expect(releaseWorkflow).toContain('environment: npm')
    expect(releaseWorkflow).toContain('node-version: \'24\'')
    expect(releaseWorkflow).toContain('package-manager-cache: false')
    expect(releaseWorkflow).toContain('pnpm install --frozen-lockfile')
    expect(releaseWorkflow).not.toMatch(/NPM_TOKEN|NODE_AUTH_TOKEN/)
    expect(releaseWorkflow).not.toContain('NPM_CONFIG_PROVENANCE')
  })

  it('routes addon releases through the trusted workflow', () => {
    expect(addonWorkflow).toContain('gh workflow run release.yml')
    expect(addonWorkflow).not.toMatch(/pnpm publish|NPM_TOKEN|NODE_AUTH_TOKEN/)
    expect(addonWorkflow).not.toContain('id-token: write')
  })
})
