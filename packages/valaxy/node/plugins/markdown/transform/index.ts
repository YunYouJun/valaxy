import type { Plugin } from 'vite'
import type { StateManager } from '../../../app/state'
import type { ResolvedValaxyOptions } from '../../../types'
import type { MarkdownBase } from '../base'
import type { MarkdownEnv } from '../env'
import type { MarkdownRenderer } from '../renderer'
import Markdown from 'unplugin-vue-markdown/vite'
import { Valaxy } from '../../../app/class'
import { logger } from '../../../logger'
import { getSharedHighlighter } from '../highlighterCache'
import { defaultCodeTheme, setupMarkdownPageMetadata, setupMarkdownPlugins } from '../setup'
import { createTransformIncludes } from './include'
import { matterOptions } from './matter'
import { transformMermaid } from './mermaid'
import { sanitizeCommentedSfcBlocks } from './sanitize-comment'

export type { MarkdownRenderer } from '../renderer'
export * from './matter'

export function disposeMdItInstance() {
  Valaxy.state.dispose()
}

export async function createMarkdownPlugin(
  options: ResolvedValaxyOptions,
  base?: MarkdownBase,
  state: StateManager = Valaxy.state,
): Promise<Plugin> {
  const mdOptions = options?.config.markdown || {}
  const theme = mdOptions.theme ?? defaultCodeTheme

  const transformIncludes = createTransformIncludes(options)
  // const mdItHighlight = await highlight(theme, mdOptions)

  const [highlight, dispose] = mdOptions.highlight
    ? [mdOptions.highlight, () => {}]
    : await getSharedHighlighter(theme, mdOptions, logger)

  state.onDispose(dispose)

  // Extract user hooks so they can be composed with internal setup and
  // transforms instead of overwriting them through the options spread.
  const {
    transforms: userTransforms,
    markdownSetup: userMarkdownSetup,
    markdownItSetup: userMarkdownItSetup,
    ...restMdOptions
  } = mdOptions
  const setupUserMarkdown = userMarkdownSetup ?? userMarkdownItSetup

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

    async markdownSetup(mdIt) {
      mdIt.linkify.set({ fuzzyLink: false })

      // setup mdIt
      await setupMarkdownPlugins(mdIt, options, base)

      await setupUserMarkdown?.(mdIt)
      setupMarkdownPageMetadata(mdIt, options)

      // get env
      function initEnv(md: MarkdownRenderer) {
        md.core.ruler.push('valaxy_md_env', (mdState) => {
          const env = mdState.env as MarkdownEnv
          if (!env.id)
            return
          // record to map
          state.set({
            id: env.id,
            title: env.title ?? '',
            links: env.links ?? [],
            headers: env.headers ?? [],
            frontmatter: env.frontmatter ?? {},
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
        // PlantUML is not built-in (requires external server).
        // See https://valaxy.site/guide/markdown#plantuml

        // Run user's before transform if provided
        return userTransforms?.before?.(code, id) ?? code
      },

      async after(html, id) {
        // Run user's after transform first
        if (userTransforms?.after)
          html = await userTransforms.after(html, id) ?? html

        // Workaround for unplugin-vue-markdown extracting <script>/<style> tags
        // from inside HTML comments (https://github.com/YunYouJun/valaxy/issues/558)
        // Run LAST to guarantee the invariant before SFC extraction.
        return sanitizeCommentedSfcBlocks(html)
      },
    },

    ...restMdOptions,
  }) as Plugin
}
