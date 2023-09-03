import type { ViteSSGContext } from 'vite-ssg'
import { ViteSSG } from 'vite-ssg'
import generatedRoutes from 'virtual:generated-pages'
import { setupLayouts } from 'virtual:generated-layouts'
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

const routes = setupLayouts(import.meta.env.DEV
  ? generatedRoutes
  : generatedRoutes.filter(i =>
    i.meta && i.meta.frontmatter && !i.meta.frontmatter.draft,
  ))

/**
 * register global components
 * @param ctx
 */
export function registerComponents(ctx: ViteSSGContext) {
  ctx.app.component('AppLink', AppLink)
}

// not filter hide for ssg

// https://github.com/antfu/vite-ssg
export const createApp = ViteSSG(
  App,
  {
    routes,
    base: import.meta.env.BASE_URL,
    scrollBehavior(to, from) {
      if (to.path !== from.path)
        return { top: 0 }
    },
  },
  (ctx) => {
    registerComponents(ctx)
    setupMain(ctx)
  },
)
