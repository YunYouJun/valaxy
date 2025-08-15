import type { Argv } from 'yargs'
import type { ValaxyNode } from '../types'

export interface ValaxyModule {
  extendCli?: (cli: Argv) => void
  setup?: (node: ValaxyNode) => void
}

export function defineValaxyModule(
  module: ValaxyModule,
) {
  return module
}

export function setupModules(
  node: ValaxyNode,
  modules: ValaxyModule[],
) {
  modules.forEach((module) => {
    module.setup?.(node)
  })
}
