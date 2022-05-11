// ref vitepress
import type MarkdownIt from 'markdown-it'
import type { MarkdownRenderer } from '..'
import { slugify } from '../slugify'
import { deeplyParseHeader } from './parseHeader'

export const headingPlugin = (md: MarkdownIt, include = [1, 2, 3, 4]) => {
  md.renderer.rules.heading_open = (tokens, i, options, env, self) => {
    const token = tokens[i]
    const tags = include.map(item => `h${item}`)
    if (tags.includes(token.tag)) {
      const content = tokens[i + 1].content
      const idAttr = token.attrs!.find(([name]) => name === 'id')
      const slug = idAttr && idAttr[1]
      const data = (md as MarkdownRenderer).__data
      const headers = data.headers || (data.headers = [])
      // remove {} after head
      const leftDeli = content.indexOf('{')
      const title = leftDeli === -1 ? content : content.slice(0, leftDeli).trim()

      const matched = content.match(/\{lang=\"(.*)\"\}/)
      const lang = matched ? matched[1] : ''
      headers.push({
        level: parseInt(token.tag.slice(1), 10),
        title: deeplyParseHeader(title),
        slug: slug || slugify(title),
        lang,
      })
    }
    return self.renderToken(tokens, i, options)
  }
}
