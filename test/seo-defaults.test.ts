import { defineArticle, defineBreadcrumb, definePerson, defineWebPage, defineWebSite, useSchemaOrg } from '@unhead/schema-org/vue'
import { createHead } from '@unhead/vue/server'
import { compileTemplate } from '@vue/compiler-sfc'
import MarkdownIt from 'markdown-it'
import { describe, expect, it } from 'vitest'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'
import YunBannerCharContainer from '../packages/valaxy-theme-yun/components/ui/YunBannerCharContainer.vue'
import { readRenderedHead } from '../packages/valaxy/node/build/render'
import { imagePlugin } from '../packages/valaxy/node/plugins/markdown/plugins/image'
import { buildBreadcrumbItems, feedFileNames, imageAltFromSrc, isGeneratedPaginationPath, isNoindexPaginationPath, schemaDate, schemaNodeId } from '../packages/valaxy/shared/seo'

describe('seo defaults', () => {
  it('builds stable schema ids and breadcrumb URLs without inventing missing parents', () => {
    expect(schemaNodeId('https://example.com', 'identity')).toBe('https://example.com/#identity')
    expect(schemaNodeId('https://example.com/blog', 'identity')).toBe('https://example.com/blog/#identity')
    expect(schemaNodeId('https://example.com/blog/', 'identity')).toBe('https://example.com/blog/#identity')
    expect(schemaNodeId('/', 'identity')).toBeUndefined()
    expect(schemaDate('2024-01-02')).toBe('2024-01-02T00:00:00.000Z')
    expect(schemaDate('not-a-date')).toBeUndefined()
    expect(schemaDate('   ')).toBeUndefined()
    expect(schemaDate(false)).toBeUndefined()
    expect(schemaDate(true)).toBeUndefined()
    expect(schemaDate(Number.NaN)).toBeUndefined()
    expect(schemaDate(Number.POSITIVE_INFINITY)).toBeUndefined()
    expect(feedFileNames()).toEqual({ atom: 'atom.xml', json: 'feed.json', rss: 'feed.xml' })
    expect(feedFileNames('blog')).toEqual({ atom: 'blog.atom', json: 'blog.json', rss: 'blog.xml' })

    expect(isGeneratedPaginationPath('/page/0')).toBe(false)
    expect(isGeneratedPaginationPath('/page/1')).toBe(true)
    expect(isGeneratedPaginationPath('/page/2')).toBe(true)
    expect(isNoindexPaginationPath('/page/0')).toBe(false)
    expect(isNoindexPaginationPath('/page/1')).toBe(false)
    expect(isNoindexPaginationPath('/page/2')).toBe(true)
    expect(isNoindexPaginationPath('/page/10')).toBe(true)

    expect(buildBreadcrumbItems({
      siteUrl: 'https://example.com/blog/',
      siteTitle: 'Example',
      pageTitle: 'Hello',
      path: '/posts/hello',
    })).toEqual([
      { name: 'Example', item: 'https://example.com/blog/' },
      { name: 'Hello', item: 'https://example.com/blog/posts/hello' },
    ])
    expect(buildBreadcrumbItems({
      siteUrl: 'https://example.com/blog/',
      siteTitle: 'Example',
      pageTitle: 'Styles',
      path: '/guide/custom/styles',
      resolveAncestor: path => path === '/guide' ? { path: '/guide/', name: 'Guide' } : undefined,
    })).toEqual([
      { name: 'Example', item: 'https://example.com/blog/' },
      { name: 'Guide', item: 'https://example.com/blog/guide/' },
      { name: 'Styles', item: 'https://example.com/blog/guide/custom/styles' },
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

  it('reads lastmod and robots from rendered head across graph, array, and scoped entities', () => {
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

    const arrayHtml = `<!DOCTYPE html><html><head></head><body>
      <script type="application/ld+json">[{"@type":"Article","dateModified":"2024-02-03"}]</script>
    </body></html>`
    expect(readRenderedHead(arrayHtml).lastmod).toBe('2024-02-03T00:00:00.000Z')

    const scopedHtml = `<!DOCTYPE html><html><head>
      <link rel="canonical" href="https://example.com/posts/hello">
    </head><body>
      <script type="application/ld+json">{
        "@context":"https://schema.org",
        "@graph":[
          {"@type":"WebPage","url":"https://example.com/posts/hello","dateModified":"2024-05-06T00:00:00.000Z"},
          {"@type":"Article","url":"https://example.com/posts/other","dateModified":"2026-09-01T00:00:00.000Z"},
          {"@type":"Event","dateModified":"2027-01-01T00:00:00.000Z"}
        ]
      }</script>
    </body></html>`
    expect(readRenderedHead(scopedHtml).lastmod).toBe('2024-05-06T00:00:00.000Z')

    const idScopedHtml = `<!DOCTYPE html><html><head>
      <link rel="canonical" href="https://example.com/posts/current">
    </head><body>
      <script type="application/ld+json">{
        "@context":"https://schema.org",
        "@graph":[
          {"@id":"https://example.com/posts/current#article","@type":"Article","dateModified":"2024-03-04T00:00:00.000Z"},
          {"@id":"https://example.com/posts/other#article","@type":"Article","dateModified":"2026-09-01T00:00:00.000Z"}
        ]
      }</script>
    </body></html>`
    expect(readRenderedHead(idScopedHtml).lastmod).toBe('2024-03-04T00:00:00.000Z')

    const mainEntityInlineHtml = `<!DOCTYPE html><html><head>
      <link rel="canonical" href="https://example.com/posts/current">
    </head><body>
      <script type="application/ld+json">{
        "@context":"https://schema.org",
        "@graph":[
          {"@type":"Article","mainEntityOfPage":{"@id":"https://example.com/posts/current#webpage"},"dateModified":"2024-04-05T00:00:00.000Z"},
          {"@type":"Article","mainEntityOfPage":{"@id":"https://example.com/posts/other#webpage"},"dateModified":"2026-09-01T00:00:00.000Z"}
        ]
      }</script>
    </body></html>`
    expect(readRenderedHead(mainEntityInlineHtml).lastmod).toBe('2024-04-05T00:00:00.000Z')

    const dereferencedMainEntityHtml = `<!DOCTYPE html><html><head>
      <link rel="canonical" href="https://example.com/posts/current">
    </head><body>
      <script type="application/ld+json">{
        "@context":"https://schema.org",
        "@graph":[
          {"@id":"https://example.com/#webpage","@type":"WebPage","url":"https://example.com/posts/current","datePublished":"2024-01-01T00:00:00.000Z"},
          {"@id":"https://example.com/#article","@type":"BlogPosting","mainEntityOfPage":{"@id":"https://example.com/#webpage"},"dateModified":"2024-06-07T00:00:00.000Z"},
          {"@id":"_:other-page","@type":"WebPage","url":"https://example.com/posts/other"},
          {"@type":"Article","mainEntityOfPage":{"@id":"_:other-page"},"dateModified":"2026-09-01T00:00:00.000Z"}
        ]
      }</script>
    </body></html>`
    expect(readRenderedHead(dereferencedMainEntityHtml).lastmod).toBe('2024-06-07T00:00:00.000Z')

    const relativeUrlHtml = `<!DOCTYPE html><html><head>
      <link rel="canonical" href="https://example.com/posts/current">
    </head><body>
      <script type="application/ld+json">{
        "@context":"https://schema.org",
        "@graph":[
          {"@type":"WebPage","url":"/posts/current","dateModified":"2024-07-08T00:00:00.000Z"},
          {"@id":"/posts/other#article","@type":"Article","dateModified":"2026-09-01T00:00:00.000Z"}
        ]
      }</script>
    </body></html>`
    expect(readRenderedHead(relativeUrlHtml).lastmod).toBe('2024-07-08T00:00:00.000Z')

    const baseHrefRelativeHtml = `<!DOCTYPE html><html><head>
      <base href="/blog/">
      <link rel="canonical" href="https://example.com/blog/posts/current">
    </head><body>
      <script type="application/ld+json">{
        "@context":"https://schema.org",
        "@graph":[
          {"@type":"WebPage","url":"posts/current","dateModified":"2024-08-09T00:00:00.000Z"},
          {"@id":"posts/other#article","@type":"Article","dateModified":"2026-09-01T00:00:00.000Z"}
        ]
      }</script>
    </body></html>`
    expect(readRenderedHead(baseHrefRelativeHtml).lastmod).toBe('2024-08-09T00:00:00.000Z')

    const cyclicRefHtml = `<!DOCTYPE html><html><head>
      <link rel="canonical" href="https://example.com/posts/current">
    </head><body>
      <script type="application/ld+json">{
        "@context":"https://schema.org",
        "@graph":[
          {"@id":"#node-a","@type":"WebPage","mainEntityOfPage":{"@id":"#node-b"},"dateModified":"2026-09-01T00:00:00.000Z"},
          {"@id":"#node-b","@type":"Article","mainEntityOfPage":{"@id":"#node-a"},"dateModified":"2026-10-01T00:00:00.000Z"}
        ]
      }</script>
    </body></html>`
    expect(readRenderedHead(cyclicRefHtml).lastmod).toBe('2026-10-01T00:00:00.000Z')
  })

  it('fills empty markdown alts safely without breaking Vue templates or data-alt', () => {
    expect(imageAltFromSrc('./my%20photo.png?size=2#view')).toBe('my photo')
    expect(imageAltFromSrc('./valaxy-logo.png')).toBe('valaxy logo')
    expect(imageAltFromSrc('./a1b2c3d4e5f6.png')).toBeUndefined()
    expect(imageAltFromSrc('./12.png')).toBeUndefined()
    expect(imageAltFromSrc('./image.png')).toBeUndefined()
    expect(imageAltFromSrc('./photo_1.jpg')).toBeUndefined()
    expect(imageAltFromSrc('./Screenshot 2024-05-01 at 10.20.30.png')).toBeUndefined()
    expect(imageAltFromSrc('./Pasted image 20240501123456.png')).toBeUndefined()
    expect(imageAltFromSrc('./微信图片_20240501123456.jpg')).toBeUndefined()
    expect(imageAltFromSrc('https://example.com')).toBeUndefined()
    expect(imageAltFromSrc('https://example.com/')).toBeUndefined()
    expect(imageAltFromSrc('data:image/png;base64,iVBORw0KGgo=')).toBeUndefined()
    expect(imageAltFromSrc('data:image/svg+xml;utf8,<svg/>')).toBeUndefined()

    const defaultMd = new MarkdownIt()
    imagePlugin(defaultMd as never)
    expect(defaultMd.render('![](./my-photo.png)')).toContain('alt=""')

    const md = new MarkdownIt()
    imagePlugin(md as never, { altFallback: true })
    expect(md.render('![](./my-photo.png)')).toContain('alt="my photo"')
    expect(md.render('![Already described](./my-photo.png)')).toContain('alt="Already described"')
    expect(md.render('![](./a1b2c3d4e5f6.png)')).toContain('alt=""')
    expect(md.render('![](./Screenshot%202024-05-01%20at%2010.20.30.png)')).toContain('alt=""')
    expect(md.render('![](data:image/png;base64,iVBORw0KGgo=)')).toContain('alt=""')

    const dollarAmpHtml = md.render('![](https://x.com/my%24%26.png)')
    expect(dollarAmpHtml).toContain('alt="my$&amp;"')
    expect(compileTemplate({ source: dollarAmpHtml, filename: 'dollar-amp.md', id: 'dollar-amp' }).errors).toEqual([])

    const dollarTickHtml = md.render('![](https://x.com/my%24%60.png)')
    expect(dollarTickHtml).toContain('alt="my$`"')
    expect(compileTemplate({ source: dollarTickHtml, filename: 'dollar-tick.md', id: 'dollar-tick' }).errors).toEqual([])

    const attrMd = new MarkdownIt()
    attrMd.core.ruler.after('inline', 'test-data-alt', (state) => {
      for (const block of state.tokens) {
        for (const child of block.children || []) {
          if (child.type === 'image')
            child.attrSet('data-alt', '')
        }
      }
    })
    imagePlugin(attrMd as never, { altFallback: true })
    const preserved = attrMd.render('![Author text](./test.jpg)')
    expect(preserved).toContain('alt="Author text"')
    expect(preserved).toContain('data-alt=""')
    const filled = attrMd.render('![](./test.jpg)')
    expect(filled).toContain('alt="test"')
    expect(filled).toContain('data-alt=""')

    const plain = new MarkdownIt()
    imagePlugin(plain as never, { altFallback: false })
    expect(plain.render('![](./my-photo.png)')).toContain('alt=""')
  })

  it('links Unhead person, website, article, and breadcrumbs under normalized hosts', () => {
    const head = createHead()
    const host = 'https://example.com/'
    const identityId = schemaNodeId('https://example.com', 'identity')!
    const websiteId = schemaNodeId('https://example.com', 'website')!
    head.push({ templateParams: { schemaOrg: { host, path: '/posts/hello', inLanguage: 'en' } } })
    useSchemaOrg([
      definePerson({ '@id': identityId, 'name': 'Author' }),
      defineWebSite({ '@id': websiteId, 'name': 'Site' }),
      defineWebPage({ name: 'Hello', url: 'https://example.com/posts/hello' }),
      defineArticle({ '@type': 'BlogPosting', 'headline': 'Hello', 'author': { '@id': identityId } }),
      defineBreadcrumb({
        itemListElement: [
          { name: 'Site', item: 'https://example.com/', position: 1 },
          { name: 'Hello', item: 'https://example.com/posts/hello', position: 2 },
        ],
      }),
    ], { head })

    const { bodyTags } = head.render()
    const json = bodyTags.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)?.[1]
    const graph = JSON.parse(json!)['@graph'] as Record<string, any>[]
    const person = graph.find(node => [node['@type']].flat().includes('Person'))
    const website = graph.find(node => [node['@type']].flat().includes('WebSite'))
    const article = graph.find(node => [node['@type']].flat().includes('BlogPosting'))
    const webpage = graph.find(node => [node['@type']].flat().includes('WebPage'))
    expect(person?.['@id']).toBe('https://example.com/#identity')
    expect(website?.publisher?.['@id']).toBe(person?.['@id'])
    expect(article?.author?.['@id']).toBe(person?.['@id'])
    expect(webpage?.['@id']).toBe('https://example.com/posts/hello#webpage')
    expect(article?.['@id']).toBe('https://example.com/posts/hello#article')
    expect(graph.some(node => [node['@type']].flat().includes('BreadcrumbList'))).toBe(true)
  })

  it('keeps CollectionPage URL, language, and lastmod intact when schemaOrg path and inLanguage are provided', () => {
    const head = createHead()
    head.push({
      link: [{ rel: 'canonical', href: 'https://example.com/blog/archives/' }],
      templateParams: {
        schemaOrg: {
          host: 'https://example.com/blog/',
          path: '/archives/',
          inLanguage: 'zh-CN',
        },
      },
    })
    useSchemaOrg([
      definePerson({ '@id': 'https://example.com/blog/#identity', 'name': 'Author' }),
      defineWebSite({ '@id': 'https://example.com/blog/#website', 'name': 'Site' }),
      defineWebPage({
        name: 'Archives',
        url: 'https://example.com/blog/archives/',
        dateModified: '2024-02-01T00:00:00.000Z',
      }),
      defineWebPage({
        '@type': 'CollectionPage',
      }),
    ], { head })

    const { headTags, bodyTags } = head.render()
    const json = bodyTags.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/)?.[1]
    const graph = JSON.parse(json!)['@graph'] as Record<string, any>[]
    const website = graph.find(node => [node['@type']].flat().includes('WebSite'))
    const webpage = graph.find(node => [node['@type']].flat().includes('CollectionPage'))
    expect(website?.inLanguage).toBe('zh-CN')
    expect(webpage?.['@id']).toBe('https://example.com/blog/archives/#webpage')
    expect(webpage?.url).toBe('https://example.com/blog/archives/')
    expect(readRenderedHead(`<!DOCTYPE html><html><head>${headTags}</head><body>${bodyTags}</body></html>`).lastmod)
      .toBe('2024-02-01T00:00:00.000Z')
  })

  it('renders Strato banner heading with phrasing spans, aria-label, and fallback title', async () => {
    const html = await renderToString(createSSRApp(YunBannerCharContainer, {
      title: '云游',
      chars: [2, 2],
      heading: true,
    }))
    expect(html).toContain('<h1')
    expect(html).toContain('aria-label="云游"')
    expect(html).toContain('<span class="char-box" aria-hidden="true">')
    expect(html).not.toContain('<div')

    const fallbackHtml = await renderToString(createSSRApp(YunBannerCharContainer, {
      title: '',
      chars: [],
      heading: true,
      fallbackTitle: 'Valaxy Site',
    }))
    expect(fallbackHtml).toContain('<h1')
    expect(fallbackHtml).toContain('aria-label="Valaxy Site"')
  })
})
