import type { VirtualModuleTemplate } from './types'
import { existsSync } from 'node:fs'

import { join } from 'node:path'
import { resolveImportUrl, toAtFS } from '../utils'

export const templateStyles: VirtualModuleTemplate = {
  id: '/@valaxyjs/styles',
  async getContent({ clientRoot, roots, config }) {
    function resolveUrlOfClient(name: string) {
      return toAtFS(join(clientRoot, name))
    }

    const imports: string[] = []

    if (config.features?.katex) {
      imports.push(`import "${await resolveImportUrl('katex/dist/katex.min.css')}"`)
      imports.push(`import "${resolveUrlOfClient('styles/third/katex.scss')}"`)
    }

    for (const root of roots) {
      const styles = [
        join(root, 'styles', 'index.ts'),
        join(root, 'styles', 'index.css'),
        join(root, 'styles', 'index.scss'),
      ]

      for (const style of styles) {
        if (existsSync(style)) {
          imports.push(`import "${toAtFS(style)}"`)
          continue
        }
      }
    }

    // reset styles, load css before app
    // import '@unocss/reset/tailwind.css'
    // https://unocss.dev/guide/style-reset#tailwind-compat
    // minus the background color override for buttons to avoid conflicts with UI frameworks
    imports.unshift(`import "${await resolveImportUrl('@unocss/reset/tailwind-compat.css')}"`)
    imports.push('import "uno.css"')
    imports.push('import "virtual:group-icons.css"')

    return imports.join('\n')
  },
}
