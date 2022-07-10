// @ts-expect-error virtual module @valaxyjs/config
import valaxyConfig from '/@valaxyjs/config'
// @ts-expect-error virtual module @valaxyjs/context
import valaxyContext from '/@valaxyjs/context'
import type { ComputedRef, InjectionKey, Ref } from 'vue'
import { computed, inject, readonly, shallowRef } from 'vue'
// import type { RouteMeta } from 'vue-router'
// fix build caused by pnpm
// This is likely not portable. A type annotation is necessary.
// https://github.com/microsoft/TypeScript/issues/42873
import type { PageData, ValaxyConfig } from 'valaxy/types'

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

export const valaxyConfigSymbol: InjectionKey<ComputedRef<ValaxyConfig>> = Symbol('valaxy:config')
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
 * get valaxy config
 * @public
 * @returns
 */
export function useConfig<ThemeConfig = any>() {
  const config = inject<ComputedRef<ValaxyConfig<ThemeConfig>>>(valaxyConfigSymbol)
  if (!config)
    throw new Error('[Valaxy] config not properly injected in app')
  return config!
}

export interface ValaxyData<T = any> {
  page: Ref<PageData>
  theme: Ref<T>
}
