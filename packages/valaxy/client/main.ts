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

// not filter hide for ssg
const routesWithLayout = setupLayouts(import.meta.env.DEV
  ? routes
  : routes.filter(i =>
    i.meta && i.meta.frontmatter && !i.meta.frontmatter.draft,
  ))

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
