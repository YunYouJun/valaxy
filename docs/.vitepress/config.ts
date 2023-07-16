import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Valaxy Docs',
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
})
