import type MarkdownIt from 'markdown-it'
import type { MarkdownItAsync } from 'markdown-it-async'

import type { Plugin } from 'vite'
import type { ResolvedValaxyOptions } from '../../../types'
import Markdown from 'unplugin-vue-markdown/vite'
import { Valaxy } from '../../../app/class'
import { logger } from '../../../logger'
import { getSharedHighlighter } from '../highlighterCache'
import { defaultCodeTheme, setupMarkdownPlugins } from '../setup'
import { createTransformIncludes } from './include'
import { matterOptions } from './matter'
import { transformMermaid } from './mermaid'
import { sanitizeCommentedSfcBlocks } from './sanitize-comment'

export * from './matter'

export type MarkdownRenderer = MarkdownItAsync

let _disposeHighlighter: (() => void) | undefined

export function disposeMdItInstance() {
  _disposeHighlighter?.()
  _disposeHighlighter = undefined
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
    : await getSharedHighlighter(theme, mdOptions, logger)

  _disposeHighlighter = dispose

  // Extract user transforms so they can be composed with internal transforms
  // instead of being overwritten by `...mdOptions` spread.
  const { transforms: userTransforms, ...restMdOptions } = mdOptions

  return Markdown({
    include: [/\.md$/],
    wrapperClasses: '',
    // headEnabled: false,

    frontmatter: true,
    exportFrontmatter: false,
    frontmatterOptions: {
      // Disable excerpt rendering in @mdit-vue/plugin-frontmatter because it
      // uses sync md.render() which throws with async highlight (markdown-exit:
      // "Renderer.render: async rule detected, use renderAsync()").
      // Valaxy handles excerpt rendering separately in vueRouter.ts via
      // getExcerptByType() which properly uses renderAsync().
      renderExcerpt: false,
      grayMatterOptions: matterOptions,
    },

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
      await setupMarkdownPlugins(mdIt as unknown as MarkdownItAsync, options)

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
      mdIt.use(initEnv as any)
    },

    transforms: {
      before(code, id) {
        // features
        code = transformMermaid(code)
        code = transformIncludes(code, id)
        // TODO: PlantUML
        // code = transformPlantUml(code, config.plantUmlServer)

        // Run user's before transform if provided
        return userTransforms?.before?.(code, id) ?? code
      },

      after(html, id) {
        // Workaround for unplugin-vue-markdown extracting <script>/<style> tags
        // from inside HTML comments (https://github.com/YunYouJun/valaxy/issues/558)
        html = sanitizeCommentedSfcBlocks(html)

        // Run user's after transform if provided
        return userTransforms?.after?.(html, id) ?? html
      },
    },

    ...restMdOptions,
  }) as Plugin
}
