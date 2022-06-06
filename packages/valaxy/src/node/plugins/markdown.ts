import Markdown from 'vite-plugin-md'

import type { Plugin } from 'vite'
import type { ResolvedValaxyOptions } from '../options'

import { setupMarkdownPlugins } from '../markdown'
import { checkMd } from '../markdown/check'

export type ViteMdOptions = Parameters<typeof Markdown>[0]

export const excerpt_separator = '<!-- more -->'

// https://github.com/antfu/vite-plugin-md

export function createMarkdownPlugin(options: ResolvedValaxyOptions): Plugin[] {
  const mdOptions = options.config.markdownIt

  const defaultOptions: ViteMdOptions = {
    wrapperComponent: 'ValaxyMd',
    wrapperClasses: '',

    headEnabled: true,
    frontmatter: true,
    excerpt: excerpt_separator,

    markdownItSetup(md) {
      if (mdOptions.config)
        mdOptions.config(md)

      setupMarkdownPlugins(md, mdOptions)
    },

    transforms: {
      before: (code, id) => {
        checkMd(code, id)

        code.replace('{%', '\{\%')
        code.replace('%}', '\%\}')
        return code
      },
    },
  }

  return [Markdown(Object.assign(defaultOptions, options.config.markdown)), {
    name: 'valaxy:md',
    handleHotUpdate(ctx) {
      const { file, server } = ctx
      // send headers
      if (file.endsWith('.md')) {
        server.ws.send({
          type: 'custom',
          event: 'valaxy:md-update',
        })
      }
    },
  }]
}
