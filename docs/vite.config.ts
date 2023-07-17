import { defineConfig } from 'vite'
import UnoCSS from 'unocss/vite'
import Components from 'unplugin-vue-components/vite'

export default defineConfig({
  plugins: [
    UnoCSS(),

    // https://github.com/antfu/unplugin-vue-components
    Components({
      allowOverrides: true,
      dirs: ['.vitepress/theme/components'],
      dts: '.vitepress/theme/components.d.ts',
      // for docs md
      include: [/\.vue/, /\.md/],
    }),
  ],
})
