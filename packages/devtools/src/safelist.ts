import { addons } from '@valaxyjs/utils'

// Catalog icons are dynamic classes, so include them in the built panel.
export const safelist = addons.map(addon => addon.icon)
