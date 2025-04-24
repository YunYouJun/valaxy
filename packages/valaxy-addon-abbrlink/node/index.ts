import type { Options } from '../types'
import path from 'node:path'
import { defineValaxyAddon } from 'valaxy'

import pkg from '../package.json'

export const addonAbbrlink = defineValaxyAddon<Options>(options => ({
  name: pkg.name,
  enable: true,
  options,

  setup(node) {
    node.hook('vue-router:extendRoute', (route) => {
      if (route.meta.frontmatter.abbrlink) {
        route.addAlias(`/posts/${route.meta.frontmatter.abbrlink}`)
      }
    })

    node.hook('vue-router:beforeWriteFiles', (root) => {
      const postsRoot = root.children.find(child => child.path === '/posts')
      if (!postsRoot)
        return

      const abbrlinkChildren = postsRoot.children.filter(child => child.meta.frontmatter.abbrlink)

      if (abbrlinkChildren.length > 0) {
        abbrlinkChildren.forEach((child) => {
          const { abbrlink } = child.meta.frontmatter
          if (abbrlink) {
            postsRoot.insert(abbrlink, path.join(node.options.userRoot, 'pages/posts', `${child.path}.md`))

            if (options?.override) {
              postsRoot.children.find(c => c.path === child.path)?.delete()
            }
          }
        })
      }
    })
  },
}))
