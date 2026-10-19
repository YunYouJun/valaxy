import type { ViteDevServer } from 'vite'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createServer } from 'vite'
import { afterEach, describe, expect, it } from 'vitest'
import { createI18n } from 'vue-i18n'
import { scanPostFiles } from '../packages/valaxy/node/modules/utils'
import VueI18n from '../packages/valaxy/node/plugins/i18n'
import { createLayoutsPlugin } from '../packages/valaxy/node/plugins/layouts'
import Components from '../packages/valaxy/vendor/components/index.mjs'

const roots: string[] = []
const servers: ViteDevServer[] = []

afterEach(async () => {
  await Promise.all(servers.splice(0).map(server => server.close()))
  await Promise.all(roots.splice(0).map(root => rm(root, { recursive: true, force: true })))
})

async function fixture() {
  const root = await mkdtemp(join(tmpdir(), 'valaxy-plugins-'))
  roots.push(root)
  return root
}

async function write(root: string, path: string, source: string) {
  const file = join(root, path)
  await mkdir(join(file, '..'), { recursive: true })
  await writeFile(file, source)
  return file.replace(/\\/g, '/')
}

describe('published build plugin compatibility', () => {
  it('preserves root precedence after discovery, additions and deletions', async () => {
    const root = await fixture()
    // Names deliberately oppose the configured priority order.
    const dirs = ['z-core', 'y-theme', 'x-addon', 'a-user']
    const files = await Promise.all(dirs.map(dir => write(root, `${dir}/Shared.vue`, '<template><div /></template>')))
    const plugin = Components({
      // Duplicate globs must preserve the first occurrence's priority.
      dirs: [...dirs, 'z-core'].map(dir => join(root, dir)),
      allowOverrides: true,
      dts: join(root, 'components.d.ts'),
    })
    const server = await createServer({ configFile: false, root, plugins: [plugin], server: { watch: null } })
    servers.push(server)
    expect((await plugin.api!.findComponent('Shared'))?.from).toBe(files[3])

    await rm(files[3])
    server.watcher.emit('unlink', files[3])
    expect((await plugin.api!.findComponent('Shared'))?.from).toBe(files[2])
    await writeFile(files[3], '<template><span /></template>')
    server.watcher.emit('add', files[3])
    expect((await plugin.api!.findComponent('Shared'))?.from).toBe(files[3])
  })

  it('keeps layout overrides in order across layout additions and deletions', async () => {
    const root = await fixture()
    // Names deliberately oppose the configured priority order.
    const roots = ['z-core', 'y-theme', 'x-addon', 'a-user'].map(dir => join(root, dir).replace(/\\/g, '/'))
    await Promise.all([
      write(roots[0], 'layouts/default.vue', '<template><slot /></template>'),
      write(roots[1], 'layouts/Post.vue', '<template><slot /></template>'),
    ])
    const plugin = createLayoutsPlugin({ roots, userRoot: roots[3], clientRoot: roots[0], mode: 'dev', config: {} } as any)
    const server = await createServer({ configFile: false, root, plugins: [plugin], server: { watch: null } })
    servers.push(server)
    // Vite may rewrite `/@fs/<abs>` imports under its root to root-relative URLs, so match path suffixes.
    const registry = async () => (await server.transformRequest('virtual:generated-layouts'))!.code

    expect(await registry()).toMatch(/"post": lazyLayout\(\(\) => import\("[^"]*\/y-theme\/layouts\/Post\.vue"\)\)/)
    const user = await write(roots[3], 'layouts/post/index.vue', '<template><slot /></template>')
    server.watcher.emit('add', user)
    expect(await registry()).toContain(`/a-user/layouts/post/index.vue`)
    expect(await registry()).not.toContain('/y-theme/layouts/Post.vue')
    await rm(user)
    server.watcher.emit('unlink', user)
    expect(await registry()).toContain('/y-theme/layouts/Post.vue')
    expect(await registry()).toMatch(/import __layout_0 from "[^"]*\/z-core\/layouts\/default\.vue"/)
  })

  it('scans literal project roots and keeps brace patterns and exclusions', async () => {
    const root = join(await fixture(), '(preview)[2026]{site}')
    const first = await write(root, 'pages/posts/one.md', '# one')
    const nested = await write(root, 'pages/posts/nested/two.mdx', '# two')
    await write(root, 'pages/posts/ignored.md', '# ignored')
    await write(root, 'pages/posts/component.vue', '<template />')
    expect((await scanPostFiles(root, '**/*.{md,mdx}')).sort()).toEqual([first, join(root, 'pages/posts/ignored.md').replace(/\\/g, '/'), nested].sort())
    expect(await scanPostFiles(root, '**/!(ignored).md')).toContain(first)
    expect(await scanPostFiles(root, '**/!(ignored).md')).not.toContain(join(root, 'pages/posts/ignored.md').replace(/\\/g, '/'))
  })

  it('compiles scanned JSON and YAML locale resources with the stable compiler', async () => {
    const root = await fixture()
    await write(root, 'locales/en.json', '{ "welcome": "Hello {name}" }')
    await write(root, 'locales/zh-CN.yml', 'welcome: 你好 {name}\n')
    const entry = await write(root, 'messages.js', 'export { default } from \'@intlify/unplugin-vue-i18n/messages\'')
    const server = await createServer({
      configFile: false,
      root,
      plugins: [VueI18n({ include: [join(root, 'locales/*.{json,yml}')], runtimeOnly: true })],
      server: { watch: null },
    })
    servers.push(server)
    const { default: messages } = await server.ssrLoadModule(entry)
    const i18n = createI18n({ legacy: false, locale: 'en', messages })
    expect(i18n.global.t('welcome', { name: 'Valaxy' })).toBe('Hello Valaxy')
    i18n.global.locale.value = 'zh-CN'
    expect(i18n.global.t('welcome', { name: 'Valaxy' })).toBe('你好 Valaxy')
    i18n.dispose()
  })
})
