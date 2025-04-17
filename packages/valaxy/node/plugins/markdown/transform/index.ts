import type MarkdownIt from 'markdown-it'
import type { MarkdownItAsync } from 'markdown-it-async'

import type { Plugin } from 'vite'
import type { ResolvedValaxyOptions } from '../../../options'
import Markdown from 'unplugin-vue-markdown/vite'
import { Valaxy } from '../../../app/class'
import { logger } from '../../../logger'
import { highlight as createHighlighter } from '../plugins/highlight'
import { defaultCodeTheme, setupMarkdownPlugins } from '../setup'
import { createTransformIncludes } from './include'
import { matterOptions } from './matter'
import { transformMermaid } from './mermaid'

export * from './matter'

export type MarkdownRenderer = MarkdownItAsync

let md: MarkdownRenderer | undefined
let _disposeHighlighter: (() => void) | undefined

export function disposeMdItInstance() {
  if (md) {
    md = undefined
    _disposeHighlighter?.()
  }
}

export async function createMarkdownPlugin(
  options: ResolvedValaxyOptions,
): Promise<Plugin> {
  const mdOptions = options?.config.markdown || {}
  const theme = mdOptions.theme ?? defaultCodeTheme

  const transformIncludes = createTransformIncludes(options)
  // const mdItHighlight = await highlight(theme, mdOptions)

  const [highlight, dispose] = mdOptions.highlight
    ? [mdOptions.highlight, () => {}]
    : await createHighlighter(theme, mdOptions, logger)

  _disposeHighlighter = dispose

  return Markdown({
    include: [/\.md$/],
    wrapperClasses: '',
    // headEnabled: false,

    frontmatter: true,
    exportFrontmatter: false,
    frontmatterOptions: { grayMatterOptions: matterOptions },

    // v-pre
    escapeCodeTagInterpolation: true,

    markdownItOptions: {
      quotes: '""\'\'',
      html: true,
      xhtmlOut: true,
      linkify: true,
      highlight,
      ...mdOptions?.markdownItOptions,
    },

    async markdownItSetup(mdIt) {
      mdIt.linkify.set({ fuzzyLink: false })

      // setup mdIt
      await setupMarkdownPlugins(mdIt, options)

      options?.config.markdown?.markdownItSetup?.(mdIt)

      // get env
      function initEnv(md: MarkdownIt) {
        md.core.ruler.push('valaxy_md_env', (state) => {
          // record to map
          Valaxy.state.idMap.set(state.env.id, {
            id: state.env.id,
            title: state.env.title,
            links: state.env.links,
            headers: state.env.headers,
            frontmatter: state.env.frontmatter,
          })
        })
      }
      mdIt.use(initEnv)
    },

    transforms: {
      before(code, id) {
        // features
        code = transformMermaid(code)
        code = transformIncludes(code, id)
        // TODO: PlantUML
        // code = transformPlantUml(code, config.plantUmlServer)

        return code
      },

    },

    ...mdOptions,
  }) as Plugin
}
