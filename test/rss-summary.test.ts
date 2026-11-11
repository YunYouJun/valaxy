import type { ResolvedValaxyOptions } from '../packages/valaxy/node/types'
import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { Feed } from 'feed'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { getPosts } from '../packages/valaxy/node/modules/rss/utils'

const privateBlock = '<!-- valaxy-encrypt-start:test -->\nPRIVATE_SUMMARY\n<!-- more -->\n<!-- valaxy-encrypt-end -->'
let root: string
let options: ResolvedValaxyOptions

beforeEach(async () => {
  root = await mkdtemp(join(tmpdir(), 'valaxy-rss-summary-'))
  await mkdir(join(root, 'pages/posts'), { recursive: true })
  options = {
    userRoot: root,
    config: {
      siteConfig: { url: 'https://example.com/', lang: 'en', excerpt: { length: 200 } },
      modules: { rss: { fullText: false, extractImagePathsFromHTML: false } },
    },
  } as ResolvedValaxyOptions
})

afterEach(async () => {
  await rm(root, { recursive: true, force: true })
})

async function posts(frontmatter: Record<string, unknown>, content = 'Public opening.\n\n<!-- more -->\nLater body.') {
  const path = join(root, 'pages/posts/note.md')
  const fields = Object.entries({ title: 'Note', date: '2024-01-01', ...frontmatter })
    .map(([key, value]) => `${key}: ${JSON.stringify(value)}`)
    .join('\n')
  await writeFile(path, `---\n${fields}\n---\n${content}`)
  return getPosts({ author: { name: 'Author' }, files: [path], DOMAIN: 'https://example.com' }, options)
}

describe('summary fallback for RSS', () => {
  it.each([
    [{ description: 'Explicit description.', excerpt: 'Manual excerpt.' }, 'Explicit description.'],
    [{ excerpt: 'A **manual** [summary](/about) with `snake_case`.' }, 'A manual summary with snake_case.'],
    [{ description: ' \n ', excerpt: 'Manual excerpt.' }, 'Manual excerpt.'],
    [{ description: null, excerpt: null }, 'Public opening.'],
    [{ description: false, excerpt: false }, 'Public opening.'],
    [{ excerpt: '   ' }, 'Public opening.'],
    [{ excerpt: '```js\ncodeOnly()\n```\n![image](/image.png)' }, 'Public opening.'],
    [{ excerpt: privateBlock }, 'Public opening.'],
    [{ excerpt: `Public teaser.\n${privateBlock}` }, 'Public teaser.'],
    [{ excerpt: 'Public teaser.\n<!-- valaxy-encrypt-start:test -->\nPRIVATE_SUMMARY' }, 'Public teaser.'],
  ])('selects a valid public summary from %j', async (frontmatter, expected) => {
    const result = await posts(frontmatter)
    expect(result[0].description).toBe(expected)
    const feed = new Feed({ title: 'Test', id: 'https://example.com/', copyright: '' })
    result.forEach(post => feed.addItem(post))
    expect(feed.atom1() + feed.rss2() + feed.json1()).not.toContain('PRIVATE_SUMMARY')
  })

  it('uses the configured language and retains the existing first-language fallback', async () => {
    options.config.siteConfig.lang = 'zh-CN'
    expect((await posts({ description: { 'en': 'English', 'zh-CN': '中文描述' }, excerpt: 'Ignored' }))[0].description).toBe('中文描述')
    expect((await posts({ description: { 'zh-CN': ' ' }, excerpt: { 'en': 'English', 'zh-CN': '**中文摘要**' } }))[0].description).toBe('中文摘要')
    expect((await posts({ description: { en: 'Fallback language' } }))[0].description).toBe('Fallback language')
  })

  it('limits inferred summaries but preserves explicit descriptions and zero-length defaulting', async () => {
    options.config.siteConfig.excerpt.length = 12
    expect((await posts({ excerpt: 'alpha beta gamma delta' }))[0].description).toBe('alpha beta…')
    expect((await posts({ description: 'An explicit description longer than twelve.' }))[0].description).toBe('An explicit description longer than twelve.')
    options.config.siteConfig.excerpt.length = 0
    expect((await posts({ excerpt: 'alpha beta gamma delta' }))[0].description).toBe('alpha beta gamma delta')
  })

  it.each([false, true])('removes private blocks before deriving summaries and feed content (fullText=%s)', async (fullText) => {
    options.config.modules.rss.fullText = fullText
    const result = await posts({}, `# Heading\n\n${privateBlock}\nPublic **opening**.\n\n<!-- more -->\nPublic ending.`)
    expect(result[0].description).toBe('Public opening.')
    expect(result[0].content).toContain('Public <strong>opening</strong>.')
    expect(JSON.stringify(result)).not.toContain('PRIVATE_SUMMARY')
  })

  it.each([{ password: 'secret' }, { encrypt: true }])('still excludes whole-page encryption with an explicit summary: %j', async (protection) => {
    expect(await posts({ ...protection, description: 'Public description.', excerpt: 'Public teaser.' }, 'PRIVATE_SUMMARY')).toEqual([])
  })
})
