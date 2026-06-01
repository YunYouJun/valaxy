import type { Alias } from 'vite'
import process from 'node:process'
import { describe, expect, it } from 'vitest'
import { resolveOptions } from '../packages/valaxy/node'
import { getAlias } from '../packages/valaxy/node/plugins/extendConfig'
import { getAddonRoot, readAddonModule } from '../packages/valaxy/node/utils/addons'
import pkg from './fixtures/addon/package.json'
import { fixtureFolder } from './shared'

describe('addon parse', () => {
  it('addon:read:module', async () => {
    const options = await readAddonModule('./test/fixtures/addon', { cwd: process.cwd() })
    const result = {
      enable: true,
      name: 'valaxy-addon-test',
      global: false,
      root: await getAddonRoot('./test/fixtures/addon', process.cwd()),
      options: {},
      props: {},
      pkg,
    }
    expect(options).toEqual(result)
  })
})

describe('addon alias', () => {
  it('should include general subpath alias for addon before bare import alias', async () => {
    const options = await resolveOptions({ userRoot: fixtureFolder.userRoot })
    // Inject a fake addon to test alias generation
    options.addons = [{
      enable: true,
      name: 'valaxy-addon-test',
      global: false,
      root: '/fake/addon/root',
      options: {},
      props: {},
      pkg: { name: 'valaxy-addon-test' } as any,
    }]
    const aliases = await getAlias(options) as Alias[]

    // Find addon-specific aliases (both string and regex)
    const addonAliases = aliases.filter((a) => {
      if (typeof a.find === 'string')
        return a.find.startsWith('valaxy-addon-test')
      if (a.find instanceof RegExp)
        return a.find.test('valaxy-addon-test/components/Foo.vue')
      return false
    })

    // Should have: client/, App.vue, general subpath (regex), bare import
    expect(addonAliases.length).toBeGreaterThanOrEqual(4)

    // General subpath alias uses a regex to avoid Vite's trailing-slash normalization
    const generalSubpathAlias = addonAliases.find(a => a.find instanceof RegExp)
    const bareImportAlias = addonAliases.find(a => a.find === 'valaxy-addon-test')

    // General subpath alias must exist and match subpath imports
    expect(generalSubpathAlias).toBeDefined()
    expect(generalSubpathAlias!.find).toBeInstanceOf(RegExp)
    expect((generalSubpathAlias!.find as RegExp).test('valaxy-addon-test/components/Foo.vue')).toBe(true)
    expect((generalSubpathAlias!.find as RegExp).test('valaxy-addon-test')).toBe(false)
    expect(generalSubpathAlias!.replacement).toContain('/fake/addon/root/')

    // Bare import alias must point to client/index.ts
    expect(bareImportAlias).toBeDefined()
    expect(bareImportAlias!.replacement).toContain('/fake/addon/root/client/index.ts')

    // General subpath alias must come before bare import alias (so subpath imports match first)
    const subpathIdx = aliases.indexOf(generalSubpathAlias!)
    const bareIdx = aliases.indexOf(bareImportAlias!)
    expect(subpathIdx).toBeLessThan(bareIdx)
  })
})

describe('vue/vue-router alias', () => {
  // The markdown transform injects `import { provide, shallowRef } from 'vue'`
  // and `import { useRoute, useRouter } from 'vue-router'` into every user page.
  // Pinning the bare specifiers to valaxy's own resolved copy keeps those imports
  // resolvable regardless of the user's package manager / hoisting layout, avoiding
  // the runtime "Failed to resolve module specifier vue-router" error.
  // See: https://github.com/YunYouJun/valaxy/issues/704 (and #701)
  it('pins bare `vue` and `vue-router` to valaxy\'s resolved copy', async () => {
    const options = await resolveOptions({ userRoot: fixtureFolder.userRoot })
    const aliases = await getAlias(options) as Alias[]

    const matchExact = (spec: string) =>
      aliases.find(a => a.find instanceof RegExp && a.find.source === `^${spec}$`)

    const vueAlias = matchExact('vue')
    const vueRouterAlias = matchExact('vue-router')

    expect(vueRouterAlias).toBeDefined()
    expect(vueRouterAlias!.replacement).toContain('vue-router')
    // exact match only — subpath imports must keep resolving normally
    expect((vueRouterAlias!.find as RegExp).test('vue-router')).toBe(true)
    expect((vueRouterAlias!.find as RegExp).test('vue-router/vite')).toBe(false)
    expect((vueRouterAlias!.find as RegExp).test('vue-router/auto-routes')).toBe(false)

    expect(vueAlias).toBeDefined()
    expect((vueAlias!.find as RegExp).test('vue')).toBe(true)
    expect((vueAlias!.find as RegExp).test('vue/server-renderer')).toBe(false)
  })
})
