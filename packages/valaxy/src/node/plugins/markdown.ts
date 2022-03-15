import Markdown from 'vite-plugin-md'
import Prism from 'markdown-it-prism'
import LinkAttributes from 'markdown-it-link-attributes'
import type { ResolvedValaxyOptions } from '../options'

const markdownWrapperClasses = 'prose prose-sm m-auto text-left'

// https://github.com/antfu/vite-plugin-md
// Don't need this? Try vitesse-lite: https://github.com/antfu/vitesse-lite
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function createMarkdownPlugin(options: ResolvedValaxyOptions) {
  return Markdown({
    wrapperClasses: markdownWrapperClasses,

    headEnabled: true,

    markdownItSetup(md) {
      // https://prismjs.com/
      md.use(Prism)
      md.use(LinkAttributes, {
        matcher: (link: string) => /^https?:\/\//.test(link),
        attrs: {
          target: '_blank',
          rel: 'noopener',
        },
      })

      // todo
      // katex
    },
  })
}
