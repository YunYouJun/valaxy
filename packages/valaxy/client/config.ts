import type { ComputedRef, InjectionKey } from 'vue'

// import type { RouteMeta } from 'vue-router'
// fix build caused by pnpm
// This is likely not portable. A type annotation is necessary.
// https://github.com/microsoft/TypeScript/issues/42873
import type { DefaultTheme, ValaxyAddon, ValaxyConfig } from '../types'
import type { ValaxyData } from './app/data'
import { computed, hasInjectionContext, inject, readonly, shallowRef } from 'vue'

// @ts-expect-error virtual module @valaxyjs/config
import valaxyConfig from '/@valaxyjs/config'
// @ts-expect-error virtual module @valaxyjs/context
import valaxyContext from '/@valaxyjs/context'

/**
 * parse valaxy config
 * @param data
 */
function parse<T = any>(data: string): T {
  const parsed = JSON.parse(data)
  return (import.meta.env.DEV ? readonly(parsed) : parsed) as T
}

interface ValaxyContext {
  userRoot: string
}

export const valaxyConfigSymbol: InjectionKey<ComputedRef<ValaxyConfig>> = Symbol('valaxy:config')
export const valaxyConfigRef = shallowRef<ValaxyConfig>(parse<ValaxyConfig>(valaxyConfig))

export const dataSymbol: InjectionKey<ValaxyData> = Symbol('ValaxyData')

export const valaxyContextRef = shallowRef<ValaxyContext>(parse<ValaxyContext>(valaxyContext))

valaxyConfigRef.value = parse<ValaxyConfig>(valaxyConfig)
valaxyContextRef.value = parse<ValaxyContext>(valaxyContext)

// hmr
if (import.meta.hot) {
  // /@valaxyjs/config must be static string
  import.meta.hot.accept('/@valaxyjs/config', (m) => {
    valaxyConfigRef.value = parse<ValaxyConfig>(m?.default)
  })

  // context
  import.meta.hot.accept('/@valaxyjs/context', (m) => {
    valaxyContextRef.value = parse<ValaxyContext>(m?.default)
  })
}

export function initValaxyConfig() {
  return computed(() => valaxyConfigRef.value)
}

export function initContext() {
  return computed(() => valaxyContextRef.value)
}

/**
 * get valaxy config
 * @public
 */
export function useValaxyConfig<ThemeConfig = DefaultTheme.Config>() {
  if (!hasInjectionContext())
    throw new Error('[Valaxy] useValaxyConfig() must be called inside setup() or a component lifecycle')
  const config = inject<ComputedRef<ValaxyConfig<ThemeConfig>>>(valaxyConfigSymbol)
  if (!config)
    throw new Error('[Valaxy] site config not properly injected in app')
  return config
}

/**
 * alias for useSite
 * @public
 */
export function useConfig<ThemeConfig = DefaultTheme.Config>() {
  return useValaxyConfig<ThemeConfig>()
}

/**
 * get valaxy config
 * @public
 */
export function useSiteConfig<ThemeConfig = DefaultTheme.Config>() {
  const config = useValaxyConfig<ThemeConfig>()
  return computed(() => config!.value.siteConfig)
}

/**
 * You can use like this: import { useThemeConfig } from 'valaxy-theme-xxx'
 * if you want to: import { useThemeConfig } from 'valaxy'
 * you need pass themeConfig by yourself
 * @internal
 */
export function useThemeConfig<ThemeConfig = DefaultTheme.Config>() {
  const config = useValaxyConfig<ThemeConfig>()
  return computed(() => config!.value.themeConfig)
}

export function useRuntimeConfig() {
  const config = useValaxyConfig()
  return computed(() => config!.value.runtimeConfig)
}

/**
 * Get addon config from runtime config.
 *
 * A generic, type-safe shortcut that every addon and theme can use instead of
 * manually calling `useRuntimeConfig()` + `computed(...)` + type assertion.
 *
 * Must be called inside `<script setup>` or a Vue lifecycle hook (same
 * constraint as `useRuntimeConfig()`).
 *
 * @example
 * ```ts
 * // Inside an addon — replaces the boilerplate `useAddonXxxConfig()` pattern
 * import type { MyOptions } from '../types'
 * const config = useAddonConfig<MyOptions>('valaxy-addon-xxx')
 * config.value?.options // MyOptions | undefined
 * ```
 *
 * @example
 * ```ts
 * // Inside a theme component — no dynamic import needed
 * const algolia = useAddonConfig<AlgoliaSearchOptions>('valaxy-addon-algolia')
 * if (algolia.value) { /* addon is installed and configured *\/ }
 * ```
 *
 * @public
 */
export function useAddonConfig<AddonOptions = Record<string, any>>(addonName: string) {
  const runtimeConfig = useRuntimeConfig()
  return computed(() =>
    runtimeConfig.value.addons[addonName] as ValaxyAddon<AddonOptions> | undefined,
  )
}
