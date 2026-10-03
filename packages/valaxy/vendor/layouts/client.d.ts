declare module 'virtual:generated-layouts' {
  import type { LayoutMap, LayoutName, LayoutProps } from 'valaxy/vendor/layouts/runtime.mjs'
  import type { Router, RouteRecordRaw } from 'vue-router'

  export const layouts: LayoutMap
  /** need any here due to different types for vue-router versions */
  export function createGetRoutes(router: Router | any, withLayout?: boolean): () => RouteRecordRaw[]
  export function setupLayouts(routes: readonly RouteRecordRaw[]): RouteRecordRaw[]
  export function setPageLayout(name: LayoutName, props?: LayoutProps): void
  export function useLayout(): import('vue').ComputedRef<LayoutName>
}
