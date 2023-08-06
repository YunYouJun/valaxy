import { ViteSSG } from 'vite-ssg'
import generatedRoutes from 'virtual:generated-pages'
import { setupLayouts } from 'virtual:generated-layouts'
import App from './App.vue'
import AppLinkVue from './components/AppLink.vue'

import '@unocss/reset/tailwind.css'

// generate user styles
import '/@valaxyjs/styles'
import 'uno.css'

import setupMain from './setup/main'

const routes = setupLayouts(import.meta.env.DEV
  ? generatedRoutes
  : generatedRoutes.filter(i =>
    i.meta && i.meta.frontmatter && !i.meta.frontmatter.draft,
  ))

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
    ctx.app.component('AppLink', AppLinkVue)
    setupMain(ctx)
  },
)
