import { defineConfig } from 'vitepress'
import UnoCSS from 'unocss/vite'
import Components from 'unplugin-vue-components/vite'

import {
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Valaxy',
  description: 'Docs for Valaxy',
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      {
        text: 'Docs',
        items: [
          {
            text: 'Getting Started',
            link: '/guide/getting-started',
          },
          {
            text: 'Migration from Other',
            link: '/migration/',
          },
        ],
      },
      {
        text: 'Themes',
        items: [
          {
            text: 'Use Theme',
            link: '/themes/use',
          },
          {
            text: 'Write A Theme',
            link: '/themes/write',
          },
          {
            text: 'Themes Gallery',
            link: '/themes/gallery',
          },
        ],
      },
      {
        text: 'Addons',
        items: [
          {
            text: 'Why need addons?',
            link: '/addons',
          },
          {
            text: 'Use A Addon',
            link: '/addons/use',
          },
          {
            text: 'Write A Addon',
            link: '/addons/write',
          },
        ],
      },
    ],

    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Markdown Examples', link: '/markdown-examples' },
          { text: 'Runtime API Examples', link: '/api-examples' },
        ],
      },
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
    ],
  },

  vite: {
    plugins: [
      UnoCSS({
        presets: [
          presetUno(),
          presetAttributify(),
          presetIcons({
            scale: 1.2,
            warn: true,
          }),
          presetTypography(),
        ],
        transformers: [
          transformerDirectives(),
          transformerVariantGroup(),
        ],
      }),

      // https://github.com/antfu/unplugin-vue-components
      Components({
        allowOverrides: true,
        dirs: ['.vitepress/theme/components'],
        dts: '.vitepress/theme/components.d.ts',
        // for docs md
        include: [/\.vue/, /\.md/],
      }),
    ],
  },
})
