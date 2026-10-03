import { t as normalizeLayoutName } from "./layoutName-DVkP7Qpo.mjs";
import * as Vue from "vue";
import { computed, defineAsyncComponent, defineComponent, h, inject, shallowRef } from "vue";
import { RouterView, START_LOCATION, matchedRouteKey, routerKey, useRoute, useRouter } from "vue-router";
//#region src/runtime/layoutMeta.ts
function readLayoutMeta(meta) {
	const layout = meta?.layout;
	if (layout !== null && typeof layout === "object") return {
		name: layout.name,
		props: layout.props ?? meta?.layoutProps
	};
	return {
		name: layout,
		props: meta?.layoutProps
	};
}
function declaresLayout(meta) {
	const layout = meta?.layout;
	if (layout !== null && typeof layout === "object") return layout.name !== false;
	return !!layout;
}
//#endregion
//#region src/runtime/setupLayouts.ts
function createGetRoutes(router, withLayout = false) {
	const routes = router.getRoutes();
	if (withLayout) return routes;
	return () => routes.filter((route) => !route.meta.isLayout);
}
function hasChildWithLayout(route) {
	if (!route.children || route.children.length === 0) return false;
	return route.children.some((child) => {
		if (declaresLayout(child.meta)) return true;
		if (child.meta?.isLayout) return true;
		return hasChildWithLayout(child);
	});
}
function createSetupLayouts(wrapper, options) {
	const { inheritDefaultLayout } = options;
	function wrap(route, keepRootPath) {
		return {
			path: route.path,
			component: wrapper,
			children: keepRootPath && route.path === "/" ? [route] : [{
				...route,
				path: ""
			}],
			meta: { isLayout: true }
		};
	}
	function deepSetupLayout(routes, top = true) {
		return routes.map((route) => {
			const childHasLayout = top && !inheritDefaultLayout && (route.children?.length ?? 0) > 0 ? hasChildWithLayout(route) : false;
			if (route.children && route.children.length > 0) route.children = deepSetupLayout(route.children, false);
			if (top) {
				if (!route.component && route.children?.find((r) => (r.path === "" || r.path === "/") && r.meta?.isLayout)) return route;
				if (readLayoutMeta(route.meta).name !== false) {
					if (inheritDefaultLayout || !childHasLayout) return wrap(route, true);
				}
			}
			if (declaresLayout(route.meta)) return wrap(route, false);
			return route;
		});
	}
	return (routes) => deepSetupLayout(routes);
}
//#endregion
//#region src/runtime/wrapper.ts
const LAZY = Symbol.for("vite-plugin-vue-layouts-next:lazy");
/**
* Both virtual-module generators wrap their async imports with this, so a lazy entry
* is always identified explicitly rather than guessed from its shape - unlike Vue
* Router's route components, a bare functional component (e.g. an arrow-function
* default export from a `.tsx` layout) is a perfectly valid, non-lazy layout here.
*/
function lazyLayout(loader) {
	return Object.assign(loader, { [LAZY]: true });
}
function isLazyLayout(entry) {
	return typeof entry === "function" && entry[LAZY] === true;
}
const PREFIX = "[vite-plugin-vue-layouts-next]";
const hasInjectionContext = Vue.hasInjectionContext ?? (() => false);
/** In-place override set by `setPageLayout`; cleared on navigation to another path. */
const override = shallowRef(null);
const guardedRouters = /* @__PURE__ */ new WeakSet();
/** `defaultLayout` of the last created wrapper; shared with `useLayout()`. */
let resolvedDefaultLayout = "default";
/**
* Change the layout of the current page without navigating, optionally passing props
* to the layout component. The override lasts until the router navigates to a different `path`.
*/
function setPageLayout(name, props) {
	override.value = name == null ? null : {
		name,
		props
	};
}
/**
* Reactive name of the layout resolved for the current route.
* `false` when no wrapper is rendered around it (a static `layout: false` route, or
* one deliberately left unwrapped because `inheritDefaultLayout` is `false`).
*/
function useLayout() {
	const route = useRoute();
	return computed(() => {
		const own = innermostLayoutRecord(route);
		if (!own) return false;
		return resolveLayoutFor(route, own, override.value).name;
	});
}
function innermostLayoutRecord(route) {
	const { matched } = route;
	for (let i = matched.length - 1; i >= 0; i--) if (matched[i].meta.isLayout) return matched[i];
}
/**
* Layout (name and props) the wrapper whose generated record is `own` renders for `route`.
*
* The static layout comes from the wrapped record's own meta (`||` fallback to the
* default, like the original algorithm), so nested trees keep one layout per level.
* Dynamic inputs - the `setPageLayout` override and a guard assignment to the merged
* `route.meta.layout` / `route.meta.layoutProps` - apply only to the innermost wrapper.
* A dynamic layout brings its own props and never inherits the page's static ones.
*/
function resolveLayoutFor(route, own, overrideValue) {
	const { matched } = route;
	const idx = matched.indexOf(own);
	const page = readLayoutMeta(matched[idx + 1]?.meta);
	const staticLayout = {
		name: page.name || resolvedDefaultLayout,
		props: page.props
	};
	if (!!matched.slice(idx + 2).some((r) => r.meta.isLayout)) return staticLayout;
	if (overrideValue) return overrideValue;
	const staticMerged = matched.reduce((m, r) => r.meta.layout ?? m, void 0);
	const staticMergedProps = matched.reduce((m, r) => r.meta.layoutProps ?? m, void 0);
	const guardProps = route.meta.layoutProps !== staticMergedProps ? route.meta.layoutProps : void 0;
	if (route.meta.layout != null && route.meta.layout !== staticMerged) {
		const guard = readLayoutMeta({
			layout: route.meta.layout,
			layoutProps: guardProps
		});
		return {
			name: guard.name ?? resolvedDefaultLayout,
			props: guard.props
		};
	}
	return {
		name: staticLayout.name,
		props: guardProps ?? staticLayout.props
	};
}
function unwrapModule(mod) {
	return mod && typeof mod === "object" && "default" in mod ? mod.default : mod;
}
/** Options-API navigation guards that never run on a layout component (see `checkRouteGuards`). */
const ROUTE_GUARD_NAMES = [
	"beforeRouteEnter",
	"beforeRouteUpdate",
	"beforeRouteLeave"
];
/** `fallbackLayout` is rendered when the requested layout is not in `layouts`; if it is missing too, the page renders without a layout. */
function createLayoutWrapper(layouts, defaultLayout, fallbackLayout = defaultLayout) {
	resolvedDefaultLayout = defaultLayout;
	/** Lazy layouts already loaded (by the `beforeResolve` preload or an async render). */
	const resolved = /* @__PURE__ */ new Map();
	/** In-flight loads, so a layout's factory runs at most once. */
	const pending = /* @__PURE__ */ new Map();
	/** `defineAsyncComponent` per name, for renders that happen before the preload. */
	const asyncCache = /* @__PURE__ */ new Map();
	const warned = /* @__PURE__ */ new Set();
	let fallbackWarned = false;
	const guardWarned = /* @__PURE__ */ new Set();
	/**
	* Layouts are rendered by `LayoutWrapper`, not matched as route components, so Vue
	* Router never calls their Options-API route guards; the Composition-API
	* `onBeforeRouteUpdate`/`onBeforeRouteLeave` still work since they subscribe directly
	* to the router. Skipped for a `defineAsyncComponent` wrapper that hasn't resolved
	* yet - the caller passes the real component once loaded.
	*/
	function checkRouteGuards(name, comp) {
		if (guardWarned.has(name) || !comp || typeof comp !== "object" && typeof comp !== "function") return;
		const target = "default" in comp ? comp.default : comp;
		if (!target) return;
		const opts = target.__vccOpts ?? target;
		const guards = ROUTE_GUARD_NAMES.filter((g) => opts?.[g]);
		if (guards.length > 0) {
			guardWarned.add(name);
			console.warn(`${PREFIX} Layout "${name}" declares ${guards.join(", ")}; layouts are no longer route components, so these guards will not run. Use onBeforeRouteUpdate/onBeforeRouteLeave or a router guard instead.`);
		}
	}
	function load(name, loader) {
		let promise = pending.get(name);
		if (!promise) {
			promise = Promise.resolve(loader()).then((mod) => {
				const component = unwrapModule(mod);
				resolved.set(name, component);
				return component;
			}, (error) => {
				pending.delete(name);
				throw error;
			});
			pending.set(name, promise);
		}
		return promise;
	}
	function resolveComponent(name) {
		const loaded = resolved.get(name);
		if (loaded) {
			checkRouteGuards(name, loaded);
			return loaded;
		}
		const entry = layouts[name];
		if (!entry) return void 0;
		if (isLazyLayout(entry)) {
			let created = asyncCache.get(name);
			if (!created) {
				const loader = entry;
				created = defineAsyncComponent(() => load(name, loader));
				asyncCache.set(name, created);
			}
			return created;
		}
		checkRouteGuards(name, entry);
		return entry;
	}
	function resolveLayout(name) {
		const found = resolveComponent(name);
		if (found) return found;
		if (!warned.has(name)) {
			warned.add(name);
			console.warn(`${PREFIX} Layout "${name}" not found, falling back to "${fallbackLayout}"`);
		}
		const fallback = resolveComponent(fallbackLayout);
		if (!fallback && !fallbackWarned) {
			fallbackWarned = true;
			console.warn(`${PREFIX} Fallback layout "${fallbackLayout}" not found, rendering without a layout`);
		}
		return fallback;
	}
	const preload = async (to, from) => {
		const keepOverride = from === START_LOCATION || to.path === from.path;
		for (const rec of to.matched) {
			if (!rec.meta.isLayout) continue;
			const { name } = resolveLayoutFor(to, rec, keepOverride ? override.value : null);
			if (name === false) continue;
			const entry = layouts[name] ?? layouts[fallbackLayout];
			const key = layouts[name] ? name : fallbackLayout;
			if (isLazyLayout(entry) && !resolved.has(key)) await load(key, entry);
		}
	};
	function installGuards(router) {
		if (guardedRouters.has(router)) return;
		guardedRouters.add(router);
		router.beforeResolve(preload);
		router.afterEach((to, from, failure) => {
			if (failure) return;
			if (from !== START_LOCATION && to.path !== from.path) override.value = null;
		});
	}
	return defineComponent({
		name: "LayoutWrapper",
		beforeRouteEnter(to, from) {
			if (hasInjectionContext()) {
				const router = inject(routerKey, null);
				if (router) installGuards(router);
			}
			return preload(to, from, () => {});
		},
		setup() {
			const route = useRoute();
			const own = inject(matchedRouteKey);
			installGuards(useRouter());
			const layout = computed(() => resolveLayoutFor(route, own.value, override.value));
			return () => {
				const { name, props } = layout.value;
				if (name === false) return h(RouterView);
				const LayoutComponent = resolveLayout(name);
				return LayoutComponent ? h(LayoutComponent, props ? { ...props } : null, { default: () => h(RouterView) }) : h(RouterView);
			};
		}
	});
}
//#endregion
export { createGetRoutes, createLayoutWrapper, createSetupLayouts, lazyLayout, normalizeLayoutName, setPageLayout, useLayout };
