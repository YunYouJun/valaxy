import type { Plugin } from 'vite'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

export const setupModuleId = 'virtual:valaxy-addon-mermaid/setup'

/** Keep theme/user setup/mermaid.ts working after moving rendering out of core. */
export function mermaidSetupPlugin(roots: string[]): Plugin {
  const resolvedId = `\0${setupModuleId}`
  const paths = [...new Set(roots)].map(root => join(root, 'setup/mermaid.ts'))
  return {
    name: 'valaxy-addon-mermaid:setup',
    resolveId(id) {
      if (id === setupModuleId)
        return resolvedId
    },
    load(id) {
      if (id !== resolvedId)
        return
      const files = paths.filter(existsSync)
      files.forEach(file => this.addWatchFile(file))
      const imports = files.map((file, index) => `import setup${index} from ${JSON.stringify(file)}`)
      // Preserve existing precedence: user setup replaces theme setup.
      return `${imports.join('\n')}\nexport default () => { let config; ${files.map((_, index) => `config = setup${index}();`).join(' ')} return config || {} }`
    },
    configureServer(server) {
      const invalidate = (file: string) => {
        if (!paths.includes(file))
          return
        const module = server.moduleGraph.getModuleById(resolvedId)
        if (module)
          server.moduleGraph.invalidateModule(module)
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.add(paths)
      server.watcher.on('add', invalidate).on('unlink', invalidate)
      server.httpServer?.once('close', () => {
        server.watcher.off('add', invalidate).off('unlink', invalidate)
      })
    },
  }
}
