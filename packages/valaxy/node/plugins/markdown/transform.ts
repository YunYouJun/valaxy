import type { Plugin } from 'vite'
import Markdown from 'unplugin-vue-markdown/vite'
import * as base64 from 'js-base64'

import type { ResolvedValaxyOptions } from '../../options'
import { highlight } from './plugins/highlight'
import { defaultCodeTheme, setupMarkdownPlugins } from '.'

/**
 * Transform Mermaid code blocks (render done on client side)
 */
export function transformMermaid(md: string): string {
  return md
    .replace(/^```mermaid\s*?({.*?})?\n([\s\S]+?)\n```/mg, (full, options = '', code = '') => {
      code = code.trim()
      options = options.trim() || '{}'
      const encoded = base64.encode(code, true)
      return `<ValaxyMermaid :code="'${encoded}'" v-bind="${options}" />`
    })
}

export async function createMarkdownPlugin(
  options: ResolvedValaxyOptions,
): Promise<Plugin> {
  const mdOptions = options?.config.markdown || {}
  const theme = mdOptions.theme ?? defaultCodeTheme

  return Markdown({
    include: [/\.md$/],
    wrapperClasses: '',
    // headEnabled: false,

    frontmatter: true,

    // v-pre
    escapeCodeTagInterpolation: true,

    markdownItOptions: {
      quotes: '""\'\'',
      html: true,
      xhtmlOut: true,
      linkify: true,
      highlight: await highlight(theme, mdOptions),
      ...mdOptions?.markdownItOptions,
    },

    async markdownItSetup(mdIt) {
      // setup mdIt
      await setupMarkdownPlugins(mdIt, options, true)

      options?.config.markdown?.markdownItSetup?.(mdIt)
    },

    transforms: {
      before(code, _id) {
        // const monaco = (config.monaco === true || config.monaco === mode)
        //   ? transformMarkdownMonaco
        //   : truncateMancoMark

        // code = transformSlotSugar(code)
        // code = transformSnippet(code, options, id)
        code = transformMermaid(code)
        // code = transformPlantUml(code, config.plantUmlServer)
        // code = monaco(code)
        // code = transformHighlighter(code)
        // code = transformPageCSS(code, id)
        // code = transformKaTex(code)

        return code
      },

    },

    // frontmatterOptions componentOptions in mdOptions
    ...mdOptions,
  }) as Plugin
}
