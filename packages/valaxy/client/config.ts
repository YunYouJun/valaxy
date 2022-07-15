// @ts-expect-error virtual module @valaxyjs/config
import ValaxySiteConfig from '/@valaxyjs/site'
// @ts-expect-error virtual module @valaxyjs/context
import valaxyContext from '/@valaxyjs/context'
import type { ComputedRef, InjectionKey } from 'vue'
import { computed, inject, readonly, shallowRef } from 'vue'
// import type { RouteMeta } from 'vue-router'
// fix build caused by pnpm
// This is likely not portable. A type annotation is necessary.
// https://github.com/microsoft/TypeScript/issues/42873
import type { ValaxySiteConfig } from 'valaxy/types'

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

export const ValaxySiteConfigSymbol: InjectionKey<ComputedRef<ValaxySiteConfig>> = Symbol('valaxy:config')
export const ValaxySiteConfigRef = shallowRef<ValaxySiteConfig>(parse<ValaxySiteConfig>(ValaxySiteConfig))

export const valaxyContextRef = shallowRef<ValaxyContext>(parse<ValaxyContext>(valaxyContext))

// hmr
if (import.meta.hot) {
  // /@valaxyjs/site must be static string
  import.meta.hot.accept('/@valaxyjs/site', (m) => {
    ValaxySiteConfigRef.value = parse<ValaxySiteConfig>(m.default)
  })

  // context
  import.meta.hot.accept('/@valaxyjs/context', (m) => {
    valaxyContextRef.value = parse<ValaxyContext>(m.default)
  })
}

export function initSite() {
  return computed(() => ValaxySiteConfigRef.value)
}

export function initContext() {
  return computed(() => valaxyContextRef.value)
}

/*
 * get valaxy config
 * @public
 * @returns
 */
export function useSiteConfig<ThemeConfig = any>() {
  const config = inject<ComputedRef<ValaxySiteConfig<ThemeConfig>>>(ValaxySiteConfigSymbol)
  if (!config)
    throw new Error('[Valaxy] config not properly injected in app')
  return config!
}

/**
 * You can use like this: import { useThemeConfig } from 'valaxy-theme-xxx'
 * if you want to: import { useThemeConfig } from 'valaxy'
 * you need pass themeConfig by yourself
 * @returns
 */
export function useThemeConfig<T = Record<string, any>>() {
  const config = useSiteConfig<T>()
  return computed(() => config!.value.themeConfig)
}
