import type MarkdownIt from 'markdown-it'
import type Token from 'markdown-it/lib/token'
import container from 'markdown-it-container'

export interface CSSI18nOptions {
  languages?: string[]
}

export function cssI18nContainer(md: MarkdownIt, options: CSSI18nOptions = {}) {
  const languages = options.languages || ['zh-CN', 'en']

  languages.forEach((lang) => {
    md.use(container, lang, {
      render: (tokens: Token[], idx: number) =>
        tokens[idx].nesting === 1 ? `<div lang="${lang}">\n` : '</div>\n',
    })
  })
}
