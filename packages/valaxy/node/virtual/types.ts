import type { Awaitable } from '@antfu/utils'
import type { PluginContext } from 'rollup'
import type { ResolvedValaxyOptions } from '../types'

export interface VirtualModuleTemplate {
  id: string
  getContent: (this: PluginContext, options: ResolvedValaxyOptions) => Awaitable<string>
}
