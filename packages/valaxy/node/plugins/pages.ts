import Pages from 'vite-plugin-pages'
import fs from 'fs-extra'
import matter from 'gray-matter'
import { isDate } from '@antfu/utils'
import { convert } from 'html-to-text'
import type { Page } from 'valaxy/types'
import type { ResolvedValaxyOptions } from '../options'
import type { ValaxyExtendConfig } from '../types'
import { EXCERPT_SEPARATOR } from '../constants'

import { mdIt } from './preset'
import { presetStatistics } from './presets/statistics'

/**
 * get excerpt by type
 * @param excerpt
 * @param type
 */
function getExcerptByType(excerpt = '', type: 'md' | 'html' | 'text' = 'html') {
  switch (type) {
    case 'md':
      return excerpt
    case 'html':
      return mdIt.render(excerpt)
    case 'text':
      return convert(mdIt.render(excerpt))
  }
}

/**
 * @see https://github.com/hannoeru/vite-plugin-pages
 * @param options
 */
export function createPagesPlugin(options: ResolvedValaxyOptions) {
  const { roots, config: valaxyConfig } = options

  return Pages({
    extensions: ['vue', 'md'],
    dirs: roots.map(root => `${root}/pages`),

    ...valaxyConfig.pages,

    /**
     * we need get frontmatter before route, so write it in Pages.extendRoute
     */
    async extendRoute(
      route: Parameters<Required<ValaxyExtendConfig>['extendMd']>[0]['route'],
      parent,
    ) {
      let path: string = route.component

      const defaultFrontmatter = {}
      if (!route.meta) {
        route.meta = {
          frontmatter: defaultFrontmatter,
        }
      }
      else if (!route.meta.frontmatter) {
        // set default frontmatter
        route.meta.frontmatter = defaultFrontmatter
      }

      // encode for chinese filename dev and build same
      route.path = encodeURI(route.path)

      // add default layout for home, can be overrode
      if (route.path === '/')
        route.meta.layout = 'home'

      // find page path
      roots.forEach((root) => {
        const pagePath = root + route.component
        if (fs.existsSync(pagePath))
          path = pagePath
      })

      // page is post
      if (route.path.startsWith('/posts/'))
        route.meta.layout = 'post'

      if (path.endsWith('.md')) {
        const md = fs.readFileSync(path, 'utf-8')
        const { data, excerpt, content } = matter(md, {
          excerpt_separator: EXCERPT_SEPARATOR,
        })
        const mdFm = data as Page

        // todo, optimize it to cache or on demand
        // https://github.com/hannoeru/vite-plugin-pages/issues/257
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
        route.meta = Object.assign(route.meta, {
          frontmatter: Object.assign(defaultFrontmatter, mdFm),
          excerpt: excerpt ? getExcerptByType(excerpt, mdFm.excerpt_type) : '',
        })

        // set layout
        if (data.layout)
          route.meta.layout = data.layout

        // set default updated
        if (!route.meta.frontmatter?.updated)
          route.meta.frontmatter.updated = route.meta.frontmatter.date

        // adapt for tags
        if (route.meta.frontmatter.tags) {
          const tags = route.meta.frontmatter.tags
          if (typeof tags === 'string')
            route.meta.frontmatter.tags = [tags]
        }

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

      valaxyConfig.pages?.extendRoute?.(route, parent)

      return route
    },
  })
}
