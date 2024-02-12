import type { UserConfig } from 'unocss'
import { defineConfig, presetAttributify, presetIcons, presetUno } from 'unocss'

export const unoConfig: UserConfig = {
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
    }),
  ],
}

export default defineConfig(unoConfig)
