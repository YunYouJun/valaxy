import type { DefaultTheme, ValaxyConfig } from 'valaxy/types'
import type { ViteSSGContext } from 'vite-ssg'

import type { ComputedRef } from 'vue'
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'

export async function install({ app }: ViteSSGContext, config: ComputedRef<ValaxyConfig<DefaultTheme.Config>>) {
  // @see https://floating-vue.starpad.dev/guide/config#default-values
  const defaultFloatingVueConfig = {}
  app.use(FloatingVue, Object.assign(defaultFloatingVueConfig, config.value.siteConfig.floatingVue || {}))
}
