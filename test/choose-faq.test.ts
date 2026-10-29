import fs from 'node:fs'
import path from 'node:path'
import { createHead, renderSSRHead } from '@unhead/vue/server'
import { describe, expect, it } from 'vitest'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import ChooseFaqJsonLd from '../docs/components/ChooseFaqJsonLd.vue'
import { chooseFaq } from '../docs/data/choose-faq'

const root = path.resolve(__dirname, '..')

function read(relativePath: string) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8')
}

function body(markdown: string) {
  return markdown.replace(/^---[\s\S]*?---\n/, '')
}

function firstParagraph(markdown: string) {
  return body(markdown).trim().split(/\n\s*\n/)[0] ?? ''
}

function frontmatter(markdown: string) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---/)
  return match?.[1] ?? ''
}

/** Visible FAQ text: link labels, without Markdown syntax. */
function visible(markdown: string) {
  return markdown
    .replace(/<ChooseFaqJsonLd\b[^>]*\/>/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/\s+/g, ' ')
    .trim()
}

function extractFaq(markdown: string, heading: string) {
  const start = markdown.indexOf(heading)
  expect(start).toBeGreaterThan(-1)
  const section = markdown.slice(start + heading.length)
  return section.split(/^### /m).slice(1).map((part) => {
    const newline = part.indexOf('\n')
    const question = part.slice(0, newline).trim()
    const answer = visible(part.slice(newline + 1).split(/^## /m)[0] ?? '')
    return { question, answer }
  })
}

function pngSize(relativePath: string) {
  const bytes = fs.readFileSync(path.join(root, relativePath))
  expect(bytes.subarray(0, 8).toString('hex')).toBe('89504e470d0a1a0a')
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  }
}

describe('choose page SEO', () => {
  const en = read('docs/pages/guide/choose.md')
  const zh = read('docs/pages/zh/guide/choose.md')

  it('puts the head keyword in the title, description, and first paragraph', () => {
    expect(frontmatter(en)).toContain('title: \'How to choose a static blog framework:')
    expect(frontmatter(en)).toContain('description: \'How to choose a static blog framework:')
    expect(firstParagraph(en).match(/static blog framework/g)).toEqual(['static blog framework'])

    expect(frontmatter(zh)).toContain('title: 静态博客框架怎么选：')
    expect(frontmatter(zh)).toContain('description: 静态博客框架怎么选：')
    expect(firstParagraph(zh).match(/静态博客框架/g)).toEqual(['静态博客框架'])
  })

  it('uses a 1200×630 social image instead of the favicon', () => {
    for (const page of [en, zh]) {
      expect(frontmatter(page)).toContain('ogImage: /images/choose-og.png')
      expect(page).not.toContain('favicon.svg')
    }
    expect(pngSize('docs/public/images/choose-og.png')).toEqual({ width: 1200, height: 630 })
  })

  it('links the home landing and why pages to the choose pages', () => {
    const home = read('docs/components/PressHome.vue')
    expect(home).toContain('href: \'/guide/choose\'')
    expect(home).toContain('href: \'/zh/guide/choose\'')
    expect(home).toContain('static blog framework')
    expect(home).toContain('静态博客框架怎么选')

    expect(read('docs/pages/guide/why.md')).toContain('](/guide/choose)')
    expect(read('docs/pages/zh/guide/why.md')).toContain('](/zh/guide/choose)')
  })

  it('keeps FAQPage copy aligned with the visible FAQ', () => {
    expect(extractFaq(en, '## Selection FAQ')).toEqual(chooseFaq.en)
    expect(extractFaq(zh, '## 选择常见问题')).toEqual(chooseFaq.zh)
    expect(en).toContain('<ChooseFaqJsonLd lang="en" />')
    expect(zh).toContain('<ChooseFaqJsonLd lang="zh" />')
  })

  it('renders one FAQPage JSON-LD graph per language', async () => {
    for (const lang of ['en', 'zh'] as const) {
      const head = createHead()
      const app = createSSRApp(ChooseFaqJsonLd, { lang })
      app.use(head)
      await renderToString(app)
      const { headTags } = await renderSSRHead(head)
      const scripts = [...headTags.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
      expect(scripts).toHaveLength(1)
      const data = JSON.parse(scripts[0][1])
      expect(data).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
      })
      expect(data.mainEntity).toEqual(chooseFaq[lang].map(item => ({
        '@type': 'Question',
        'name': item.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': item.answer,
        },
      })))
      expect(JSON.stringify(data).split('FAQPage')).toHaveLength(2)
    }
  })
})
