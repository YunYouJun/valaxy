// @ts-expect-error virtual module @valaxyjs/config
import valaxyConfig from '@valaxyjs/config'
// @ts-expect-error virtual module @valaxyjs/context
import valaxyContext from '@valaxyjs/context'
import type { ComputedRef, InjectionKey, Ref } from 'vue'
import { computed, inject, readonly, shallowRef } from 'vue'
import type { ThemeConfig } from 'valaxy-theme-yun'
// import type { RouteMeta } from 'vue-router'
import type { PageData, ValaxyConfig } from '../types'

/**
 * parse valaxy config
 * @param data
 * @returns
 */
function parse<T=any>(data: string): T {
  const parsed = JSON.parse(data)
  return (__DEV__ ? readonly(parsed) : parsed) as T
}

interface ValaxyContext {
  userRoot: string
}

export const valaxyConfigSymbol: InjectionKey<ComputedRef<ValaxyConfig<ThemeConfig>>> = Symbol('valaxy:config')
export const valaxyConfigRef = shallowRef<ValaxyConfig>(parse<ValaxyConfig>(valaxyConfig))

export const valaxyContextRef = shallowRef<ValaxyContext>(parse<ValaxyContext>(valaxyContext))
// export const valaxyDataRef = shallowRef<PageData>(parse(valaxyConfig))

// hmr
if (import.meta.hot) {
  // /@valaxyjs/config must be static string
  import.meta.hot.accept('/@valaxyjs/config', (m) => {
    valaxyConfigRef.value = parse<ValaxyConfig>(m.default)
  })

  // context
  import.meta.hot.accept('/@valaxyjs/context', (m) => {
    valaxyContextRef.value = parse<ValaxyContext>(m.default)
  })
}

export function initConfig() {
  return computed(() => valaxyConfigRef.value)
}

export function initContext() {
  return computed(() => valaxyContextRef.value)
}

/*
 * get Config
 * @returns
 */
export function useConfig() {
  const config = inject(valaxyConfigSymbol)
  if (!config)
    throw new Error('[Valaxy] config not properly injected in app')
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

export interface ValaxyData<T = any> {
  page: Ref<PageData>
  theme: Ref<T>
}
