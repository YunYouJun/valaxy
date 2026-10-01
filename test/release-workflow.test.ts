import { spawnSync } from 'node:child_process'
import { chmodSync, existsSync, mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { delimiter, dirname, join } from 'node:path'
import { load } from 'js-yaml'
import { afterEach, describe, expect, it } from 'vitest'

const workflowsDir = new URL('../.github/workflows/', import.meta.url)
const sources = Object.fromEntries(readdirSync(workflowsDir)
  .filter(filename => filename.endsWith('.yml'))
  .map(filename => [filename, readFileSync(new URL(filename, workflowsDir), 'utf8')]))

interface Workflow {
  'run-name': string
  'on': Record<string, { inputs?: Record<string, { required: boolean, type: string }> }>
  'jobs': Record<string, {
    environment?: string
    permissions: Record<string, string>
    steps: { 'id'?: string, 'run'?: string, 'env'?: Record<string, string>, 'working-directory'?: string }[]
  }>
}

const release = load(sources['release.yml']) as Workflow
const legacyAddon = load(sources['release-addon.yml']) as Workflow
const addonDirectory = /^\$\{\{\s*steps\.addon\.outputs\.dir\s*\}\}$/
const addonWorkflows = [
  ['release.yml', release, 'environment: npm'],
  ['release-addon.yml', legacyAddon, 'no environment'],
] as const
const fixtures: string[] = []

afterEach(() => {
  for (const fixture of fixtures)
    rmSync(fixture, { recursive: true, force: true })
  fixtures.length = 0
})

function fixture() {
  const root = mkdtempSync(join(tmpdir(), 'valaxy-release-workflow-'))
  fixtures.push(root)
  const bin = join(root, 'bin')
  mkdirSync(bin)
  const pnpm = join(bin, 'pnpm')
  writeFileSync(pnpm, `#!/usr/bin/env bash
printf '%s\\n' "$*" >> "$FAKE_PNPM_CALLS"
if [[ "$FAKE_PNPM_STATUS" != 0 ]]; then
  echo 'ERR_PNPM_AUTH_TOKEN_EXCHANGE: simulated OIDC failure' >&2
fi
exit "$FAKE_PNPM_STATUS"
`)
  chmodSync(pnpm, 0o755)
  const output = join(root, 'output')
  const summary = join(root, 'summary')
  const calls = join(root, 'pnpm-calls')
  for (const path of [output, summary, calls])
    writeFileSync(path, '')
  return { root, bin, output, summary, calls }
}

function packageFixture(root: string, directory: string, name: string) {
  const cwd = join(root, directory)
  mkdirSync(cwd, { recursive: true })
  writeFileSync(join(cwd, 'package.json'), JSON.stringify({ name, version: '0.9.0' }))
  return cwd
}

function runStep(run: string, files: ReturnType<typeof fixture>, env: Record<string, string> = {}, cwd = files.root) {
  const result = spawnSync('bash', ['--noprofile', '--norc', '-e', '-o', 'pipefail', '-c', run], {
    cwd,
    encoding: 'utf8',
    env: {
      ...process.env,
      PATH: [files.bin, dirname(process.execPath), process.env.PATH].join(delimiter),
      GITHUB_OUTPUT: files.output,
      GITHUB_STEP_SUMMARY: files.summary,
      FAKE_PNPM_CALLS: files.calls,
      FAKE_PNPM_STATUS: '0',
      ...env,
    },
  })
  if (result.error)
    throw result.error
  return result
}

function resolver(workflow: Workflow) {
  return workflow.jobs['release-addon'].steps.find(step => step.id === 'addon')!.run!
}

function publisher(workflow: Workflow) {
  return workflow.jobs['release-addon'].steps.find(step => addonDirectory.test(step['working-directory'] ?? ''))!.run!
}

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
    expect(release.jobs.release.environment).toBe('npm')
    expect(release.jobs['release-addon'].environment).toBe('npm')
    expect(release.jobs['release-addon'].steps).toContainEqual(expect.objectContaining({
      'working-directory': expect.stringMatching(addonDirectory),
      'run': expect.stringContaining('pnpm publish --access public --no-git-checks'),
    }))
  })

  it('preserves the legacy identity with a manual-only, validated addon input', () => {
    expect(Object.keys(legacyAddon.on)).toEqual(['workflow_dispatch'])
    expect(legacyAddon.on.workflow_dispatch.inputs?.addon).toMatchObject({ required: true, type: 'string' })
    const job = legacyAddon.jobs['release-addon']
    expect(job.environment).toBeUndefined()
    const resolver = job.steps.find(step => step.id === 'addon')!
    expect(resolver.env?.ADDON_INPUT).toMatch(/^\$\{\{\s*inputs\.addon\s*\}\}$/)
    expect(job.steps).toContainEqual(expect.objectContaining({
      'working-directory': expect.stringMatching(addonDirectory),
      'run': expect.stringContaining('pnpm publish --access public --no-git-checks'),
    }))
  })

  it('shows the publishing identity and directs Meting to Release Addon', () => {
    expect(release['run-name']).toContain('release.yml')
    expect(legacyAddon['run-name']).toContain('release-addon.yml')
    expect(release.on.workflow_dispatch.inputs?.addon).toHaveProperty('description', expect.stringMatching(/meting.*Release Addon/))
    expect(legacyAddon.on.workflow_dispatch.inputs?.addon).toHaveProperty('description', expect.stringContaining('release-addon.yml'))
  })

  it.each(addonWorkflows)('validates the target before installing dependencies in %s', (_filename, workflow) => {
    const steps = workflow.jobs['release-addon'].steps
    const resolveIndex = steps.findIndex(step => step.id === 'addon')
    const installIndex = steps.findIndex(step => step.run === 'pnpm install --frozen-lockfile')
    expect(resolveIndex).toBeGreaterThanOrEqual(0)
    expect(installIndex).toBeGreaterThan(resolveIndex)
  })
})

// These are the workflow's actual Bash run blocks. Windows keeps all metadata
// coverage above; the GitHub publishing jobs themselves run on Ubuntu.
describe.skipIf(process.platform === 'win32')('npm release Bash behavior', () => {
  it.each([
    ['workflow_dispatch', 'meting', ''],
    ['push', '', 'release(addon-meting): publish the addon'],
  ])('rejects the wrong Meting identity for %s before producing a target', (event, addon, commit) => {
    const files = fixture()
    packageFixture(files.root, 'packages/valaxy-addon-meting', 'valaxy-addon-meting')
    const result = runStep(resolver(release), files, { EVENT_NAME: event, ADDON_INPUT: addon, COMMIT_MSG: commit })

    expect(result.status).toBe(1)
    expect(result.stdout).toContain('Select Release Addon with addon=meting')
    expect(result.stdout).toContain('gh workflow run release-addon.yml --ref main -f addon=meting')
    expect(readFileSync(files.output, 'utf8')).toBe('')
    expect(readFileSync(files.calls, 'utf8')).toBe('')
  })

  it('accepts Meting with its existing release-addon.yml identity', () => {
    const files = fixture()
    packageFixture(files.root, 'packages/valaxy-addon-meting', 'valaxy-addon-meting')
    const result = runStep(resolver(legacyAddon), files, { ADDON_INPUT: 'meting' })

    expect(result.status).toBe(0)
    expect(readFileSync(files.output, 'utf8')).toBe('dir=packages/valaxy-addon-meting\n')
  })

  it('resolves the standalone Yun theme in release.yml', () => {
    const files = fixture()
    packageFixture(files.root, 'packages/valaxy-theme-yun', 'valaxy-theme-yun')
    const result = runStep(resolver(release), files, { EVENT_NAME: 'workflow_dispatch', ADDON_INPUT: 'theme-yun' })

    expect(result.status).toBe(0)
    expect(readFileSync(files.output, 'utf8')).toBe('dir=packages/valaxy-theme-yun\n')
  })

  it.each(addonWorkflows)('continues to resolve a valid new addon in %s', (_filename, workflow) => {
    const files = fixture()
    packageFixture(files.root, 'packages/valaxy-addon-fixture-addon', 'valaxy-addon-fixture-addon')
    const result = runStep(resolver(workflow), files, { EVENT_NAME: 'workflow_dispatch', ADDON_INPUT: 'fixture-addon' })

    expect(result.status).toBe(0)
    expect(readFileSync(files.output, 'utf8')).toBe('dir=packages/valaxy-addon-fixture-addon\n')
  })

  it('resolves a valid addon from the automatic release commit', () => {
    const files = fixture()
    packageFixture(files.root, 'packages/valaxy-addon-fixture-addon', 'valaxy-addon-fixture-addon')
    const result = runStep(resolver(release), files, { EVENT_NAME: 'push', COMMIT_MSG: 'release(addon-fixture-addon): publish the addon' })

    expect(result.status).toBe(0)
    expect(readFileSync(files.output, 'utf8')).toBe('dir=packages/valaxy-addon-fixture-addon\n')
  })

  describe.each(addonWorkflows)('%s', (filename, workflow, environmentLabel) => {
    it.each(['../meting', 'meting; touch injected', '$(touch injected)'])('rejects malformed addon %s', (addon) => {
      const files = fixture()
      const result = runStep(resolver(workflow), files, { EVENT_NAME: 'workflow_dispatch', ADDON_INPUT: addon })

      expect(result.status).toBe(1)
      expect(result.stdout).toContain('Invalid addon name:')
      expect(readFileSync(files.output, 'utf8')).toBe('')
      expect(existsSync(join(files.root, 'injected'))).toBe(false)
    })

    it('preserves the publish failure status and identifies the trusted publisher in diagnostics', () => {
      const files = fixture()
      const cwd = packageFixture(files.root, 'packages/valaxy-addon-fixture-addon', 'valaxy-addon-fixture-addon')
      const result = runStep(publisher(workflow), files, { FAKE_PNPM_STATUS: '42' }, cwd)
      const summary = readFileSync(files.summary, 'utf8')

      expect(result.status).toBe(42)
      expect(result.stdout).toContain('Failed to publish valaxy-addon-fixture-addon@0.9.0')
      expect(result.stdout).toContain('OIDC authentication errors')
      expect(result.stdout).toContain('YunYouJun/valaxy')
      expect(result.stdout).toContain(filename)
      expect(result.stdout).toContain(environmentLabel.replace(':', ''))
      expect(summary).toContain('Failed to publish valaxy-addon-fixture-addon@0.9.0')
      expect(summary).toContain(filename)
      expect(summary).toContain(environmentLabel)
      expect(readFileSync(files.calls, 'utf8')).toBe('publish --access public --no-git-checks\n')
    })

    it('records a successful publication without emitting an authentication error', () => {
      const files = fixture()
      const cwd = packageFixture(files.root, 'packages/valaxy-addon-fixture-addon', 'valaxy-addon-fixture-addon')
      const result = runStep(publisher(workflow), files, {}, cwd)

      expect(result.status).toBe(0)
      expect(result.stdout).not.toContain('::error::')
      expect(readFileSync(files.summary, 'utf8')).toContain(`Published valaxy-addon-fixture-addon@0.9.0 via ${filename} (${environmentLabel}).`)
      expect(readFileSync(files.calls, 'utf8')).toBe('publish --access public --no-git-checks\n')
    })
  })
})
