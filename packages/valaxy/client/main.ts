import type { ViteSSGContext } from 'vite-ssg'
import { DataLoaderPlugin } from 'unplugin-vue-router/data-loaders'
import { dataSymbol, initValaxyConfig, valaxyConfigSymbol } from 'valaxy'
import { setupLayouts } from 'virtual:generated-layouts'
import { ViteSSG } from 'vite-ssg'

import { routes } from 'vue-router/auto-routes'
// import App from '/@valaxyjs/App.vue'
import App from './App.vue'

import { initData } from './app/data'
import AppLink from './components/AppLink.vue'

import setupMain from './setup/main'

import { setupValaxyDevTools } from './utils/dev'
/**
 * user styles
 * virtual module
 */
import '#valaxy/styles'
import 'uno.css'
import 'virtual:group-icons.css'

const valaxyConfig = initValaxyConfig()

/**
 * register global components
 * @param ctx
 */
export function registerComponents(ctx: ViteSSGContext) {
  ctx.app.component('AppLink', AppLink)
}

const { redirectRoutes, useVueRouter } = valaxyConfig.value.runtimeConfig.redirects
if (useVueRouter)
  routes.push(...redirectRoutes)

// fix chinese path
routes.forEach((i) => {
  i?.children?.forEach((j) => {
    j.path = encodeURI(j.path)
  })
})

// filter children recursive
function filterDraft(routes: any[]) {
  return routes.filter((i) => {
    if (i.children)
      i.children = filterDraft(i.children)

    return !i.meta?.frontmatter?.draft
  })
}

// not filter hide for ssg
const routesWithLayout = setupLayouts(import.meta.env.DEV
  ? routes
  : filterDraft(routes),
)

if (import.meta.env.DEV)
  setupValaxyDevTools()

// https://github.com/antfu/vite-ssg
export const createApp = ViteSSG(
  App,
  {
    routes: routesWithLayout,
    base: import.meta.env.BASE_URL,
    scrollBehavior(to, from) {
      if (to.path !== from.path)
        return { top: 0 }
    },
  },
  (ctx) => {
    // app-level provide
    const { app, router } = ctx

    const data = initData(router)
    app.provide(dataSymbol, data)

    // Register the plugin before the router
    app.use(DataLoaderPlugin, { router })

    app.provide(valaxyConfigSymbol, valaxyConfig)

    registerComponents(ctx)
    setupMain(ctx, valaxyConfig)
  },
)
