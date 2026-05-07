import type { VirtualModuleTemplate } from './types'
import { existsSync } from 'node:fs'

import { join } from 'node:path'
import { isKatexPluginNeeded } from '../config/valaxy'
import { resolveImportUrl, toAtFS } from '../utils'

export const templateStyles: VirtualModuleTemplate = {
  id: '/@valaxyjs/styles',
  async getContent({ clientRoot, roots, config }) {
    function resolveUrlOfClient(name: string) {
      return toAtFS(join(clientRoot, name))
    }

    const imports: string[] = []

    // KaTeX CSS: needed when KaTeX plugin is registered (not MathJax)
    // Always load when plugin is registered so that per-page frontmatter.katex works
    if (isKatexPluginNeeded(config)) {
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

    // reset 由 presetWind4 自带的 preflight 提供，无需再额外引入 @unocss/reset/tailwind-compat.css
    return imports.join('\n')
  },
}
