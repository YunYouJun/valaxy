import VueRouter from 'unplugin-vue-router/vite'
import fs from 'fs-extra'
import matter from 'gray-matter'
import { isDate } from '@antfu/utils'
import { convert } from 'html-to-text'
import type { ExcerptType, Page } from 'valaxy/types'
import type { RouteMeta } from 'vue-router'
import type { ResolvedValaxyOptions } from '../options'
import { EXCERPT_SEPARATOR } from '../constants'

import { mdIt } from './preset'
import { presetStatistics } from './presets/statistics'

/**
 * get excerpt by type
 * @param excerpt
 * @param type
 */
function getExcerptByType(excerpt = '', type: ExcerptType = 'html') {
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
 * @param options
 */
export function createRouterPlugin(options: ResolvedValaxyOptions) {
  const { roots, config: valaxyConfig } = options

  return VueRouter({
    extensions: ['.vue', '.md'],
    routesFolder: roots.map(root => `${root}/pages`),
    dts: `${options.clientRoot}/typed-router.d.ts`,

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

      // find page path
      const path = route.components.get('default') || ''

      // page is post
      if (route.fullPath.startsWith('/posts/')) {
        route.addToMeta({
          layout: 'post',
        })
      }

      if (path.endsWith('.md')) {
        const md = fs.readFileSync(path, 'utf-8')
        const { data, excerpt, content } = matter(md, {
          excerpt_separator: EXCERPT_SEPARATOR,
        })
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

        if (!isDate(mdFm.date))
          mdFm.date = new Date(mdFm.date)
        if (!isDate(mdFm.updated))
          mdFm.updated = new Date(mdFm.updated!)

        // set route meta
        route.addToMeta({
          frontmatter: mdFm,
          excerpt: excerpt ? getExcerptByType(excerpt, mdFm.excerpt_type) : '',
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

      return valaxyConfig.router?.extendRoute?.(route)
    },
  })
}
