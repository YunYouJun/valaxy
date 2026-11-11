import type { Alias } from 'vite'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import { build, resolveConfig } from 'vite'
import { expect, it } from 'vitest'
import { resolveOptions } from '../../packages/valaxy/node'
import { getRolldownOutputOptions } from '../../packages/valaxy/node/build/bundle'
import { createConfigPlugin, getAlias } from '../../packages/valaxy/node/plugins/extendConfig'
import { fixtureFolder } from '../shared'

it.each(['lazy', true, false] as const)('respects compiler mode %s in the actual client dependency graph', async (mode) => {
  const root = await mkdtemp(join(tmpdir(), 'valaxy-template-compiler-'))
  try {
    const options = await resolveOptions({ userRoot: fixtureFolder.userRoot })
    expect(options.config.vue.browserTemplateCompilation).toBe('lazy')
    options.config.vue = { ...options.config.vue, browserTemplateCompilation: mode }
    const devConfig = await resolveConfig({ configFile: false, plugins: [createConfigPlugin(options)] }, 'serve')
    expect(devConfig.optimizeDeps.include).toContain('vue')
    expect(devConfig.optimizeDeps.include?.includes('vue/dist/vue.esm-bundler.js')).toBe(mode !== false)
    const alias = await getAlias(options) as Alias[]
    // Resolve the fixture's bare Vue import using the same installed runtime as
    // Valaxy, even though this entry lives outside the workspace's node_modules.
    alias.push({ find: /^vue$/, replacement: resolve('node_modules/vue/dist/vue.runtime.esm-bundler.js') })
    const component = resolve('packages/valaxy/client/components/ValaxyDynamicComponent.vue')
    await writeFile(join(root, 'entry.js'), `
      import { createApp, h } from 'vue'
      import DynamicTemplate from ${JSON.stringify(component)}
      globalThis.showTemplate = () => createApp({
        render: () => h(DynamicTemplate, { templateStr: '<p>Lazy template</p>' }),
      }).mount('#app')
    `)
    const result = await build({
      root,
      configFile: false,
      logLevel: 'silent',
      plugins: [vue()],
      resolve: { alias },
      build: {
        write: false,
        rolldownOptions: { input: join(root, 'entry.js'), output: getRolldownOutputOptions() },
      },
    })
    if (Array.isArray(result) || !('output' in result))
      throw new Error('Expected a single build output')
    const chunks = result.output.filter(chunk => chunk.type === 'chunk')
    const initial = new Set<string>()
    function visit(file: string) {
      if (initial.has(file))
        return
      initial.add(file)
      chunks.find(chunk => chunk.fileName === file)?.imports.forEach(visit)
    }
    chunks.filter(chunk => chunk.isEntry).forEach(chunk => visit(chunk.fileName))
    const compilers = chunks.filter(chunk => Object.keys(chunk.modules).some(id => /@vue[/\\]compiler-(?:core|dom)[/\\]/.test(id)))
    if (mode === false) {
      expect(compilers).toHaveLength(0)
    }
    else {
      expect(compilers.length).toBeGreaterThan(0)
      expect(compilers.some(chunk => initial.has(chunk.fileName))).toBe(mode === true)
    }
  }
  finally {
    await rm(root, { recursive: true, force: true })
  }
})
