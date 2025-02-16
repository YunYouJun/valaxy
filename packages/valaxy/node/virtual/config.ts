import type { RouteRecordRaw } from 'vue-router'
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
    options.config.runtimeConfig.redirects = {
      useVueRouter: isProd() ? options.config.siteConfig.redirects!.useVueRouter! : true,
      redirectRoutes: routes,
    }

    // stringify twice for \"
    return `export default ${JSON.stringify(JSON.stringify(options.config))}`
  },
}
