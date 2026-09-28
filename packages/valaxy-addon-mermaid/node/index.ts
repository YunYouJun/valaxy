import type { MermaidAddonOptions } from '../shared'
import { defineValaxyAddon } from 'valaxy'

export const addonMermaid = defineValaxyAddon<MermaidAddonOptions>(options => ({
  name: 'valaxy-addon-mermaid',
  enable: true,
  options,
}))
