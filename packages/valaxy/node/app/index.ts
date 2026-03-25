import type { ResolvedValaxyOptions, ValaxyHooks, ValaxyNode } from '../types'

import { createHooks } from 'hookable'
import { version } from '../env'
import { presetStatistics } from '../plugins/presets/statistics'

export * from './class'

const buildHooks: (keyof ValaxyHooks)[] = [
  'build:before',
  'build:after',
]

/**
 * Valaxy Node Instance
 * @param options
 */
export function createValaxyNode(options: ResolvedValaxyOptions) {
  const hooks = createHooks<ValaxyHooks>()

  // Register built-in statistics hook (can be overridden by user/addon hooks)
  hooks.hook('statistics', ({ route, options: statsOptions }) => {
    presetStatistics({ route, options: statsOptions })
  })

  if (typeof options.config.hooks === 'object') {
    Object.keys(options.config.hooks).forEach((name) => {
      const hookName = name as keyof ValaxyHooks
      const hook = options.config.hooks![hookName]

      if (typeof hook !== 'function')
        return

      if (buildHooks.includes(hookName)) {
        if (options.mode === 'build')
          hooks.hook(hookName, hook)
      }
      else {
        hooks.hook(hookName, hook)
      }
    })
  }

  const valaxyNode: ValaxyNode = {
    version,
    hooks,
    hook: hooks.hook,
    options,
  }

  options.addons.forEach((addon) => {
    if (typeof addon.setup === 'function')
      addon.setup(valaxyNode)
  })

  return valaxyNode
}
