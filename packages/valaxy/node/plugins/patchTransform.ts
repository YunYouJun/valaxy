import type { Plugin, ResolvedConfig } from 'vite'
import type { ResolvedValaxyOptions } from '../types'
import { objectEntries } from '@antfu/utils'
import { getDefine } from './extendConfig'

export function createFixPlugins(
  options: ResolvedValaxyOptions,
): Plugin[] {
  // default define from valaxy, will be overridden by user's vite config
  let define = objectEntries(getDefine(options))

  return [
    {
      name: 'valaxy:flags',
      enforce: 'pre',
      configResolved(config: ResolvedConfig) {
        // read the final merged define (user config overrides valaxy defaults)
        const resolvedDefine = config.define || {}
        const defaults = getDefine(options)
        const merged: Record<string, any> = { ...defaults }
        for (const key of Object.keys(defaults)) {
          if (key in resolvedDefine)
            merged[key] = resolvedDefine[key]
        }
        define = objectEntries(merged)
      },
      transform(code, id) {
        if (/\.vue(?:$|\?)/.test(id)) {
          const original = code
          define.forEach(([from, to]) => {
            code = code.replace(new RegExp(from, 'g'), to)
          })
          if (original !== code)
            return code
        }
      },
    },
  ]
}
