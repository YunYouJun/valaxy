
import valaxyConfig from '@valaxyjs/config'
import type { InjectionKey } from 'vue'
import { inject, readonly, shallowRef } from 'vue'
import type { ThemeConfig } from 'valaxy-theme-yun'
import type { ValaxyConfig } from '../types'

/**
 * parse valaxy config
 * @param data
 * @returns
 */
function parse(data: string): ValaxyConfig {
  const parsed = JSON.parse(data)
  return (import.meta.env.DEV ? readonly(parsed) : parsed) as ValaxyConfig
}

export const valaxyConfigSymbol: InjectionKey<ValaxyConfig<ThemeConfig>> = Symbol('valaxy:config')
export const valaxyConfigRef = shallowRef<ValaxyConfig>(parse(valaxyConfig))

// hmr
if (import.meta.hot) {
  import.meta.hot.accept('/@valaxyjs/config', (m) => {
    valaxyConfigRef.value = parse(m.default)
  })
}

/*
 * get Config
 * @returns
 */
export function useConfig() {
  const config = inject(valaxyConfigSymbol)
  return config!
}
