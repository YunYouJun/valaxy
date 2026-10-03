import { Component, ComputedRef } from "vue";
import { RouteRecordRaw, Router } from "vue-router";
//#region src/runtime/layoutMeta.d.ts
type LayoutName = string | false;
type LayoutProps = Record<string, unknown>;
/** Object form of `meta.layout`. */
interface LayoutOptions {
  /** Layout name, `false` for no layout, or omitted for the default layout. */
  name?: LayoutName;
  props?: LayoutProps;
}
type LayoutMeta = LayoutName | LayoutOptions;
//#endregion
//#region src/layoutName.d.ts
export declare function normalizeLayoutName(file: string): string;
//#endregion
//#region src/runtime/setupLayouts.d.ts
interface SetupLayoutsOptions {
  inheritDefaultLayout: boolean;
}
/** Without `withLayout`, the returned getter hides the generated layout routes. */
export declare function createGetRoutes(router: Router, withLayout: true): RouteRecordRaw[];
export declare function createGetRoutes(router: Router, withLayout?: false): () => RouteRecordRaw[];
export declare function createSetupLayouts(wrapper: Component, options: SetupLayoutsOptions): (routes: readonly RouteRecordRaw[]) => RouteRecordRaw[];
//#endregion
//#region src/runtime/wrapper.d.ts
declare const LAZY: unique symbol;
type LazyLayout = (() => Promise<{
  default: Component;
} | Component>) & {
  [LAZY]: true;
};
/**
 * Both virtual-module generators wrap their async imports with this, so a lazy entry
 * is always identified explicitly rather than guessed from its shape - unlike Vue
 * Router's route components, a bare functional component (e.g. an arrow-function
 * default export from a `.tsx` layout) is a perfectly valid, non-lazy layout here.
 */
export declare function lazyLayout(loader: () => Promise<{
  default: Component;
} | Component>): LazyLayout;
type LayoutMap = Record<string, Component | LazyLayout>;
/**
 * Change the layout of the current page without navigating, optionally passing props
 * to the layout component. The override lasts until the router navigates to a different `path`.
 */
export declare function setPageLayout(name: LayoutName, props?: LayoutProps): void;
/**
 * Reactive name of the layout resolved for the current route.
 * `false` when no wrapper is rendered around it (a static `layout: false` route, or
 * one deliberately left unwrapped because `inheritDefaultLayout` is `false`).
 */
export declare function useLayout(): ComputedRef<LayoutName>;
/** `fallbackLayout` is rendered when the requested layout is not in `layouts`; if it is missing too, the page renders without a layout. */
export declare function createLayoutWrapper(layouts: LayoutMap, defaultLayout: string, fallbackLayout?: string): Component;
//#endregion
//#region src/runtime/index.d.ts
declare module 'vue-router' {
  interface RouteMeta {
    /**
     * Layout name for this page, `false` to render without a layout, or
     * `{ name, props }` to also pass props to the layout component.
     */
    layout?: LayoutMeta;
    /** Props for the layout component; `layout.props` in the object form wins over this. */
    layoutProps?: LayoutProps;
    /** Set on the generated parent routes created by `setupLayouts`. */
    isLayout?: boolean;
  }
}
//#endregion
export type { LayoutMap, LayoutMeta, LayoutName, LayoutOptions, LayoutProps, LazyLayout, SetupLayoutsOptions };