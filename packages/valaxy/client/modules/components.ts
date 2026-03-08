import type { ValaxySSGContext } from '../setups'

import AppLink from '../components/AppLink.vue'
import ValaxyTranslate from '../components/builtin/ValaxyTranslate.vue'

/**
 * register global components
 * @param ctx
 */
export function registerGlobalComponents(ctx: ValaxySSGContext) {
  ctx.app.component('AppLink', AppLink)
  ctx.app.component('VT', ValaxyTranslate)
}
