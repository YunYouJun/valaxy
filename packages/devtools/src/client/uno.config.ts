import { presetAnthonyDesign } from '@antfu/design/unocss'
import { defineConfig, presetAttributify, presetIcons, presetWind4, transformerDirectives, transformerVariantGroup } from 'unocss'

// The same component and token preset as Devframe Hub UI. This SPA owns its
// document, so Wind4 variables work here without the Hub's shadow-root adapter.
export default defineConfig({
  presets: [
    presetAnthonyDesign({ primary: '#6b84fd' }),
    presetWind4(),
    presetAttributify(),
    presetIcons({ scale: 1.1 }),
  ],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  shortcuts: {
    'h-nav': 'h-10',
    'z-nav': 'z-[30]',
    'z-dropdown': 'z-[40]',
    'z-tooltip': 'z-[45]',
    'z-toast': 'z-[50]',
    'z-modal-backdrop': 'z-[60]',
    'z-modal-content': 'z-[70]',
    'z-drawer-backdrop': 'z-[80]',
    'z-drawer-content': 'z-[90]',
  },
})
