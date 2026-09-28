import type { ResolvedValaxyOptions } from '../types'
import { logger } from '../logger'

const warned = new WeakSet<object>()

/** Migration notice only: core does not import or install the renderer. */
export function warnMermaidMigration(options: ResolvedValaxyOptions | undefined, source?: string) {
  if (options && warned.has(options))
    return
  if (options)
    warned.add(options)
  logger.warn([
    `[valaxy] Mermaid has moved to valaxy-addon-mermaid${source ? ` (${source})` : ''}.`,
    'Mermaid 已迁移到可选插件。安装 / Install: pnpm add valaxy-addon-mermaid',
    '在 valaxy.config.ts 启用 / Enable in valaxy.config.ts:',
    '  import { addonMermaid } from \'valaxy-addon-mermaid\'',
    '  addons: [addonMermaid()]',
    'Existing mermaid fences do not need changes. Without the addon, they remain code blocks.',
    'https://valaxy.site/migration/version',
  ].join('\n'))
}
