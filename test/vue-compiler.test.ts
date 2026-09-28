import type { Options } from '@vitejs/plugin-vue'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { beforeAll, describe, expect, it, vi } from 'vitest'
import { createValaxyNode, resolveOptions, ViteValaxyPlugins } from '../packages/valaxy/node'
import { fixtureFolder } from './shared'

// This compiler has no TypeScript filesystem fallback. Otherwise the workspace's
// TypeScript 5 ts.sys would hide the failure seen with TypeScript 7 (#742).
const require = createRequire(import.meta.url)
const compilerUrl = pathToFileURL(require.resolve('@vue/compiler-sfc/dist/compiler-sfc.esm-browser.js'))
const compiler: typeof import('@vue/compiler-sfc') = await import(compilerUrl.href)

async function resolveVueOptions(vue: Options = {}): Promise<Options> {
  const options = await resolveOptions({ userRoot: fixtureFolder.userRoot }, 'build')
  options.config.vue = vue
  const plugins = await ViteValaxyPlugins(createValaxyNode(options))
  const plugin = plugins.flat().find(plugin => plugin && typeof plugin === 'object' && 'name' in plugin && plugin.name === 'vite:vue')
  if (!plugin || !('api' in plugin))
    throw new Error('Missing Vue plugin')
  return plugin.api.options
}

describe('vue imported prop types', () => {
  let vueOptions: Options

  beforeAll(async () => {
    vueOptions = await resolveVueOptions({ script: { propsDestructure: false } })
  })

  it.each(['App.vue', 'components/MetingJs.vue'])('compiles Meting %s without ts.sys', (entry) => {
    const filename = fileURLToPath(new URL(`../packages/valaxy-addon-meting/${entry}`, import.meta.url))
    const { descriptor } = compiler.parse(readFileSync(filename, 'utf8'), { filename })
    const result = compiler.compileScript(descriptor, { ...vueOptions.script, id: entry })

    expect(result.bindings).toMatchObject({ id: 'props', server: 'props', type: 'props', fixed: 'props', api: 'props' })
    expect(result.content).toContain('default: \'308168565\'')
    expect(result.content).toContain('default: \'netease\'')
    expect(result.content).toContain('default: \'playlist\'')
  })

  it('distinguishes type directories from files and handles missing paths', () => {
    const typesDir = fileURLToPath(new URL('../packages/valaxy-addon-meting/types', import.meta.url))
    const fs = vueOptions.script?.fs
    expect(fs).toBeDefined()
    expect(fs!.fileExists(typesDir)).toBe(false)
    expect(fs!.fileExists(`${typesDir}/index.ts`)).toBe(true)
    expect(fs!.fileExists(`${typesDir}/missing.ts`)).toBe(false)
    expect(fs!.fileExists(`${typesDir}/index.ts/missing.ts`)).toBe(false)
    expect(vueOptions.script?.propsDestructure).toBe(false)
  })

  it('preserves a user-provided compiler filesystem and other script options', async () => {
    const fs = { fileExists: vi.fn(() => false), readFile: vi.fn(() => undefined) }
    const options = await resolveVueOptions({ script: { fs, propsDestructure: false } })
    expect(options.script?.fs).toBe(fs)
    expect(options.script?.propsDestructure).toBe(false)
  })
})
