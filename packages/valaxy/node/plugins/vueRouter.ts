import VueRouter from 'unplugin-vue-router/vite'
import fs from 'fs-extra'
import { resolve } from 'pathe'
import { convert } from 'html-to-text'
import type { ExcerptType, Page } from 'valaxy/types'
import type { RouteMeta } from 'vue-router'
import MarkdownIt from 'markdown-it'
import matter from 'gray-matter'
import type { ValaxyNode } from '../types'

import { matterOptions } from './markdown/transform/matter'
import { presetStatistics } from './presets/statistics'
import { setupMarkdownPlugins } from './markdown'

/**
 * get excerpt by type
 * @param excerpt
 * @param type
 */
function getExcerptByType(excerpt = '', type: ExcerptType = 'html', mdIt: MarkdownIt) {
  switch (type) {
    case 'ai':
    case 'md':
      return excerpt
    case 'html':
      return mdIt.render(excerpt)
    case 'text':
      return convert(mdIt.render(excerpt))
    default:
      return excerpt
  }
}

/**
 * @see https://github.com/posva/unplugin-vue-router
 * @param valaxyApp
 */
export async function createRouterPlugin(valaxyApp: ValaxyNode) {
  const { options } = valaxyApp
  const { roots, config: valaxyConfig } = options

  const mdIt = new MarkdownIt({ html: true })
  await setupMarkdownPlugins(mdIt, options)

  return VueRouter({
    extensions: ['.vue', '.md'],
    routesFolder: roots.map(root => `${root}/pages`),
    dts: resolve(options.tempDir, 'typed-router.d.ts'),

    ...valaxyConfig.router,

    /**
     * @experimental See https://github.com/posva/unplugin-vue-router/issues/43
     * we need get frontmatter before route, so write it in extendRoute
     */
    async extendRoute(route) {
      const defaultFrontmatter = JSON.parse(JSON.stringify(valaxyConfig.siteConfig.frontmatter)) || {}
      if (route.meta && route.meta.frontmatter) {
        // reset frontmatter, extendRoute will be trigger when save md file
        const { frontmatter: _, otherMeta } = route.meta
        route.meta = otherMeta as RouteMeta
      }
      // merge deeply
      route.addToMeta({
        frontmatter: defaultFrontmatter,
      })

      // encode for chinese filename dev and build same
      // const encodedPath = encodeURI(route.path)
      // if (encodedPath !== route.path)
      //   route.path = encodedPath

      // add default layout for home, can be overrode
      if (route.fullPath === '/' || route.fullPath === '/page') {
        route.addToMeta({
          layout: 'home',
        })
      }

      // page is post
      if (['/posts', '/posts/'].includes(route.fullPath)) {
        // add posts layout
        route.addToMeta({
          layout: 'posts',
        })
      }
      else if (route.fullPath.startsWith('/posts/')) {
        if (route.children.length === 0) {
          route.addToMeta({
            layout: 'post',
          })
        }
        // else {
        //   route.addToMeta({
        //     layout: false,
        //   })
        // }
      }

      // find page path
      const path = route.components.get('default') || ''
      if (path.endsWith('.md')) {
        const md = fs.readFileSync(path, 'utf-8')
        const { data, excerpt, content } = matter(md, matterOptions)
        const mdFm = data as Page

        // todo, optimize it to cache or on demand
        const lastUpdated = options.config.siteConfig.lastUpdated

        // do not export password
        delete mdFm.password
        if (mdFm.gallery_password) {
          delete mdFm.gallery_password
          delete mdFm.photos
        }

        if (!mdFm.date)
          mdFm.date = fs.statSync(path).mtime

        // format
        if (lastUpdated) {
          if (!mdFm.updated)
            mdFm.updated = fs.statSync(path).ctime
        }

        if (mdFm.from) {
          if (Array.isArray(mdFm.from)) {
            mdFm.from.forEach((from) => {
              options.redirects.push({
                from,
                to: route.fullPath,
              })
            })
          }
          else {
            options.redirects.push({
              from: mdFm.from,
              to: route.fullPath,
            })
          }
        }

        // set route meta
        route.addToMeta({
          frontmatter: mdFm,
          excerpt: excerpt ? getExcerptByType(excerpt, mdFm.excerpt_type, mdIt) : '',
        })

        // set layout
        if (data.layout) {
          route.addToMeta({
            layout: data.layout,
          })
        }

        // set default updated
        if (!route.meta.frontmatter?.updated)
          route.meta.frontmatter.updated = route.meta.frontmatter.date

        // adapt for tags
        if (route.meta.frontmatter.tags) {
          const tags = route.meta.frontmatter.tags
          if (typeof tags === 'string')
            route.meta.frontmatter.tags = [tags]
        }

        // TODO: extract to hook call
        if (valaxyConfig.siteConfig.statistics.enable) {
          presetStatistics({
            options: valaxyConfig.siteConfig.statistics,
            route,
          })
        }

        const ctx: Parameters<Required<typeof valaxyConfig>['extendMd']>[0] = {
          route,
          data: data as Readonly<Record<string, any>>,
          excerpt,
          content,
          path,
        }
        valaxyConfig.extendMd?.(ctx)
      }

      await valaxyApp.hooks.callHook('vue-router:extendRoute', route)

      return valaxyConfig.router?.extendRoute?.(route)
    },
  })
}
