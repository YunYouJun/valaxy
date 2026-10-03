import { execFileSync, spawnSync } from 'node:child_process'
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import process from 'node:process'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { checkReleaseVersions, releaseFiles } from '../scripts/release-check'

const releaseScript = resolve('scripts/release.ts')
const tsx = resolve('node_modules/tsx/dist/cli.mjs')
let directory: string
let root: string
let remote: string

function git(...args: string[]) {
  return execFileSync('git', args, { cwd: root, encoding: 'utf8' }).trim()
}

async function json(path: string, value: unknown) {
  await mkdir(dirname(join(root, path)), { recursive: true })
  await writeFile(join(root, path), `${JSON.stringify(value, null, 2)}\n`)
}

function release(...args: string[]) {
  return spawnSync(process.execPath, [tsx, releaseScript, ...args], { cwd: root, encoding: 'utf8' })
}

beforeEach(async () => {
  directory = await mkdtemp(join(tmpdir(), 'valaxy-release-test-'))
  root = join(directory, 'candidate')
  remote = join(directory, 'remote.git')
  await mkdir(root)
  for (const file of releaseFiles) {
    const name = file === 'package.json' ? '@valaxyjs/monorepo' : file.includes('/devtools/') ? '@valaxyjs/devtools' : file.replace(/^packages\//, '').replace(/\/package.json$/, '')
    await json(file, { name, version: '1.0.0-rc.16', private: true, scripts: { 'check:release': 'node -e "process.exit(23)"' } })
  }
  await json('packages/create-valaxy/template-blog/package.json', { dependencies: { 'valaxy': '1.0.0-rc.16', 'valaxy-theme-yun': '1.0.0-rc.16' } })
  await writeFile(join(root, 'pnpm-workspace.yaml'), 'packages:\n  - packages/*\n  - packages/@valaxyjs/*\n')
  git('init', '-b', 'main')
  git('config', 'user.email', 'test@example.invalid')
  git('config', 'user.name', 'Release test')
  git('add', '.')
  git('-c', 'commit.gpgSign=false', 'commit', '-m', 'chore(test): seed release fixture')
  execFileSync('git', ['init', '--bare', remote], { stdio: 'ignore' })
  git('remote', 'add', 'origin', remote)
  git('push', 'origin', 'main')
})

afterEach(async () => {
  await rm(directory, { recursive: true, force: true })
})

describe('release preparation and publication', () => {
  it('prepares every coordinated package, scaffold and lockfile without committing or tagging', async () => {
    const head = git('rev-parse', 'HEAD')
    const result = release('--prepare', '1.0.0')
    expect(result.status, result.stdout + result.stderr).toBe(0)
    expect(await checkReleaseVersions(root, 'v1.0.0')).toBe('1.0.0')
    expect(await readFile(join(root, 'pnpm-lock.yaml'), 'utf8')).toContain('lockfileVersion')
    expect(git('rev-parse', 'HEAD')).toBe(head)
    expect(git('tag', '--list')).toBe('')
    expect(git('ls-remote', 'origin', 'refs/heads/main')).toContain(head)
  }, 30000)

  it('rejects dirty input without changing any version or staging unrelated files', async () => {
    await writeFile(join(root, 'unrelated.txt'), 'keep me')
    const result = release('--prepare', '1.0.0')
    expect(result.status).toBe(1)
    expect(result.stdout + result.stderr).toContain('Commit or stash')
    expect(await checkReleaseVersions(root)).toBe('1.0.0-rc.16')
    expect(git('diff', '--cached', '--name-only')).toBe('')
  })

  it('rejects mismatched package, scaffold and tag versions', async () => {
    await expect(checkReleaseVersions(root, 'v1.0.0')).rejects.toThrow('does not match')
    await json('packages/valaxy/package.json', { name: 'valaxy', version: '1.0.0' })
    await expect(checkReleaseVersions(root)).rejects.toThrow('packages/valaxy/package.json')
    await json('packages/valaxy/package.json', { name: 'valaxy', version: '1.0.0-rc.16' })
    await json('packages/create-valaxy/template-blog/package.json', { dependencies: { valaxy: '1.0.0' } })
    await expect(checkReleaseVersions(root)).rejects.toThrow('template-blog requires valaxy')
  })

  it('does not create or push a tag when release checks fail', () => {
    const result = release('--publish')
    expect(result.status).toBe(1)
    expect(result.stdout + result.stderr).toContain('check:release failed')
    expect(git('tag', '--list')).toBe('')
    expect(git('ls-remote', 'origin', 'refs/tags/*')).toBe('')
  }, 30000)

  it('pushes only the checked release tag, leaving unrelated local tags private', async () => {
    const pkg = JSON.parse(await readFile(join(root, 'package.json'), 'utf8'))
    pkg.scripts['check:release'] = 'node -e "process.exit(0)"'
    await json('package.json', pkg)
    git('add', '.')
    git('-c', 'commit.gpgSign=false', 'commit', '-m', 'test(release): pass fixture preflight')
    git('push', 'origin', 'main')
    git('tag', 'unrelated-local-tag')
    const result = release('--publish')
    expect(result.status, result.stdout + result.stderr).toBe(0)
    expect(git('ls-remote', 'origin', 'refs/tags/*')).toContain('refs/tags/v1.0.0-rc.16')
    expect(git('ls-remote', 'origin', 'refs/tags/unrelated-local-tag')).toBe('')
    expect(git('status', '--porcelain')).toBe('')
  }, 30000)

  it('rejects unreviewed branches and local main that differs from origin', async () => {
    git('switch', '-c', 'candidate')
    const branchResult = release('--publish')
    expect(branchResult.status).toBe(1)
    expect(branchResult.stdout + branchResult.stderr).toContain('reviewed main branch')
    git('switch', 'main')
    await writeFile(join(root, 'notes.md'), 'pending review')
    git('add', '.')
    git('-c', 'commit.gpgSign=false', 'commit', '-m', 'docs(release): add candidate notes')
    const result = release('--publish')
    expect(result.status).toBe(1)
    expect(result.stdout + result.stderr).toContain('must match origin/main')
    expect(git('tag', '--list')).toBe('')
  })
})
