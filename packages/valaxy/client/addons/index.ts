// compatibility for not exist addons
export const emptyAddonName = 'virtual:valaxy-addons:empty'
export const name = emptyAddonName

export function isEmptyAddon(addon: any) {
  return addon && addon.name === emptyAddonName
}

/**
 * Cast a module namespace import to a plain type, breaking Rollup's
 * static binding analysis on `import * as ns` namespace objects.
 *
 * The identity return is intentional — the cast alone is enough to
 * suppress `IMPORT_IS_UNDEFINED` warnings when accessing addon-specific
 * exports that don't exist in the empty addon fallback module.
 *
 * @example
 * ```ts
 * import * as addonArtalk from 'valaxy-addon-artalk'
 * const mod = getAddonModule<typeof import('valaxy-addon-artalk')>(addonArtalk)
 * mod.useArtalkWithOptions?.()
 * ```
 */
export function getAddonModule<T = Record<string, any>>(addon: any): T {
  return addon
}

export default {
  name,
}
