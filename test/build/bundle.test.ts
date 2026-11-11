import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { build } from 'vite'
import { expect, it } from 'vitest'
import { getRolldownOutputOptions } from '../../packages/valaxy/node/build/bundle'

it.each(['packages/theme', 'node_modules/valaxy-theme-test'])(
  'keeps lazy theme modules outside the entry graph in %s',
  async (themePath) => {
    const root = await mkdtemp(join(tmpdir(), 'valaxy-lazy-bundle-'))
    try {
      const sources = {
        'entry.js': `import { start, search } from './${themePath}/index.js'; globalThis.start = start; globalThis.search = search`,
        [`${themePath}/index.js`]: 'export const start = () => "home"; export const search = () => import("./search.js")',
        [`${themePath}/search.js`]: 'export { search } from "./search-library.js"',
        [`${themePath}/search-library.js`]: 'export const search = () => "heavy search library"',
      }
      for (const [file, source] of Object.entries(sources)) {
        await mkdir(dirname(join(root, file)), { recursive: true })
        await writeFile(join(root, file), source)
      }
      const result = await build({
        root,
        configFile: false,
        logLevel: 'silent',
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
      const lazy = chunks.find(chunk => Object.keys(chunk.modules).some(id => id.endsWith('/search-library.js')))
      expect(lazy).toBeDefined()
      expect(initial.has(lazy!.fileName)).toBe(false)
      expect(chunks.some(chunk => chunk.dynamicImports.includes(lazy!.fileName))).toBe(true)
    }
    finally {
      await rm(root, { recursive: true, force: true })
    }
  },
)
