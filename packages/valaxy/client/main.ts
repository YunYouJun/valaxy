import type { ValaxySSGContext } from './setups'

import { dataSymbol, initValaxyConfig, valaxyConfigSymbol } from 'valaxy'
import { setupLayouts } from 'virtual:generated-layouts'
import { createSSRApp, createApp as vueCreateApp } from 'vue'
import { createMemoryHistory, createRouter, createWebHistory } from 'vue-router'
import { routes as autoRoutes } from 'vue-router/auto-routes'

// import App from '/@valaxyjs/App.vue'
import App from './App.vue'
import { initData } from './app/data'
import ClientOnly from './components/ClientOnly'

import setupMain from './setup/main'
import { setupValaxyDevTools } from './utils/dev'
// uno.css 先于 #valaxy/styles 加载，使主题/用户样式可以覆盖 utility
import 'uno.css'
import '#valaxy/styles'

const valaxyConfig = initValaxyConfig()

const routes = [...autoRoutes]

const { redirectRoutes, useVueRouter } = valaxyConfig.value.runtimeConfig.redirects
if (useVueRouter)
  routes.push(...redirectRoutes)

// fix chinese path
routes.forEach((i) => {
  i?.children?.forEach((j: { path: string }) => {
    j.path = encodeURI(j.path)
  })
})

/**
 * Flatten nested routes so that `setupLayouts` can wrap every leaf route.
 *
 * `vue-router/vite` (file-based routing) generates nested route trees for subdirectories
 * (e.g. `pages/zh/guide/foo.md` → `{ path: '/zh', children: [{ path: 'guide', children: … }] }`).
 * `vite-plugin-vue-layouts-next`' `setupLayouts` only wraps **top-level** routes,
 * so nested children would miss the layout wrapper entirely.
 *
 * This function extracts every leaf (component-bearing or redirect) route into a flat
 * top-level entry with a fully-resolved path, preserving its `meta`.
 */
function flattenRoutes(routes: any[]): any[] {
  const flat: any[] = []
  function walk(route: any, parentPath: string) {
    const fullPath = parentPath
      ? `${parentPath.replace(/\/$/, '')}/${route.path.replace(/^\//, '')}`
      : route.path

    if (route.component || route.components || route.redirect) {
      flat.push({
        ...route,
        path: fullPath,
        children: undefined,
      })
    }

    if (route.children) {
      for (const child of route.children) {
        walk(child, fullPath)
      }
    }
  }

  for (const route of routes) {
    walk(route, '')
  }
  return flat
}

// filter children recursive
function filterDraft(routes: any[]) {
  return routes.filter((i) => {
    if (i.children)
      i.children = filterDraft(i.children)

    return !i.meta?.frontmatter?.draft
  })
}

// not filter hide for ssg
export const routesWithLayout = setupLayouts(import.meta.env.DEV
  ? flattenRoutes(routes)
  : filterDraft(flattenRoutes(routes)),
)

if (import.meta.env.DEV)
  setupValaxyDevTools()

interface CreateValaxyAppOptions {
  routePath?: string
  createHead?: () => any
  hydrate?: boolean
}

export function createValaxyApp(options: CreateValaxyAppOptions = {}): ValaxySSGContext {
  const { routePath, createHead, hydrate } = options
  const isSSR = import.meta.env.SSR

  // Use createSSRApp for server-side rendering and for client-side hydration
  // of SSG pre-rendered pages. vueCreateApp is only for pure SPA mode.
  const app = (isSSR || hydrate) ? createSSRApp(App) : vueCreateApp(App)

  const history = isSSR
    ? createMemoryHistory(import.meta.env.BASE_URL)
    : createWebHistory(import.meta.env.BASE_URL)

  const router = createRouter({
    history,
    routes: routesWithLayout,
    scrollBehavior(to, from) {
      if (to.path !== from.path)
        return { top: 0 }
    },
  })

  const head = createHead ? createHead() : undefined

  app.use(router)
  if (head)
    app.use(head)
  app.component('ClientOnly', ClientOnly)

  // SSR render callback management
  const appRenderCallbacks: (() => void)[] = []

  const ctx: ValaxySSGContext = {
    app,
    router,
    head,
    routes: routesWithLayout,
    isClient: !isSSR,
    initialState: {},
    onSSRAppRendered: isSSR ? (cb: () => void) => appRenderCallbacks.push(cb) : () => {},
    triggerOnSSRAppRendered: () => Promise.all(appRenderCallbacks.map(cb => cb())),
    routePath,
  }

  // Restore serialised state on client
  if (!isSSR && typeof window !== 'undefined' && (window as any).__INITIAL_STATE__) {
    ctx.initialState = JSON.parse((window as any).__INITIAL_STATE__)
  }

  // app-level provide
  const data = initData(router)
  app.provide(dataSymbol, data)
  app.provide(valaxyConfigSymbol, valaxyConfig)

  setupMain(ctx, valaxyConfig)

  return ctx
}

// Client-side auto-mount
if (!import.meta.env.SSR) {
  ;(async () => {
    const { createHead } = await import('@unhead/vue/client')
    // Detect SSG pre-rendered content for proper hydration
    const appEl = document.getElementById('app')
    const hydrate = !!(appEl && appEl.innerHTML.trim())
    const { app, router } = createValaxyApp({ createHead, hydrate })
    await router.isReady()
    app.mount('#app', hydrate)
  })()
}

/**
 * Legacy compatibility export for vite-ssg.
 * vite-ssg expects `createApp(routePath)` returning `{ app, router, ... }`.
 * This wraps `createValaxyApp` to match that signature so
 * `--ssg-engine vite-ssg` continues to work.
 */
export const createApp = (routePath?: string) => createValaxyApp({ routePath })
