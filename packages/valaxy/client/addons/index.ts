// compatibility for not exist addons
export const emptyAddonName = 'virtual:valaxy-addons:empty'
export const name = emptyAddonName

export function isEmptyAddon(addon: any) {
  return addon && addon.name === emptyAddonName
}

export default {
  name,
}
