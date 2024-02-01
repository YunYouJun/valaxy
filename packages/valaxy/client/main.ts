import type { ViteSSGContext } from 'vite-ssg'
import { ViteSSG } from 'vite-ssg'

import { routes } from 'vue-router/auto/routes'
import { setupLayouts } from 'virtual:generated-layouts'

import { initValaxyConfig, valaxyConfigSymbol } from 'valaxy'
import AppLink from './components/AppLink.vue'

import App from './App.vue'

// reset styles
// import '@unocss/reset/tailwind.css'
// https://unocss.dev/guide/style-reset#tailwind-compat
// minus the background color override for buttons to avoid conflicts with UI frameworks
import '@unocss/reset/tailwind-compat.css'

// generate user styles
import '/@valaxyjs/styles'
import 'uno.css'

import setupMain from './setup/main'

// @ts-expect-error virtual module
import { redirectRoutes, useVueRouter } from '/@valaxyjs/redirects'

/**
 * register global components
 * @param ctx
 */
export function registerComponents(ctx: ViteSSGContext) {
  ctx.app.component('AppLink', AppLink)
}

// fix chinese path
routes.forEach((i) => {
  i.children?.forEach((j) => {
    j.path = encodeURI(j.path)
  })
})

if (useVueRouter)
  routes.push(...JSON.parse(redirectRoutes))

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
    const { app } = ctx
    const config = initValaxyConfig()
    app.provide(valaxyConfigSymbol, config)

    registerComponents(ctx)
    setupMain(ctx, config)
  },
)
