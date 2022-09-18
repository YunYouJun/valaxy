import fs from 'fs'
import type { PluginOption } from 'vite'
import { splitVendorChunkPlugin } from 'vite'

import MarkdownIt from 'markdown-it'
import matter from 'gray-matter'

import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import Components from 'unplugin-vue-components/vite'
import VueI18n from '@intlify/vite-plugin-vue-i18n'

import dayjs from 'dayjs'
import type { ResolvedValaxyOptions, ValaxyServerOptions } from '../options'
import { setupMarkdownPlugins } from '../markdown'
// import { createMarkdownPlugin, excerpt_separator } from './markdown'
// import { formatMdDate } from '../utils/date'
import { createUnocssPlugin } from './unocss'
import { createConfigPlugin } from './extendConfig'
import { createClientSetupPlugin } from './setupClient'
import { createValaxyPlugin } from '.'

export async function ViteValaxyPlugins(
  options: ResolvedValaxyOptions,
  serverOptions: ValaxyServerOptions = {},
): Promise<(PluginOption | PluginOption[])[] | undefined> {
  const { roots, config: valaxyConfig } = options

  // const MarkdownPlugin = createMarkdownPlugin(options)
  const UnocssPlugin = await createUnocssPlugin(options)

  const ValaxyPlugin = createValaxyPlugin(options, serverOptions)

  // for render markdown excerpt
  const mdIt = new MarkdownIt({ html: true })

  await setupMarkdownPlugins(mdIt, valaxyConfig.markdown, true)

  const customElements = new Set([
    // katex
    'annotation',
    'math',
    'menclose',
    'mfrac',
    'mglyph',
    'mi',
    'mlabeledtr',
    'mn',
    'mo',
    'mover',
    'mpadded',
    'mphantom',
    'mroot',
    'mrow',
    'mspace',
    'msqrt',
    'mstyle',
    'msub',
    'msubsup',
    'msup',
    'mtable',
    'mtd',
    'mtext',
    'mtr',
    'munder',
    'munderover',
    'semantics',

    // meting
    'meting-js',
  ])

  return [
    Vue({
      include: [/\.vue$/, /\.md$/],
      template: {
        compilerOptions: {
          isCustomElement: (tag) => {
            return customElements.has(tag)
          },
        },
        ...valaxyConfig.vue?.template,
      },
      ...valaxyConfig.vue,
    }),

    createConfigPlugin(options),
    createClientSetupPlugin(options),
    ValaxyPlugin,

    // https://github.com/hannoeru/vite-plugin-pages
    Pages({
      extensions: ['vue', 'md'],
      dirs: roots.map(root => `${root}/pages`),

      ...valaxyConfig.pages,

      /**
       * we need get frontmatter before route, so write it in Pages.extendRoute
       */
      async extendRoute(route, parent) {
        let path: string = route.component
        if (!route.meta)
          route.meta = {}

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

        // set default frontmatter
        const defaultFrontmatter = {}
        if (!route.meta.frontmatter)
          route.meta.frontmatter = defaultFrontmatter

        if (path.endsWith('.md')) {
          const md = fs.readFileSync(path, 'utf-8')
          const { data, excerpt, content } = matter(md, { excerpt_separator: '<!-- more -->' })

          // todo, optimize it to cache or on demand
          // https://github.com/hannoeru/vite-plugin-pages/issues/257
          // returned route not be awaited
          // await formatMdDate(
          //   data,
          //   path,
          //   options.config.date.format,
          //   options.config.lastUpdated,
          // )
          const lastUpdated = options.config.lastUpdated
          const format = options.config.date?.format
          if (!data.date)
            data.date = fs.statSync(path).mtime

          // format
          data.date = dayjs(data.date).format(format)

          if (lastUpdated) {
            if (!data.updated)
              data.updated = fs.statSync(path).ctime

            data.updated = dayjs(data.updated).format(format)
          }

          // set route meta
          route.meta = Object.assign(route.meta, {
            frontmatter: Object.assign(defaultFrontmatter, data),
            excerpt: excerpt ? mdIt.render(excerpt) : '',
          })

          // set layout
          if (data.layout)
            route.meta.layout = data.layout

          // set default updated
          if (route.meta.frontmatter.updated)
            route.meta.frontmatter.updated = route.meta.frontmatter.date

          valaxyConfig.extendMd?.({
            route,
            data,
            excerpt,
            content,
            path,
          })
        }

        valaxyConfig.pages?.extendRoute?.(route, parent)

        return route
      },
    }),

    // https://github.com/JohnCampionJr/vite-plugin-vue-layouts
    Layouts({
      layoutsDirs: roots.map(root => `${root}/layouts`),
    }),

    // https://github.com/antfu/unplugin-vue-components
    Components({
      extensions: ['vue', 'md'],

      // allow auto import and register components used in markdown
      include: [/\.vue$/, /\.vue\?vue/, /\.md$/],
      exclude: [],

      // allow override
      allowOverrides: true,
      // override: user -> theme -> client
      // latter override former
      dirs: roots.map(root => `${root}/components`).concat(roots.map(root => `${root}/layouts`)).concat(['src/components', 'components']),
      dts: `${options.userRoot}/components.d.ts`,

      ...valaxyConfig.components,
    }),

    // https://github.com/antfu/unocss
    // UnocssPlugin,
    UnocssPlugin,

    // ...MarkdownPlugin,

    // https://github.com/intlify/bundle-tools/tree/main/packages/vite-plugin-vue-i18n
    VueI18n({
      runtimeOnly: true,
      compositionOnly: true,
      include: roots.map(root => `${root}/locales/**`),
    }),

    splitVendorChunkPlugin(),
  ]
}
