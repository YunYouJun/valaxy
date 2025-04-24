import type { ExcerptType, Page, Post } from 'valaxy/types'
import type { RouteMeta } from 'vue-router'
import type { ValaxyNode } from '../types'
import fs from 'fs-extra'
import matter from 'gray-matter'
import { convert } from 'html-to-text'
import { MarkdownItAsync } from 'markdown-it-async'
import { resolve } from 'pathe'
import VueRouter from 'unplugin-vue-router/vite'

import { setupMarkdownPlugins } from './markdown'
import { matterOptions } from './markdown/transform/matter'
import { presetStatistics } from './presets/statistics'

/**
 * get excerpt by type
 * @param excerpt
 * @param type
 */
function getExcerptByType(excerpt = '', type: ExcerptType = 'html', mdIt: MarkdownItAsync) {
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

  const mdIt = new MarkdownItAsync({ html: true })
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
      /**
       * merge deeply
       * 添加全局默认的 frontmatter
       */
      route.addToMeta({
        frontmatter: defaultFrontmatter,
      })

      // encode for chinese filename dev and build same
      // const encodedPath = encodeURI(route.path)
      // if (encodedPath !== route.path)
      //   route.path = encodedPath

      // if (!route.meta.frontmatter) {
      //   route.addToMeta({
      //     frontmatter: {},
      //   })
      // }

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
        const mdFm = data as (Page | Post)

        // todo, optimize it to cache or on demand
        const lastUpdated = options.config.siteConfig.lastUpdated

        // do not export password
        delete mdFm.password
        if (mdFm.gallery_password) {
          delete mdFm.gallery_password
          delete mdFm.photos
        }

        if (!mdFm.date)
          mdFm.date = (await fs.stat(path)).mtime

        // format
        if (lastUpdated) {
          if (!mdFm.updated)
            mdFm.updated = (await fs.stat(path)).ctime
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

        // const keys = [
        //   'title',
        //   'categories',
        //   'description',
        //   'date',
        //   'updated',
        //   'excerpt_type',

        //   'hero',
        // ]
        const excludeKeys = [
          'albums',
          'excerpt',
          'girls',
          'links',
          'photos',
          // @TODO defineBasicLoader for page
          // 'projects',
        ]
        const routerFM: Post = {
          ...mdFm,
          // 主题有新的字段需要主动设置
          // @TODO 添加文档和配置项，或者反过来允许用户自行优化
          tags: typeof mdFm.tags === 'string' ? [mdFm.tags] : mdFm.tags,
        }
        excludeKeys.forEach((key) => {
          delete routerFM[key]
        })
        /**
         * set route meta
         * 必要的 frontmatter（草稿、首页、摘要、分页、分类、标签等地方使用）
         *
         * 不会与 vue-router loader 自动合并
         */
        route.addToMeta({
          frontmatter: routerFM,
          excerpt: mdFm.excerpt || (excerpt ? getExcerptByType(excerpt, mdFm.excerpt_type || defaultFrontmatter.excerpt_type, mdIt) : ''),
        })

        // set layout
        if (data.layout) {
          route.addToMeta({
            layout: data.layout,
          })
        }

        // set default updated
        if (!route.meta.frontmatter?.updated)
          route.meta.frontmatter.updated = mdFm.date

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

    async beforeWriteFiles(root) {
      await valaxyApp.hooks.callHook('vue-router:beforeWriteFiles', root)
    },
  })
}
