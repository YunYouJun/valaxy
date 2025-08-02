import type { UserConfig } from 'unocss'
import { defineConfig, presetAttributify, presetIcons, presetWind4 } from 'unocss'

export const unoConfig: UserConfig = {
  presets: [
    presetWind4(),
    presetAttributify(),
    presetIcons({
      scale: 1.2,
    }),
  ],
}

export default defineConfig(unoConfig)
