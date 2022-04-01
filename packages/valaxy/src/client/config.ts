// @ts-expect-error virtual module @valaxyjs/config
import valaxyConfig from '@valaxyjs/config'
import type { ComputedRef, InjectionKey } from 'vue'
import { computed, inject, readonly, shallowRef } from 'vue'
import type { ThemeConfig } from '../../../valaxy-theme-yun'
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

export const valaxyConfigSymbol: InjectionKey<ComputedRef<ValaxyConfig<ThemeConfig>>> = Symbol('valaxy:config')
export const valaxyConfigRef = shallowRef<ValaxyConfig>(parse(valaxyConfig))

// hmr
if (import.meta.hot) {
  // /@valaxyjs/config must be static string
  import.meta.hot.accept('/@valaxyjs/config', (m) => {
    valaxyConfigRef.value = parse(m.default)
  })
}

export function initConfig() {
  return computed(() => valaxyConfigRef.value)
}

/*
 * get Config
 * @returns
 */
export function useConfig() {
  const config = inject(valaxyConfigSymbol)
  if (!config)
    throw new Error('[Valaxy] config not properly injected in qpp')
  return config!
}

/**
 * getThemeConfig
 * @returns
 */
export function useThemeConfig() {
  const config = useConfig()
  return computed(() => config!.value.themeConfig)
}
