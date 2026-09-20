import { mkdtemp, readFile, rm, symlink, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import fs from 'fs-extra'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { removeAddonFromConfig } from '../../packages/devtools/src/node/addons/config'
import { createAddonManager, fetchAddonPackage } from '../../packages/devtools/src/node/addons/manager'

let root: string
const name = 'valaxy-addon-waline'
const config = `import { defineValaxyConfig } from 'valaxy'
import { addonWaline as comments } from 'valaxy-addon-waline'
export default defineValaxyConfig({
  theme: 'yun', // keep theme
  addons: [comments({ serverURL: process.env.COMMENTS_URL }), 'meting'],
  siteConfig: { title: makeTitle() },
})
`

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'valaxy-addon-manager-'))
  await fs.writeJSON(join(root, 'package.json'), { name: 'blog', private: true, packageManager: 'pnpm@10.33.0', dependencies: {} })
  await writeFile(join(root, 'valaxy.config.ts'), 'export default { theme: \'yun\', addons: [] }\n')
})
afterEach(async () => {
  vi.unstubAllGlobals()
  await rm(root, { recursive: true, force: true })
})

async function addInstalled(addon = name, version?: string) {
  const pkg = await fs.readJSON(join(root, 'package.json'))
  pkg.dependencies[addon] = version || '^1.0.0'
  await fs.writeJSON(join(root, 'package.json'), pkg)
  await fs.outputJSON(join(root, 'node_modules', addon, 'package.json'), { name: addon, version: version || '1.0.1', description: 'Comments' })
}

function createManager(run: (root: string, args: string[], onLog: (text: string) => void) => Promise<void> = vi.fn(async () => {})) {
  return createAddonManager({ userRoot: root }, {
    fetchPackage: vi.fn(async packageName => ({ name: packageName, version: '1.2.3', description: 'Addon', peerDependencies: {} })),
    run,
  })
}

async function settle(manager: ReturnType<typeof createAddonManager>) {
  await expect.poll(async () => (await manager.inventory()).operation?.status).not.toBe('running')
  return (await manager.inventory()).operation!
}

describe('addon configuration removal', () => {
  it('removes aliased factory calls and their imports while preserving unrelated expressions and comments', () => {
    const after = removeAddonFromConfig(config, name)
    expect(after).not.toContain('valaxy-addon-waline')
    expect(after).not.toContain('comments(')
    expect(after).toContain('// keep theme')
    expect(after).toContain('makeTitle()')
    expect(after).toContain('\'meting\'')
  })

  it('handles short names, full names and object declarations without changing unrelated config', () => {
    const source = `export default { addons: ['waline', { name: '${name}', options: { nested: true } }, 'meting'], theme: 'yun' }`
    const result = removeAddonFromConfig(source, name)
    expect(result).not.toContain('waline')
    expect(result).toContain('meting')
    expect(removeAddonFromConfig(source, 'valaxy-addon-absent')).toBe(source)
  })

  it('rejects dynamic lists and bindings still used elsewhere', () => {
    expect(() => removeAddonFromConfig('export default makeConfig()', name)).toThrow(/dynamic/)
    expect(() => removeAddonFromConfig(`import '${name}/style.css'\nexport default { addons: [] }`, name)).toThrow(/outside/)
    expect(() => removeAddonFromConfig('export default { addons: myAddons }', name)).toThrow(/dynamic/)
    expect(() => removeAddonFromConfig(config.replace('theme: \'yun\'', 'theme: comments()'), name)).toThrow(/outside/)
    expect(() => removeAddonFromConfig(config.replace('\'meting\'', '...moreAddons'), name)).toThrow()
  })
})

describe('addon inventory and package operations', () => {
  it('lists ordinary installed addons and enabled transitive addons without requiring extension panels', async () => {
    await addInstalled()
    await fs.outputJSON(join(root, 'node_modules/valaxy-addon-components/package.json'), { name: 'valaxy-addon-components', version: '1.0.0' })
    const manager = createAddonManager({ userRoot: root, getAddons: () => [{ name: 'valaxy-addon-components', version: '1.0.0' }] })
    expect((await manager.inventory()).installed).toEqual([
      expect.objectContaining({ name: 'valaxy-addon-components', direct: false, enabled: true, version: '1.0.0' }),
      expect.objectContaining({ name, direct: true, enabled: false, version: '1.0.1', specifier: '^1.0.0' }),
    ])
    await expect(manager.prepare('remove', 'valaxy-addon-components')).rejects.toThrow(/direct dependencies/)
  })

  it('does not mutate files before confirmation and installs an exact reviewed version once', async () => {
    const before = await readFile(join(root, 'package.json'), 'utf8')
    const run = vi.fn(async (_root: string, args: string[], log: (text: string) => void) => {
      expect(args).toEqual(['add', '--save-exact', '--ignore-scripts', '--registry=https://registry.npmjs.org', `${name}@1.2.3`])
      log('Installed')
      await addInstalled(name, '1.2.3')
    })
    const manager = createManager(run)
    const plan = await manager.prepare('install', name)
    expect(plan.version).toBe('1.2.3')
    expect(await readFile(join(root, 'package.json'), 'utf8')).toBe(before)
    expect(run).not.toHaveBeenCalled()
    const jobs = await Promise.all([manager.apply(plan.id), manager.apply(plan.id)])
    expect(jobs[0].id).toBe(jobs[1].id)
    expect((await settle(manager)).status).toBe('succeeded')
    await manager.apply(plan.id)
    expect(run).toHaveBeenCalledTimes(1)
    expect((await manager.inventory()).installed[0].name).toBe(name)
  })

  it('rejects commands, URLs, unreviewed packages and operations without a preview', async () => {
    const run = vi.fn(async () => {})
    const manager = createManager(run)
    for (const invalid of ['--help', '../outside', 'valaxy-addon-waline;pwd', 'https://example.com/pkg.tgz', 'valaxy-addon-waline@latest'])
      await expect(manager.prepare('install', invalid)).rejects.toThrow()
    await expect(manager.prepare('install', 'valaxy-addon-not-curated')).rejects.toThrow(/catalog/)
    await expect(manager.apply('unknown')).rejects.toThrow(/preview expired/)
    expect(run).not.toHaveBeenCalled()
  })

  it('rejects a stale preview after package, lockfile or configuration edits', async () => {
    const manager = createManager()
    for (const file of ['valaxy.config.ts', 'pnpm-lock.yaml', 'package.json']) {
      const plan = await manager.prepare('install', name)
      if (file === 'package.json') {
        const pkg = await fs.readJSON(join(root, file))
        pkg.description = 'Changed outside DevTools'
        await fs.writeJSON(join(root, file), pkg)
      }
      else {
        await fs.appendFile(join(root, file), '\n# external change\n')
      }
      await expect(manager.apply(plan.id)).rejects.toThrow(/changed/)
    }
  })

  it('previews and removes a configured dependency, keeping unrelated configuration intact', async () => {
    await addInstalled()
    await writeFile(join(root, 'valaxy.config.ts'), config)
    const run = vi.fn(async (_root: string, args: string[]) => {
      expect(args).toEqual(['remove', '--ignore-scripts', name])
      expect(await readFile(join(root, 'valaxy.config.ts'), 'utf8')).not.toContain(name)
      const pkg = await fs.readJSON(join(root, 'package.json'))
      delete pkg.dependencies[name]
      await fs.writeJSON(join(root, 'package.json'), pkg)
      await fs.remove(join(root, 'node_modules', name))
    })
    const manager = createManager(run)
    const plan = await manager.prepare('remove', name)
    expect(plan.configBefore).toBe(config)
    expect(plan.configAfter).toContain('makeTitle()')
    expect(await readFile(join(root, 'valaxy.config.ts'), 'utf8')).toBe(config)
    await manager.apply(plan.id)
    expect((await settle(manager)).status).toBe('succeeded')
    expect((await manager.inventory()).installed).toEqual([])
  })

  it('restores unchanged configuration on failure but preserves concurrent user edits', async () => {
    await addInstalled()
    await writeFile(join(root, 'valaxy.config.ts'), config)
    const manager = createManager(vi.fn(async () => {
      throw new Error('Network unavailable')
    }))
    await manager.apply((await manager.prepare('remove', name)).id)
    expect((await settle(manager)).error).toContain('Network unavailable')
    expect(await readFile(join(root, 'valaxy.config.ts'), 'utf8')).toBe(config)
    const edited = 'export default { theme: \'new-theme\' }\n'
    const concurrent = createManager(vi.fn(async () => {
      await writeFile(join(root, 'valaxy.config.ts'), edited)
      throw new Error('Network unavailable')
    }))
    await concurrent.apply((await concurrent.prepare('remove', name)).id)
    expect((await settle(concurrent)).log).toContain('edited externally')
    expect(await readFile(join(root, 'valaxy.config.ts'), 'utf8')).toBe(edited)
  })

  it('keeps only a bounded log and serializes operations in one workspace', async () => {
    let finish!: () => void
    const waiting = new Promise<void>((resolve) => {
      finish = resolve
    })
    const manager = createManager(vi.fn(async (_root: string, _args: string[], log: (text: string) => void) => {
      log('x'.repeat(30_000))
      await waiting
      throw new Error('Expected failure')
    }))
    await manager.apply((await manager.prepare('install', name)).id)
    await expect(manager.prepare('install', 'valaxy-addon-meting')).rejects.toThrow(/already running/)
    finish()
    expect((await settle(manager)).log.length).toBe(20_000)
  })

  it('serializes the workspace root and a child project against their shared lockfile', async () => {
    await writeFile(join(root, 'pnpm-workspace.yaml'), 'packages:\n  - child\n')
    const child = join(root, 'child')
    await fs.outputJSON(join(child, 'package.json'), { name: 'child', private: true })
    let finish!: () => void
    const waiting = new Promise<void>((resolve) => {
      finish = resolve
    })
    const manager = createManager(vi.fn(async () => {
      await waiting
      throw new Error('Expected failure')
    }))
    const sibling = createAddonManager({ userRoot: child }, { fetchPackage: async packageName => ({ name: packageName, version: '1.2.3', description: '', peerDependencies: {} }) })
    const parentPlan = await manager.prepare('install', name)
    const childPlan = await sibling.prepare('install', name)
    expect(parentPlan.command).toContain('--workspace-root')
    expect(childPlan.command).not.toContain('--workspace-root')
    await manager.apply(parentPlan.id)
    await expect(sibling.apply(childPlan.id)).rejects.toThrow(/already running/)
    finish()
    await settle(manager)
  })

  it('checks other source imports before preview and again before execution', async () => {
    await addInstalled()
    const run = vi.fn(async () => {})
    const manager = createManager(run)
    const plan = await manager.prepare('remove', name)
    await writeFile(join(root, 'helper.ts'), `export { addonWaline } from '${name}'`)
    await expect(manager.prepare('remove', name)).rejects.toThrow(/helper.ts/)
    await expect(manager.apply(plan.id)).rejects.toThrow(/helper.ts/)
    expect(run).not.toHaveBeenCalled()
  })

  it('does not restore imports when a failed package command already removed the dependency', async () => {
    await addInstalled()
    await writeFile(join(root, 'valaxy.config.ts'), config)
    const manager = createManager(vi.fn(async () => {
      const pkg = await fs.readJSON(join(root, 'package.json'))
      delete pkg.dependencies[name]
      await fs.writeJSON(join(root, 'package.json'), pkg)
      throw new Error('Partial package failure')
    }))
    await manager.apply((await manager.prepare('remove', name)).id)
    expect((await settle(manager)).status).toBe('failed')
    expect(await readFile(join(root, 'valaxy.config.ts'), 'utf8')).not.toContain(name)
    expect((await manager.inventory()).operation?.log).toContain('already removed')
  })

  it('keeps browsing available for other package managers and rejects symlinked config writes', async () => {
    await fs.writeJSON(join(root, 'package.json'), { packageManager: 'npm@10.0.0' })
    const manager = createManager()
    expect((await manager.inventory()).packageManager).toBeNull()
    await expect(manager.prepare('install', name)).rejects.toThrow(/another package manager/)
    await fs.writeJSON(join(root, 'package.json'), { dependencies: { [name]: '1.0.0' } })
    await rm(join(root, 'valaxy.config.ts'))
    await symlink(join(tmpdir(), 'outside-valaxy.config.ts'), join(root, 'valaxy.config.ts'))
    await expect(manager.prepare('remove', name)).rejects.toThrow()
  })
})

describe('npm metadata', () => {
  it('uses a fixed registry, normalizes repository URLs, and drops unsafe links', async () => {
    const request = vi.fn(async () => new Response(JSON.stringify({ name, version: '1.2.3', repository: { url: 'git+https://github.com/example/addon' }, homepage: 'javascript:alert(1)', peerDependencies: { valaxy: '^1.0.0', bad: {} } })))
    vi.stubGlobal('fetch', request)
    expect(await fetchAddonPackage(name)).toMatchObject({ name, version: '1.2.3', repository: 'https://github.com/example/addon', homepage: undefined, peerDependencies: { valaxy: '^1.0.0' } })
    expect(request).toHaveBeenCalledWith(`https://registry.npmjs.org/${name}/latest`, expect.objectContaining({ redirect: 'error' }))
  })

  it('reports registry failures and rejects unexpected names or versions', async () => {
    vi.stubGlobal('fetch', vi.fn(async () => new Response('{}', { status: 503 })))
    await expect(fetchAddonPackage(name)).rejects.toThrow(/503/)
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ name, version: 'latest; echo unsafe' }))))
    await expect(fetchAddonPackage(name)).rejects.toThrow(/invalid/)
    vi.stubGlobal('fetch', vi.fn(async () => new Response(JSON.stringify({ name: 'other-package', version: '1.0.0' }))))
    await expect(fetchAddonPackage(name)).rejects.toThrow(/invalid/)
  })
})
