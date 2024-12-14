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

    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'TypeDoc', link: '/typedoc' },
      { text: '优化笔记', link: '/notes/' },
      { text: 'Valaxy Docs', link: 'https://valaxy.site' },
    ],

    sidebar: {
      '/typedoc/': typedocSidebar,
      '/notes': [
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
