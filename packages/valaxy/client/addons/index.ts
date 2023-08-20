// compatibility for not exist addons
export const emptyAddonName = 'virtual:valaxy-addons:empty'
export const name = emptyAddonName

export function isEmptyAddon(name: string) {
  return name === emptyAddonName
}

export default {
  name,
}
