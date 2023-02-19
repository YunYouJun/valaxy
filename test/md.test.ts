// import { resolve } from 'path'
// import fs from 'fs'
import { describe, expect, it } from 'vitest'
import { createMarkdownRenderer } from '../packages/valaxy/node/markdown'

// const mdDir = resolve(__dirname, 'fixtures/markdown')

describe('md parse', async () => {
  const md = await createMarkdownRenderer()

  it('i18n:header', () => {
    const content = md.render('## Header {lang="en"}')
    const result = '<h2 lang="en" id="header" tabindex="-1">Header <a class="header-anchor" href="#header" aria-hidden="true">#</a></h2>'
    expect(content.trim()).toEqual(result)
  })

  it('i18n:content', () => {
    const content = md.render('::: en\nContent\n:::')
    const result = '<div lang="en">\n<p>Content</p>\n</div>'
    expect(content.trim()).toEqual(result)
  })
})
