import { addons } from '@valaxyjs/utils'
import { editorPresentations } from './shared/editors'

// Catalog icons are dynamic classes, so include them in the built panel.
export const safelist = [...addons.map(addon => addon.icon), ...editorPresentations.map(editor => editor.icon)]
