import type { DefaultTheme, ValaxyConfig } from 'valaxy/types'
import type { ComputedRef } from 'vue'
import type { ValaxySSGContext } from '../setups'
import FloatingVue from 'floating-vue'
import 'floating-vue/dist/style.css'

export async function install({ app }: ValaxySSGContext, config: ComputedRef<ValaxyConfig<DefaultTheme.Config>>) {
  // @see https://floating-vue.starpad.dev/guide/config#default-values
  const defaultFloatingVueConfig = {}
  app.use(FloatingVue, Object.assign(defaultFloatingVueConfig, config.value.siteConfig.floatingVue || {}))
}
