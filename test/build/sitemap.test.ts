import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { writeSitemap } from '../../packages/valaxy/node/build/sitemap'

describe('sitemap generation', () => {
  it('lists each rendered page once under the site base and keeps a custom robots.txt', async () => {
    const outDir = await mkdtemp(join(tmpdir(), 'valaxy-sitemap-'))
    try {
      const robots = 'User-agent: *\nDisallow: /_drafts\n'
      await writeFile(join(outDir, 'robots.txt'), robots)
      await writeSitemap(outDir, 'https://example.com/blog', [
        '/',
        '/about/',
        '/about',
        '/posts',
        '/posts/',
        '/posts/中文',
        '/posts/%E4%B8%AD%E6%96%87',
        '/posts/a&b',
        '/posts/404-notes',
        '/404',
        '/404.html',
        '/zh/404/',
      ].map(route => ({ route })))

      const sitemap = await readFile(join(outDir, 'sitemap.xml'), 'utf8')
      expect([...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(match => match[1])).toEqual([
        'https://example.com/blog/',
        'https://example.com/blog/about/',
        'https://example.com/blog/posts/',
        'https://example.com/blog/posts/%E4%B8%AD%E6%96%87',
        'https://example.com/blog/posts/404-notes',
        'https://example.com/blog/posts/a&amp;b',
      ])
      expect(await readFile(join(outDir, 'robots.txt'), 'utf8')).toBe(robots)
    }
    finally {
      await rm(outDir, { recursive: true, force: true })
    }
  })

  it('writes lastmod and skips noindex/none pages and canonicals pointing to excluded targets', async () => {
    const outDir = await mkdtemp(join(tmpdir(), 'valaxy-sitemap-'))
    try {
      await writeSitemap(outDir, 'https://example.com/', [
        { route: '/', lastmod: '2024-01-02T00:00:00.000Z' },
        { route: '/page/1', canonical: 'https://example.com/' },
        { route: '/posts/hello', lastmod: '2024-03-04T05:06:07.000Z' },
        { route: '/page/2', lastmod: '2024-05-01T00:00:00.000Z', robots: 'noindex, follow' },
        { route: '/secret', robots: 'NOINDEX' },
        { route: '/none-page', robots: 'none' },
        { route: '/copy-to-noindex', canonical: 'https://example.com/secret' },
        { route: '/copy-to-none', canonical: 'https://example.com/none-page/' },
      ])
      const sitemap = await readFile(join(outDir, 'sitemap.xml'), 'utf8')
      expect(sitemap).toContain('<loc>https://example.com/</loc><lastmod>2024-01-02T00:00:00.000Z</lastmod>')
      expect(sitemap.match(/<loc>https:\/\/example\.com\/<\/loc>/g)).toHaveLength(1)
      expect(sitemap).toContain('<loc>https://example.com/posts/hello</loc><lastmod>2024-03-04T05:06:07.000Z</lastmod>')
      expect(sitemap).not.toContain('/page/1')
      expect(sitemap).not.toContain('/page/2')
      expect(sitemap).not.toContain('/secret')
      expect(sitemap).not.toContain('/none-page')
      expect(sitemap).not.toContain('/copy-to-noindex')
      expect(sitemap).not.toContain('/copy-to-none')
    }
    finally {
      await rm(outDir, { recursive: true, force: true })
    }
  })

  it('writes the sitemap link to the default robots.txt', async () => {
    const outDir = await mkdtemp(join(tmpdir(), 'valaxy-sitemap-'))
    try {
      await writeSitemap(outDir, 'https://example.com/blog/', [{ route: '/' }])
      expect(await readFile(join(outDir, 'robots.txt'), 'utf8')).toContain('Sitemap: https://example.com/blog/sitemap.xml')
    }
    finally {
      await rm(outDir, { recursive: true, force: true })
    }
  })
})
