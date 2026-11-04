import { defineValaxyConfig } from 'valaxy'

export default defineValaxyConfig({
  // Local read-only MCP stays off. Uncomment to enable it while running `pnpm dev`.
  // Production builds do not include the server.
  // https://valaxy.site/guide/work-with-ai#mcp
  // mcp: true,

  theme: 'press',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
    ],
    sidebar: [],
    footer: {
      message: 'Powered by <a href="https://valaxy.site">Valaxy</a>',
    },
  },
  unocss: {
    safelist: [
      'i-ri-book-2-line',
      'i-ri-flashlight-line',
      'i-ri-palette-line',
    ],
  },
})
