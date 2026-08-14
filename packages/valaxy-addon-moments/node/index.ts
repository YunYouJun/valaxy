import type { MomentsOptions } from '../types'
import { createLightMarkdownRenderer, defineValaxyAddon } from 'valaxy'
import pkg from '../package.json'

export const addonMoments = defineValaxyAddon<MomentsOptions>(options => ({
  name: pkg.name,
  enable: true,
  options,

  setup(node) {
    const renderer = createLightMarkdownRenderer(node.options)

    node.hook('md:afterRender', async ({ content, route }) => {
      if (!route.fullPath.startsWith('/moments/') || route.fullPath === '/moments/')
        return

      route.addToMeta({
        momentContent: await (await renderer).renderAsync(content),
      })
    })

    node.hook('vue-router:extendRoute', (route) => {
      if (!['/moments', '/moments/'].includes(route.fullPath))
        return

      route.addToMeta({
        layout: 'moments',
        frontmatter: {
          ...(route.meta.frontmatter && typeof route.meta.frontmatter === 'object' ? route.meta.frontmatter : {}),
          toc: false,
        },
      })
    })
  },
}))
