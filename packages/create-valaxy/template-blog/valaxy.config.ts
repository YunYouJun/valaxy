import type { UserThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'

// add icons what you will need
const safelist = [
  'i-ri-home-line',
]

/**
 * User Config
 */
export default defineValaxyConfig<UserThemeConfig>({
  // site config see site.config.ts

  theme: 'yun',

  // Local read-only MCP stays off. Uncomment to enable it while running `pnpm dev`.
  // Production builds do not include the server.
  // https://valaxy.site/guide/work-with-ai#mcp
  // mcp: true,

  themeConfig: {
    banner: {
      enable: true,
      title: '我的小站',
    },

    pages: [
      {
        name: '友情链接',
        url: '/links/',
        icon: 'i-ri-link',
        color: 'dodgerblue',
      },
    ],

    footer: {
      // since: 2026,
      // Theme default links this icon to a personal sponsor page. Point it at your site.
      icon: {
        url: 'https://example.com/',
        title: 'My Blog',
      },
      beian: {
        enable: false,
        icp: '',
      },
    },
  },

  unocss: { safelist },
})
