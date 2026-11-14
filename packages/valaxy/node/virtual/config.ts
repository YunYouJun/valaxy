import type { RouteRecordRaw } from 'vue-router'
import type { ValaxyAddon, ValaxyConfig } from '../../types'
import type { VirtualModuleTemplate } from './types'
import { isProd } from '../utils/env'

export const templateConfig: VirtualModuleTemplate = {
  id: '/@valaxyjs/config',
  async getContent(options) {
    const routes = options.redirects.map<RouteRecordRaw>((redirect) => {
      return {
        path: redirect.from,
        redirect: redirect.to,
      }
    })
    const redirects = {
      useVueRouter: isProd() ? options.config.siteConfig.redirects!.useVueRouter! : true,
      redirectRoutes: routes,
    }

    const { devtools, siteConfig, theme, themeConfig, runtimeConfig } = options.config
    // Keep Node-side configuration and addon resolution metadata out of production bundles.
    const config = options.mode === 'dev'
      ? { ...options.config, runtimeConfig: { ...runtimeConfig, redirects } }
      : {
        devtools,
        siteConfig,
        theme,
        themeConfig,
        runtimeConfig: {
          redirects,
          addons: Object.fromEntries(Object.entries(runtimeConfig.addons).map(([key, addon]) => {
            const { name, enable, global, props, options } = addon
            return [key, { name, enable, global, props, options } satisfies ValaxyAddon]
          })),
        },
      } satisfies ValaxyConfig

    // stringify twice for \"
    return `export default ${JSON.stringify(JSON.stringify(config))}`
  },
}
