import MarkdownIt from 'markdown-it'
import { describe, expect, it } from 'vitest'
import { readRenderedHead } from '../packages/valaxy/node/build/render'
import { imagePlugin } from '../packages/valaxy/node/plugins/markdown/plugins/image'
import { buildBreadcrumbItems, feedFileNames, imageAltFromSrc, schemaDate, schemaNodeId } from '../packages/valaxy/shared/seo'

describe('seo defaults', () => {
  it('builds stable schema ids and breadcrumb URLs', () => {
    expect(schemaNodeId('https://example.com/blog/', 'identity')).toBe('https://example.com/blog/#identity')
    expect(schemaNodeId('/', 'identity')).toBeUndefined()
    expect(schemaDate('2024-01-02')).toBe('2024-01-02T00:00:00.000Z')
    expect(schemaDate('not-a-date')).toBeUndefined()
    expect(feedFileNames()).toEqual({ atom: 'atom.xml', json: 'feed.json', rss: 'feed.xml' })
    expect(feedFileNames('blog')).toEqual({ atom: 'blog.atom', json: 'blog.json', rss: 'blog.xml' })

    expect(buildBreadcrumbItems({
      siteUrl: 'https://example.com/blog/',
      siteTitle: 'Example',
      pageTitle: 'Hello',
      path: '/posts/hello',
    })).toEqual([
      { name: 'Example', item: 'https://example.com/blog/' },
      { name: 'Posts', item: 'https://example.com/blog/posts/' },
      { name: 'Hello', item: 'https://example.com/blog/posts/hello' },
    ])
    expect(buildBreadcrumbItems({
      siteUrl: 'https://example.com/',
      siteTitle: 'Example',
      pageTitle: 'Example',
      path: '/',
    })).toBeUndefined()
    expect(buildBreadcrumbItems({
      siteUrl: 'https://example.com/',
      siteTitle: 'Example',
      pageTitle: 'Page 2',
      path: '/page/2/',
    })).toBeUndefined()
  })

  it('reads lastmod and robots from rendered head', () => {
    const html = `<!DOCTYPE html><html><head>
      <link rel="canonical" href="https://example.com/posts/hello">
      <meta name="robots" content="noindex, follow">
      <script type="application/ld+json">{"@context":"https://schema.org","@graph":[
        {"@type":"WebPage","datePublished":"2020-01-01T00:00:00.000Z","dateModified":"2024-05-06T07:08:09.000Z"},
        {"@type":"BlogPosting","datePublished":"2024-01-02T00:00:00.000Z"}
      ]}</script>
    </head><body>
      <script type="application/ld+json">{"@type":"Article","dateModified":"2024-08-09T00:00:00.000Z"}</script>
    </body></html>`
    expect(readRenderedHead(html)).toMatchObject({
      canonical: 'https://example.com/posts/hello',
      robots: 'noindex, follow',
      lastmod: '2024-08-09T00:00:00.000Z',
    })
  })

  it('fills empty markdown alts from readable filenames', () => {
    expect(imageAltFromSrc('./my%20photo.png?size=2#view')).toBe('my photo')
    expect(imageAltFromSrc('./a1b2c3d4e5f6.png')).toBeUndefined()
    expect(imageAltFromSrc('./12.png')).toBeUndefined()

    const md = new MarkdownIt()
    imagePlugin(md as never)
    expect(md.render('![](./my-photo.png)')).toContain('alt="my photo"')
    expect(md.render('![Already described](./my-photo.png)')).toContain('alt="Already described"')
    expect(md.render('![](./a1b2c3d4e5f6.png)')).toContain('alt=""')

    const plain = new MarkdownIt()
    imagePlugin(plain as never, { altFallback: false })
    expect(plain.render('![](./my-photo.png)')).toContain('alt=""')
  })
})
