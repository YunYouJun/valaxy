import type { UnpluginInstance, UnpluginFactory } from 'unplugin'
import type { PluginOptions } from './types.js'
export type { PluginOptions, SFCLangFormat, TreeShakingOptions, VueI18nModule } from './types.js'
declare const unpluginFactory: UnpluginFactory<PluginOptions | undefined>
declare const unplugin: UnpluginInstance<PluginOptions | undefined, boolean>
export { unplugin, unpluginFactory }
export default unplugin
