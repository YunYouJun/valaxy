import type { Plugin } from 'vite'
import pascalCase from 'pascalcase'
import { basename, join, normalize } from 'pathe'
import { glob } from 'tinyglobby'
import { toAtFS } from '../utils/resolve'

const publicId = 'virtual:valaxy-cover-components'
const resolvedId = `\0${publicId}`

/** Discover only opt-in cover components, preserving the normal root priority. */
export async function scanCoverComponents(componentDirs: string[]) {
  const components = new Map<string, string>()
  for (const dir of componentDirs) {
    const root = join(dir, 'covers')
    const files = await glob('**/*.vue', { cwd: root, absolute: true, ignore: ['**/.*/**'] })
    const names = new Set<string>()
    for (const file of files.sort()) {
      const name = pascalCase(basename(file, '.vue'))
      if (names.has(name))
        throw new Error(`Duplicate cover component ${name} in ${root}; use unique filenames`)
      names.add(name)
      components.set(name, file)
    }
  }
  return components
}

export function createCoverComponentsPlugin(componentDirs: string[]): Plugin {
  const roots = componentDirs.map(dir => `${normalize(join(dir, 'covers'))}/`)
  return {
    name: 'valaxy:cover-components',
    resolveId(id) {
      if (id === publicId)
        return resolvedId
    },
    async load(id) {
      if (id !== resolvedId)
        return
      const components = await scanCoverComponents(componentDirs)
      const entries = [...components].map(([name, file]) =>
        `[${JSON.stringify(name)}, defineAsyncComponent(() => import(${JSON.stringify(toAtFS(file))}))]`,
      )
      return `import { defineAsyncComponent } from 'vue'\nexport default new Map([${entries.join(',\n')}])`
    },
    configureServer(server) {
      server.watcher.add(componentDirs.map(dir => join(dir, 'covers')))
      const invalidate = (file: string) => {
        const path = normalize(file)
        if (!path.endsWith('.vue') || !roots.some(root => path.startsWith(root)))
          return
        for (const environment of Object.values(server.environments)) {
          const module = environment.moduleGraph.getModuleById(resolvedId)
          if (module)
            environment.moduleGraph.invalidateModule(module)
        }
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', invalidate)
      server.watcher.on('unlink', invalidate)
      server.httpServer?.once('close', () => {
        server.watcher.off('add', invalidate)
        server.watcher.off('unlink', invalidate)
      })
    },
  }
}
