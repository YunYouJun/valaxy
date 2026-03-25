import type { ValaxySSGContext } from '../setups'

import { defineAsyncComponent } from 'vue'
import AppLink from '../components/AppLink.vue'
import ValaxyTranslate from '../components/builtin/ValaxyTranslate.vue'

/**
 * register global components
 * @param ctx
 */
export function registerGlobalComponents(ctx: ValaxySSGContext) {
  ctx.app.component('AppLink', AppLink)
  ctx.app.component('VT', ValaxyTranslate)

  // DEV-only: register ValaxyDebug component (tree-shaken in production)
  if (import.meta.env.DEV) {
    const ValaxyDebug = defineAsyncComponent(() => import('../components/.exclude/ValaxyDebug.vue'))
    ctx.app.component('ValaxyDebug', ValaxyDebug)
  }
}
