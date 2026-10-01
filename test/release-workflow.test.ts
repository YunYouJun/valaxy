import { spawnSync } from 'node:child_process'
import { readdirSync, readFileSync } from 'node:fs'
import { load } from 'js-yaml'
import { describe, expect, it } from 'vitest'

const workflowsDir = new URL('../.github/workflows/', import.meta.url)
const sources = Object.fromEntries(readdirSync(workflowsDir)
  .filter(filename => filename.endsWith('.yml'))
  .map(filename => [filename, readFileSync(new URL(filename, workflowsDir), 'utf8')]))

interface Workflow {
  on: Record<string, { inputs?: Record<string, { required: boolean, type: string }> }>
  jobs: Record<string, {
    environment?: string
    permissions: Record<string, string>
    steps: { 'id'?: string, 'run'?: string, 'env'?: Record<string, string>, 'working-directory'?: string }[]
  }>
}

const release = load(sources['release.yml']) as Workflow
const legacyAddon = load(sources['release-addon.yml']) as Workflow
const addonDirectory = /^\$\{\{\s*steps\.addon\.outputs\.dir\s*\}\}$/

describe('npm release workflows', () => {
  it('keeps both trusted publisher entry points OIDC-only with frozen dependencies', () => {
    const publishingWorkflows = Object.keys(sources).filter(filename => sources[filename].includes('pnpm publish'))
    expect(publishingWorkflows.sort()).toEqual(['release-addon.yml', 'release.yml'])

    for (const filename of publishingWorkflows) {
      expect(sources[filename]).not.toMatch(/NPM_TOKEN|NODE_AUTH_TOKEN/)
      const workflow = load(sources[filename]) as Workflow
      for (const job of Object.values(workflow.jobs)) {
        expect(job.permissions['id-token']).toBe('write')
        expect(job.steps.some(step => step.run === 'pnpm install --frozen-lockfile')).toBe(true)
      }
    }
  })

  it('retains separate coordinated and standalone publication jobs', () => {
    expect(Object.keys(release.jobs).sort()).toEqual(['release', 'release-addon'])
    expect(release.on).toHaveProperty('push')
    expect(release.on.workflow_dispatch.inputs?.addon).toMatchObject({ required: true, type: 'string' })
    expect(release.jobs['release-addon'].steps).toContainEqual(expect.objectContaining({
      'working-directory': expect.stringMatching(addonDirectory),
      'run': 'pnpm publish --access public --no-git-checks',
    }))
  })

  it('preserves the legacy identity with a manual-only, validated addon input', () => {
    expect(Object.keys(legacyAddon.on)).toEqual(['workflow_dispatch'])
    expect(legacyAddon.on.workflow_dispatch.inputs?.addon).toMatchObject({ required: true, type: 'string' })
    const job = legacyAddon.jobs['release-addon']
    expect(job.environment).toBeUndefined()
    const resolver = job.steps.find(step => step.id === 'addon')!
    expect(resolver.env?.ADDON_INPUT).toMatch(/^\$\{\{\s*inputs\.addon\s*\}\}$/)
    // A name allowlist keeps the manually selected directory inside packages.
    expect(resolver.run).toContain('=~ ^[a-z0-9]+([a-z0-9-]*[a-z0-9])?$')
    expect(resolver.run).toContain('exit 1')
    expect(job.steps).toContainEqual(expect.objectContaining({
      'working-directory': expect.stringMatching(addonDirectory),
      'run': 'pnpm publish --access public --no-git-checks',
    }))
  })

  it('validates addon inputs before installing dependencies', () => {
    const steps = release.jobs['release-addon'].steps
    const resolverIndex = steps.findIndex(step => step.id === 'addon')
    expect(resolverIndex).toBeGreaterThanOrEqual(0)
    expect(steps.findIndex(step => step.run === 'pnpm install --frozen-lockfile')).toBeGreaterThan(resolverIndex)
  })

  it.skipIf(process.platform === 'win32').each([
    ['workflow_dispatch', 'meting', ''],
    ['push', '', 'release(addon-meting): publish'],
  ])('rejects Meting in release.yml for %s', (event, addon, commit) => {
    const run = release.jobs['release-addon'].steps.find(step => step.id === 'addon')!.run!
    const result = spawnSync('bash', ['-e', '-c', run], {
      cwd: new URL('../', import.meta.url),
      encoding: 'utf8',
      env: {
        ...process.env,
        EVENT_NAME: event,
        ADDON_INPUT: addon,
        COMMIT_MSG: commit,
        GITHUB_OUTPUT: '/dev/null',
      },
    })
    expect(result.error).toBeUndefined()
    expect(result.status).toBe(1)
    expect(result.stdout).toContain('::error::Meting must use the Release Addon workflow (release-addon.yml).')
  })
})
