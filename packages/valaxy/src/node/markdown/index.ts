import MarkdownIt from 'markdown-it'
import Emoji from 'markdown-it-emoji'
import Prism from 'markdown-it-prism'
import LinkAttributes from 'markdown-it-link-attributes'

const md = new MarkdownIt({ html: true })
md.use(Prism)
md.use(LinkAttributes, {
  matcher: (link: string) => /^https?:\/\//.test(link),
  attrs: {
    target: '_blank',
    rel: 'noopener',
  },
})
md.use(Emoji)

/**
 * render markdown to html
 * @param content
 * @returns
 */
export function render(content: string) {
  return md.render(content)
}
