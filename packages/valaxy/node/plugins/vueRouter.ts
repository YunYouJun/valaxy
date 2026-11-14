import type { EditableTreeNode, Options } from 'vue-router/unplugin'
import type { ExcerptType, Page, Post } from '../../types'
import type { EditorRoutes } from '../editor/routes'
import type { ValaxyNode } from '../types'
import type { MarkdownBase } from './markdown/base'
import type { MarkdownRenderer } from './markdown/renderer'

import matter from '@11ty/gray-matter'

import fs from 'fs-extra'
import { convert } from 'html-to-text'
import { resolve } from 'pathe'
import VueRouter from 'vue-router/vite'
import { isReadmePage, isUnpublishedPage, mergePageExcludes, relativePagePath } from '../../shared'
import { plainSeoDescription, stripEncryptedContent } from '../../shared/seo'
import { EXCERPT_SEPARATOR } from '../constants'
import { vLogger } from '../logger'
import { getCreatedTime, getUpdatedTime } from '../utils/date'
import { getGitTimestampCache } from '../utils/getGitTimestamp'
import { countPerformanceTime } from '../utils/performance'
import { createMarkdownRenderer } from './markdown'

import { matterOptions } from './markdown/transform/matter'
// Import vue-router RouteMeta augmentation
import '../../types/vue-router.d'

/**
 * get excerpt by type
 * @param excerpt
 * @param type
 */
export async function getExcerptByType(excerpt = '', type: ExcerptType = 'html', mdIt: MarkdownRenderer) {
  switch (type) {
    case 'ai':
    case 'md':
      return excerpt
    case 'html':
      return mdIt.renderAsync(excerpt)
    case 'text':
      return convert(await mdIt.renderAsync(excerpt))
    default:
      return excerpt
  }
}

/**
 * Generate auto excerpt markdown from raw content by stripping headings and truncating.
 * Returns raw markdown text (not rendered) so it can be passed through `getExcerptByType`.
 */
export function generateAutoExcerptMd(content: string, length: number): string {
  // remove heading markers (# Title)
  const cleaned = content.replace(/^#+\s[^\n]*/gm, '').trim()
  if (!cleaned)
    return ''

  return cleaned.length > length ? `${cleaned.slice(0, length)}...` : cleaned
}

/**
 * @see https://router.vuejs.org/file-based-routing/
 * @param valaxyApp
 */
export async function createRouterPlugin(valaxyApp: ValaxyNode, base?: MarkdownBase, editorRoutes?: EditorRoutes) {
  const options = await createRouterOptions(valaxyApp, base)
  return VueRouter({
    ...options,
    async extendRoute(route) {
      const finish = [...route.components.values()].map(file => editorRoutes?.begin(file))
      try {
        await options.extendRoute?.(route)
      }
      finally {
        finish.forEach(done => done?.())
      }
    },
    async beforeWriteFiles(root) {
      await options.beforeWriteFiles?.(root)
      await editorRoutes?.update(root)
    },
  })
}

/** Share the actual route resolution pipeline with content inspection. */
export async function createRouterOptions(valaxyApp: ValaxyNode, base?: MarkdownBase, parseMatter = (source: string) => matter(source, matterOptions), onDispose?: (dispose: () => void) => void): Promise<Options> {
  const { options } = valaxyApp
  const { roots, config: valaxyConfig } = options

  const mdIt = await createMarkdownRenderer(options, base, onDispose)

  // Cache the deep-cloned default frontmatter to avoid re-cloning on every route.
  // Only re-clone when the reference changes (e.g. HMR config reload).
  let _lastFrontmatterRef = valaxyConfig.siteConfig.frontmatter
  let _cachedFrontmatter = structuredClone(valaxyConfig.siteConfig.frontmatter)

  return {
    extensions: ['.vue', '.md'],
    routesFolder: [
      ...roots.map(root => `${root}/pages`),
      ...(valaxyConfig.loaders?.length
        ? [resolve(options.tempDir, 'content', 'pages')]
        : []),
    ],
    dts: resolve(options.tempDir, 'route-map.d.ts'),

    // Disable file watching during build to prevent chokidar from opening
    // too many file descriptors (EMFILE) in large monorepos.
    // vue-router defaults to `watch: !process.env.CI`, which is true locally.
    watch: options.mode !== 'build',

    ...valaxyConfig.router,

    // Defaults stay in front of a user exclude list. `publishing` turns a class back on.
    exclude: mergePageExcludes(valaxyConfig.siteConfig.publishing, valaxyConfig.router?.exclude),

    /**
     * @experimental See https://github.com/posva/unplugin-vue-router/issues/43 (now part of vue-router)
     * we need get frontmatter before route, so write it in extendRoute
     */
    async extendRoute(route) {
      const publishing = valaxyConfig.siteConfig.publishing
      const component = route.components?.get?.('default') || ''
      const relative = component
        ? relativePagePath(component, options.userRoot) || relativePagePath(component)
        : undefined
      const privateSegment = route.fullPath.split('/').some(segment => segment.startsWith('_'))
      const readmeMarkdown = isReadmePage(component)
      if (
        (relative && isUnpublishedPage(relative, publishing))
        || (!publishing?.underscore && privateSegment)
        || (!publishing?.readme && readmeMarkdown)
      ) {
        route.delete?.()
        return
      }

      // Re-clone only when the frontmatter config reference changes (e.g. HMR)
      if (valaxyConfig.siteConfig.frontmatter !== _lastFrontmatterRef) {
        _lastFrontmatterRef = valaxyConfig.siteConfig.frontmatter
        _cachedFrontmatter = structuredClone(valaxyConfig.siteConfig.frontmatter)
      }
      const defaultFrontmatter = structuredClone(_cachedFrontmatter)
      const defaultPassword = defaultFrontmatter.password
      delete defaultFrontmatter.password
      if (route.meta && route.meta.frontmatter) {
        // reset frontmatter, extendRoute will be trigger when save md file
        const { frontmatter: _, seoDescription: _seoDescription, ...otherMeta } = route.meta
        route.meta = otherMeta as typeof route.meta
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
      if (route.fullPath === '/' || route.fullPath === '/page' || route.fullPath.startsWith('/page/')) {
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
      }
      else if (route.fullPath.startsWith('/collections/')) {
        if (route.fullPath.split('/').length > 3) {
          // add collection layout
          route.addToMeta({
            layout: 'collection',
          })
        }
      }

      // find page path
      const path = route.components.get('default') || ''
      // the page may be deleted right after being edited in dev
      const md = path.endsWith('.md')
        ? await fs.readFile(path, 'utf-8').catch((e: NodeJS.ErrnoException) => {
            if (e.code === 'ENOENT' || e.code === 'ENOTDIR')
              return undefined
            throw e
          })
        : undefined
      if (md !== undefined) {
        const { data, excerpt, content } = parseMatter(md)
        const mdFm = data as (Page | Post)

        const lastUpdated = valaxyConfig.siteConfig.lastUpdated

        // Keep the protection flag before removing the password from public metadata.
        const encrypted = Boolean(mdFm.password === undefined ? defaultPassword : mdFm.password)
          || (mdFm.encrypt ?? defaultFrontmatter.encrypt) === true
        const publicContent = encrypted ? '' : stripEncryptedContent(content)
        const publicExcerpt = publicContent.includes(EXCERPT_SEPARATOR)
          ? publicContent.split(EXCERPT_SEPARATOR)[0]
          : ''

        // do not export password
        delete mdFm.password
        if (mdFm.gallery_password) {
          delete mdFm.gallery_password
          delete mdFm.photos
        }

        const gitTimestampCache = getGitTimestampCache(options)
        if (!mdFm.date)
          mdFm.date = new Date(await getCreatedTime(path, gitTimestampCache))

        // format
        if (lastUpdated) {
          if (!mdFm.updated)
            mdFm.updated = new Date(await getUpdatedTime(path, gitTimestampCache))
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
          // Waiting for upstream API to stabilize
          // https://github.com/YunYouJun/valaxy/issues/487
          // 'projects',
        ]
        const routerFM: Post = {
          ...mdFm,
          // Normalize tags: ensure always an array for consistent consumption
          tags: typeof mdFm.tags === 'string' ? [mdFm.tags] : mdFm.tags,
          // set default updated to date if not present
          updated: mdFm.updated ?? mdFm.date,
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
        const manualExcerpt = typeof mdFm.excerpt === 'string' ? stripEncryptedContent(mdFm.excerpt) : mdFm.excerpt
        let resolvedExcerpt = manualExcerpt || (publicExcerpt ? await getExcerptByType(publicExcerpt, mdFm.excerpt_type || defaultFrontmatter.excerpt_type || valaxyConfig.siteConfig.excerpt.type, mdIt) : '')

        const explicitDescription = mdFm.description
        const hasExplicitDescription = typeof explicitDescription === 'string'
          ? explicitDescription.trim().length > 0
          : explicitDescription != null && typeof explicitDescription === 'object'
        const seoSource = encrypted
          ? ''
          : (typeof mdFm.excerpt === 'string' && mdFm.excerpt.trim()
              ? mdFm.excerpt
              : (publicExcerpt || publicContent))
        const seoDescription = hasExplicitDescription
          ? ''
          : plainSeoDescription(seoSource, valaxyConfig.siteConfig.excerpt?.length || 200)

        // auto excerpt: generate from content if no manual excerpt
        if (!resolvedExcerpt && valaxyConfig.siteConfig.excerpt.auto) {
          const autoExcerptLength = valaxyConfig.siteConfig.excerpt.length
          const excerptType = mdFm.excerpt_type || defaultFrontmatter.excerpt_type || valaxyConfig.siteConfig.excerpt.type
          const autoExcerptMd = generateAutoExcerptMd(publicContent, autoExcerptLength)
          resolvedExcerpt = await getExcerptByType(autoExcerptMd, excerptType, mdIt)
        }

        route.addToMeta({
          frontmatter: routerFM,
          excerpt: resolvedExcerpt,
          ...(seoDescription ? { seoDescription } : {}),
        })

        // set layout
        if (data.layout) {
          route.addToMeta({
            layout: data.layout,
          })
        }

        if (valaxyConfig.siteConfig.statistics.enable) {
          await valaxyApp.hooks.callHook('statistics', {
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

        // read excerpt from route.meta in case extendMd modified it
        const finalExcerpt = route.meta.excerpt ?? resolvedExcerpt

        await valaxyApp.hooks.callHook('md:afterRender', {
          route,
          data: data as Readonly<Record<string, any>>,
          excerpt: finalExcerpt,
          content,
          path,
          renderMarkdown: (source, env) => mdIt.renderAsync(source, env),
        })
      }

      const extendRouteTimer = countPerformanceTime()
      await valaxyApp.hooks.callHook('vue-router:extendRoute', route)
      const extendDuration = extendRouteTimer()
      vLogger.debug(`  extendRoute(${route.fullPath}): ${extendDuration}`)
      return valaxyConfig.router?.extendRoute?.(route)
    },

    async beforeWriteFiles(root) {
      await valaxyApp.hooks.callHook('vue-router:beforeWriteFiles', root)
      await valaxyConfig.router?.beforeWriteFiles?.(root)

      // Remove draft imports and metadata before the router generates its module.
      // Runtime filtering alone still ships the draft component in a JS chunk.
      // Run after user hooks so their final metadata and inserted routes are honored.
      if (options.mode === 'build' && !valaxyConfig.siteConfig.publishing?.drafts) {
        const prune = (parent: EditableTreeNode) => {
          for (const route of parent.children) {
            prune(route)
            if (!(route.meta.frontmatter as Page | undefined)?.draft)
              continue

            if (route.children.length) {
              // Preserve published descendants, just as flattenRoutes does at runtime.
              // Clearing components also prevents definePage imports for this node.
              route.components.clear()
              route.meta = {}
              route.name = false
            }
            else {
              route.delete()
            }
          }
        }
        prune(root)
      }
    },
  }
}
