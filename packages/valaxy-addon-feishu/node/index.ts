import type { FeishuAddonOptions } from '../types'
import { defineValaxyAddon } from 'valaxy'
import { createFeishuLoader } from './feishu-loader'

/**
 * @experimental
 * Feishu/Lark CMS addon for Valaxy.
 * Fetches documents from Feishu and converts them to Markdown via Content Loaders.
 *
 * @example
 * ```ts
 * // valaxy.config.ts
 * import { defineValaxyConfig } from 'valaxy'
 * import { addonFeishu } from 'valaxy-addon-feishu'
 *
 * export default defineValaxyConfig({
 *   addons: [
 *     addonFeishu({
 *       appId: process.env.FEISHU_APP_ID,
 *       appSecret: process.env.FEISHU_APP_SECRET,
 *       spaceId: 'your-wiki-space-id',
 *     }),
 *   ],
 * })
 * ```
 */
export const addonFeishu = defineValaxyAddon<FeishuAddonOptions>(options => ({
  name: 'valaxy-addon-feishu',
  enable: true,
  options,
  setup(node) {
    if (!options?.appId || !options?.appSecret)
      throw new Error('[valaxy-addon-feishu] appId and appSecret are required')

    node.options.config.loaders ??= []
    node.options.config.loaders.push(createFeishuLoader(options))
  },
}))
