// import { mergeConfig } from 'vite'
// import mergeConfig from 'deepmerge'
// import { defaultThemeConfig } from 'valaxy-theme-yun'
// import type { ThemeConfig } from 'valaxy-theme-yun'
// import type { UserConfig } from 'valaxy'

import valaxyConfig from '@valaxyjs/config'
import type { InjectionKey } from 'vue'
import { inject, readonly, shallowRef } from 'vue'
import { defaultValaxyConfig } from '../../..'
import type { ValaxyConfig } from '../../..'

/**
 * parse valaxy config
 * @param data
 * @returns
 */
function parse(data: string): ValaxyConfig {
  const parsed = JSON.parse(data)
  return (import.meta.env.DEV ? readonly(parsed) : parsed) as ValaxyConfig
}

export const valaxyConfigSymbol: InjectionKey<ValaxyConfig> = Symbol('valaxy:config')
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
  return config || defaultValaxyConfig
}

/**
 * get theme config
 * @returns
 */
export function useThemeConfig() {
  const { themeConfig } = useConfig()
  return themeConfig
}
