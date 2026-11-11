import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { build } from 'vite'
import { expect, it } from 'vitest'
import { getRolldownOutputOptions } from '../../packages/valaxy/node/build/bundle'

it.each([false, true])('keeps Fuse behind the search consumer (eager: %s)', async (eager) => {
  const root = await mkdtemp(join(tmpdir(), 'valaxy-search-bundle-'))
  try {
    // Model the public barrel: the entry reads config while the search consumer
    // imports a re-exported composable. Include the real config initialization.
    await writeFile(join(root, 'barrel.js'), `
      export * from ${JSON.stringify(resolve('packages/valaxy/client/config.ts'))}
      export * from ${JSON.stringify(resolve('packages/valaxy/client/composables/search/index.ts'))}
    `)
    await writeFile(join(root, 'search.js'), 'export { useFuseSearch } from "./barrel.js"')
    await writeFile(join(root, 'entry.js'), `
      import { useSiteConfig } from './barrel.js'
      globalThis.readConfig = useSiteConfig
      ${eager
        ? 'import { useFuseSearch } from "./barrel.js"; globalThis.search = useFuseSearch'
        : 'globalThis.search = () => import("./search.js")'}
    `)
    const result = await build({
      root,
      configFile: false,
      logLevel: 'silent',
      plugins: [{
        name: 'search-fixture-config',
        resolveId: id => id.startsWith('/@valaxyjs/') || id === '@localSearchIndex' ? id : undefined,
        load(id) {
          if (id === '@localSearchIndex')
            return 'export default {}'
          if (id.startsWith('/@valaxyjs/'))
            return 'export default "{}"'
        },
      }],
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
    const fuse = chunks.filter(chunk => Object.keys(chunk.modules).some(id => /[/\\]fuse\.js[/\\]/.test(id)))
    expect(fuse.length).toBeGreaterThan(0)
    expect(fuse.some(chunk => initial.has(chunk.fileName))).toBe(eager)
  }
  finally {
    await rm(root, { recursive: true, force: true })
  }
})
