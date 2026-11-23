import type { RouteRecordRaw } from 'vue-router'
import type { RuntimeConfig, ValaxyAddon, ValaxyConfig } from '../../types'
import type { VirtualModuleTemplate } from './types'
import { feedFileNames } from '../../shared/seo'
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
    const feed = options.config.modules?.rss?.enable
      ? feedFileNames(options.config.siteConfig.feed?.name)
      : undefined

    const { devtools, siteConfig, theme, themeConfig, runtimeConfig } = options.config
    const clientRuntime = {
      ...runtimeConfig,
      redirects,
      ...(feed ? { feed } : {}),
    } satisfies RuntimeConfig
    // Keep Node-side configuration and addon resolution metadata out of production bundles.
    const config = options.mode === 'dev'
      ? { ...options.config, runtimeConfig: clientRuntime }
      : {
        devtools,
        siteConfig,
        theme,
        themeConfig,
        runtimeConfig: {
          ...clientRuntime,
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
