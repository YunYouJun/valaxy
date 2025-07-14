import type { ViteSSGContext } from 'vite-ssg'

import AppLink from '../components/AppLink.vue'
import ValaxyTranslate from '../components/builtin/ValaxyTranslate.vue'

/**
 * register global components
 * @param ctx
 */
export function registerGlobalComponents(ctx: ViteSSGContext) {
  ctx.app.component('AppLink', AppLink)
  ctx.app.component('VT', ValaxyTranslate)
}
