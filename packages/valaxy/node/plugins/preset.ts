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

import type { ResolvedValaxyOptions, ValaxyPluginOptions, ValaxyServerOptions } from '../options'
import { setupMarkdownPlugins } from '../markdown'
// import { createMarkdownPlugin, excerpt_separator } from './markdown'
import { formatMdDate } from '../utils/date'
import { createUnocssPlugin } from './unocss'
import { createConfigPlugin } from './extendConfig'
import { createClientSetupPlugin } from './setupClient'
import { createValaxyPlugin } from '.'

export async function ViteValaxyPlugins(
  options: ResolvedValaxyOptions,
  pluginOptions: ValaxyPluginOptions = {},
  serverOptions: ValaxyServerOptions = {},
): Promise<(PluginOption | PluginOption[])[] | undefined> {
  const { roots } = options

  // const MarkdownPlugin = createMarkdownPlugin(options)
  const UnocssPlugin = await createUnocssPlugin(options, pluginOptions)

  const ValaxyPlugin = createValaxyPlugin(options, pluginOptions, serverOptions)

  // for render markdown excerpt
  const mdIt = new MarkdownIt({ html: true })
  await setupMarkdownPlugins(mdIt, pluginOptions.markdown, true)

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
        ...pluginOptions.vue?.template,
      },
      ...pluginOptions.vue,
    }),

    createConfigPlugin(options),
    createClientSetupPlugin(options),
    ValaxyPlugin,

    // https://github.com/hannoeru/vite-plugin-pages
    Pages({
      extensions: ['vue', 'md'],
      dirs: roots.map(root => `${root}/pages`),

      ...pluginOptions.pages,

      /**
       * we need get frontmatter before route, so write it in Pages.extendRoute
       */
      extendRoute(route, parent) {
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

        if (path.endsWith('.md')) {
          const md = fs.readFileSync(path, 'utf-8')
          const { data, excerpt } = matter(md, { excerpt_separator: '<!-- more -->' })

          // todo, optimize it to cache or on demand
          formatMdDate(
            data,
            path,
            options.config.date.format,
            options.config.lastUpdated,
          )

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

          pluginOptions.extendMd?.({
            route,
            data,
            excerpt,
            path,
          })
        }

        pluginOptions.pages?.extendRoute?.(route, parent)

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

      ...pluginOptions.components,
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
