import fs from 'fs'
import type { PluginOption } from 'vite'

import consola from 'consola'

import MarkdownIt from 'markdown-it'
import matter from 'gray-matter'

import Vue from '@vitejs/plugin-vue'
import Pages from 'vite-plugin-pages'
import Layouts from 'vite-plugin-vue-layouts'
import Components from 'unplugin-vue-components/vite'
import VueI18n from '@intlify/vite-plugin-vue-i18n'
import Inspect from 'vite-plugin-inspect'

import { dim, yellow } from 'kolorist'
import type { ResolvedValaxyOptions, ValaxyServerOptions } from '../options'
import { setupMarkdownPlugins } from '../markdown'
import { createMarkdownPlugin, excerpt_separator } from './markdown'
import { createUnocssPlugin } from './unocss'
import { createConfigPlugin } from './extendConfig'
import { createValaxyPlugin } from '.'

export interface ValaxyPluginOptions {
  components?: Parameters<typeof Components>[0]
}

export async function ViteValaxyPlugins(
  options: ResolvedValaxyOptions,
  serverOptions: ValaxyServerOptions = {},
  pluginOptions: ValaxyPluginOptions = {},
): Promise<(PluginOption | PluginOption[])[] | undefined> {
  const { clientRoot, themeRoot, userRoot } = options

  const MarkdownPlugin = createMarkdownPlugin(options)
  const UnocssPlugin = await createUnocssPlugin(options)

  const ValaxyPlugin = createValaxyPlugin(options, serverOptions)

  const mdIt = new MarkdownIt({ html: true })
  setupMarkdownPlugins(mdIt, options.config.markdownIt)

  const roots = [clientRoot, themeRoot, userRoot]

  const { default: ThemePlugin } = (await import(`valaxy-theme-${options.theme}`))

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
      },
    }),

    ValaxyPlugin,
    createConfigPlugin(options),

    ThemePlugin(options.config.themeConfig),

    // https://github.com/hannoeru/vite-plugin-pages
    Pages({
      extensions: ['vue', 'md'],
      dirs: roots.map(root => `${root}/pages`),
      /**
       * we need get frontmatter before route, so write it in Pages.extendRoute
       */
      extendRoute(route) {
        let path = route.component
        if (!route.meta)
          route.meta = {}

        // add default layout for home, can be overrode
        if (route.path === '/')
          route.meta.layout = 'home'

        roots.forEach((root) => {
          const pagePath = root + route.component
          if (fs.existsSync(pagePath))
            path = pagePath
        })

        const md = fs.readFileSync(path, 'utf-8')
        const { data, excerpt } = matter(md, { excerpt_separator })

        // warn for post frontmatter
        if (route.path.startsWith('/posts/')) {
          route.meta.layout = 'post'
          if (!data.date)
            consola.warn(`You forgot to write ${yellow('date')} for post: ${dim(`${route.component}`)}`)
        }

        route.meta = Object.assign(route.meta, {
          frontmatter: Object.assign({ date: new Date() }, data),
          excerpt: excerpt ? mdIt.render(excerpt) : '',
        })

        // set default updated
        if (route.meta.frontmatter.updated)
          route.meta.frontmatter.updated = route.meta.frontmatter.date

        // set layout
        if (data.layout)
          route.meta.layout = data.layout

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
      dirs: roots.map(root => `${root}/components`).concat(['src/components', 'components']),
      dts: `${options.userRoot}/components.d.ts`,

      ...pluginOptions,
    }),

    // https://github.com/antfu/unocss
    // UnocssPlugin,
    UnocssPlugin,

    ...MarkdownPlugin,

    // https://github.com/intlify/bundle-tools/tree/main/packages/vite-plugin-vue-i18n
    VueI18n({
      runtimeOnly: true,
      compositionOnly: true,
      include: roots.map(root => `${root}/locales/**`),
    }),

    // https://github.com/antfu/vite-plugin-inspect
    // Visit http://localhost:3333/__inspect/ to see the inspector
    options.mode === 'dev' && Inspect(),
  ]
}
