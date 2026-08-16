import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'

const releaseWorkflow = readFileSync(
  new URL('../.github/workflows/release.yml', import.meta.url),
  'utf8',
)
const workflowsDir = new URL('../.github/workflows/', import.meta.url)

describe('npm release workflows', () => {
  it('publishes through the single OIDC-enabled release workflow', () => {
    expect(releaseWorkflow).toContain('id-token: write')
    expect(releaseWorkflow).toContain('environment: npm')
    expect(releaseWorkflow).toContain('node-version: \'lts/*\'')
    expect(releaseWorkflow).toContain('package-manager-cache: false')
    expect(releaseWorkflow).toContain('pnpm install --frozen-lockfile')
    expect(releaseWorkflow).not.toMatch(/NPM_TOKEN|NODE_AUTH_TOKEN/)
    expect(releaseWorkflow).not.toContain('NPM_CONFIG_PROVENANCE')

    const publishingWorkflows = readdirSync(workflowsDir)
      .filter(filename => filename.endsWith('.yml'))
      .filter(filename => readFileSync(new URL(filename, workflowsDir), 'utf8').includes('pnpm publish'))

    expect(publishingWorkflows).toEqual(['release.yml'])
  })

  it('publishes addon releases from a separate job in the trusted workflow', () => {
    expect(releaseWorkflow).toContain('\'packages/valaxy-addon-*/package.json\'')
    expect(releaseWorkflow).toContain('contains(github.event.head_commit.message, \'release(addon-\')')
    expect(releaseWorkflow).toMatch(/working-directory: \$\{\{ steps\.addon\.outputs\.dir \}\}/)
    expect(releaseWorkflow).toContain('pnpm publish --access public --no-git-checks')
    expect(existsSync(new URL('../.github/workflows/release-addon.yml', import.meta.url))).toBe(false)
  })
})
