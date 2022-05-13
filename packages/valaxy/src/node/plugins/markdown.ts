import path from 'path'
import Markdown from 'vite-plugin-md'

import type { Plugin } from 'vite'
import type { ResolvedValaxyOptions } from '../options'

import type { MarkdownRenderer } from '../markdown'
import { setupMarkdownPlugins } from '../markdown'
import { slash } from '../utils'

export type ViteMdOptions = Parameters<typeof Markdown>[0]

export const excerpt_separator = '<!-- more -->'

// https://github.com/antfu/vite-plugin-md
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createMarkdownPlugin(options: ResolvedValaxyOptions): Plugin[] {
  let _md: MarkdownRenderer

  const mdOptions = options.config.markdownIt

  const defaultOptions: ViteMdOptions = {
    wrapperComponent: 'ValaxyMd',
    wrapperClasses: '',

    headEnabled: true,
    frontmatter: true,

    excerpt: excerpt_separator,

    // builders: [
    //   // avoid conflict with markdown-it-anchor link
    //   // link(),
    //   // seems bug, override frontmatter
    //   // meta(),
    // ],

    markdownItSetup(md) {
      if (mdOptions.config)
        mdOptions.config(md)

      _md = setupMarkdownPlugins(md, mdOptions)
    },
  }
  return [Markdown(Object.assign(defaultOptions, options.config.markdown)), {
    name: 'valaxy:md',
    handleHotUpdate(ctx) {
      const { file, server } = ctx
      // send headers
      if (file.endsWith('.md') && _md && _md.__data) {
        server.ws.send({
          type: 'custom',
          event: 'valaxy:pageHeaders',
          data: {
            path: `/${slash(path.relative(`${options.userRoot}/pages`, file))}`,
            pageHeaders: _md.__data.headers,
          },
        })
      }
    },
  }]
}
