// @ts-expect-error virtual module @valaxyjs/config
import valaxySiteConfig from '/@valaxyjs/site'
// @ts-expect-error virtual module @valaxyjs/context
import valaxyContext from '/@valaxyjs/context'
import type { ComputedRef, InjectionKey } from 'vue'
import { computed, inject, readonly, shallowRef } from 'vue'
// import type { RouteMeta } from 'vue-router'
// fix build caused by pnpm
// This is likely not portable. A type annotation is necessary.
// https://github.com/microsoft/TypeScript/issues/42873
import type { DefaultThemeConfig, SiteConfig as ValaxySiteConfig } from 'valaxy/types'

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

export const valaxySiteConfigSymbol: InjectionKey<ComputedRef<ValaxySiteConfig>> = Symbol('valaxy:site')
export const valaxySiteConfigRef = shallowRef<ValaxySiteConfig>(parse<ValaxySiteConfig>(valaxySiteConfig))

export const valaxyContextRef = shallowRef<ValaxyContext>(parse<ValaxyContext>(valaxyContext))

// hmr
if (import.meta.hot) {
  // /@valaxyjs/site must be static string
  import.meta.hot.accept('/@valaxyjs/site', (m) => {
    valaxySiteConfigRef.value = parse<ValaxySiteConfig>(m?.default)
  })

  // context
  import.meta.hot.accept('/@valaxyjs/context', (m) => {
    valaxyContextRef.value = parse<ValaxyContext>(m?.default)
  })
}

export function initSite() {
  return computed(() => valaxySiteConfigRef.value)
}

export function initContext() {
  return computed(() => valaxyContextRef.value)
}

/**
 * get valaxy config
 * @public
 * @returns
 */
export function useSite<ThemeConfig = DefaultThemeConfig>() {
  const config = inject<ComputedRef<ValaxySiteConfig<ThemeConfig>>>(valaxySiteConfigSymbol)
  if (!config)
    throw new Error('[Valaxy] site config not properly injected in app')
  return config!
}

/**
 * alias for useSite
 * @public
 * @returns
 */
export function useConfig<ThemeConfig = DefaultThemeConfig>() {
  return useSite<ThemeConfig>()
}

/**
 * You can use like this: import { useThemeConfig } from 'valaxy-theme-xxx'
 * if you want to: import { useThemeConfig } from 'valaxy'
 * you need pass themeConfig by yourself
 * @internal
 * @returns
 */
export function useThemeConfig<ThemeConfig = DefaultThemeConfig>() {
  const config = useSite<ThemeConfig>()
  return computed(() => config!.value.themeConfig)
}
