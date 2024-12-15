import { defineConfig } from 'vitepress'

import typedocSidebar from '../typedoc/typedoc-sidebar.json'

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

typedocSidebar.forEach((item) => {
  item.text = capitalize(item.text)
  item.collapsed = false
})

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'Valaxy API Docs',
  description: 'API Docs For Valaxy',
  themeConfig: {
    outline: [2, 3],

    search: {
      provider: 'local',
    },

    nav: [
      { text: 'TypeDoc', link: '/typedoc' },
      { text: '优化笔记', link: '/notes/' },
      { text: 'Valaxy Docs', link: 'https://valaxy.site' },
      // {
      //   text: 'Dropdown Menu',
      //   items: [
      //     {
      //       // Title for the section.
      //       text: 'Section A Title',
      //       items: [
      //         { text: 'Section A Item A', link: '...' },
      //         { text: 'Section B Item B', link: '...' },
      //       ],
      //     },
      //     {
      //       // Title for the section.
      //       text: 'Section B Title',
      //       items: [
      //         { text: 'Section A Item A', link: '...' },
      //         { text: 'Section B Item B', link: '...' },
      //       ],
      //     },
      //   ],
      // },
    ],

    sidebar: {
      '/typedoc/': typedocSidebar,
      '/notes': [
        {
          text: 'App Bundle Size',
          link: '/notes/app-bundle-size',
        },
        {
          text: 'Shiki 高亮耗时问题',
          link: '/notes/shiki-performance',
        },
      ],
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
    ],
  },

  markdown: {
    lineNumbers: true,
  },
})
