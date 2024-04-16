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
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'TypeDoc', link: '/typedoc' },
      { text: 'Valaxy Docs', link: 'https://valaxy.site' },
    ],

    sidebar: {
      '/typedoc/': typedocSidebar,
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/vuejs/vitepress' },
    ],
  },
})
