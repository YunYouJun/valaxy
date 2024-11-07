import FloatingVue from 'floating-vue'
import type { ViteSSGContext } from 'vite-ssg'

import 'floating-vue/dist/style.css'
import type { DefaultTheme, ValaxyConfig } from 'valaxy/types'
import type { ComputedRef } from 'vue'

export async function install({ app }: ViteSSGContext, config: ComputedRef<ValaxyConfig<DefaultTheme.Config>>) {
  // @see https://floating-vue.starpad.dev/guide/config#default-values
  const defaultFloatingVueConfig = {}
  app.use(FloatingVue, Object.assign(defaultFloatingVueConfig, config.value.siteConfig.floatingVue || {}))
}
