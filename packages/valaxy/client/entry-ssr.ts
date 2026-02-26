import { createHead } from '@unhead/vue/server'
import { renderToString } from 'vue/server-renderer'
import { createValaxyApp, routesWithLayout } from './main'

export async function render(routePath: string) {
  const ctx = createValaxyApp({ routePath, createHead })
  const { app, router, head } = ctx

  await router.push(routePath)
  await router.isReady()

  const ssrCtx: Record<string, any> = {}
  const html = await renderToString(app, ssrCtx)
  await ctx.triggerOnSSRAppRendered()

  return {
    html,
    head,
    modules: ssrCtx.modules as Set<string> | undefined,
    teleports: ssrCtx.teleports as Record<string, string> | undefined,
    initialState: ctx.initialState,
  }
}

export { routesWithLayout as routes }
