import { mkdtemp, readFile, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { renderPage, renderPreloadLinks, routeToFileName, serializeState } from '../../packages/valaxy/node/build/render'

it('injects shared portal content inside its dedicated container', async () => {
  const outDir = await mkdtemp(join(tmpdir(), 'valaxy-portals-'))
  const content = '<!--teleport start anchor--><div role="dialog">$&</div><!--teleport anchor-->'
  const options = {
    route: '/',
    template: '<html><head></head><body><div id="app"></div><div id="valaxy-teleports"></div></body></html>',
    outDir,
    ssrManifest: {},
    render: async () => ({
      html: '<main>App</main>',
      head: undefined,
      initialState: {},
      teleports: { '#valaxy-teleports': content },
    }),
  }
  try {
    await renderPage(options)
    const html = await readFile(join(outDir, 'index.html'), 'utf-8')
    expect(html).toContain(`<div id="app"><main>App</main></div><div id="valaxy-teleports">${content}</div>`)
    await expect(renderPage({ ...options, template: '<body><div id="app"></div></body>' }))
      .rejects
      .toThrow('Missing #valaxy-teleports container')
  }
  finally {
    await rm(outDir, { recursive: true, force: true })
  }
})

it('places body teleport anchors before the app for disabled teleport hydration', async () => {
  const outDir = await mkdtemp(join(tmpdir(), 'valaxy-teleport-'))
  const anchors = '<!--teleport start anchor--><!--teleport anchor-->'
  try {
    await renderPage({
      route: '/',
      template: '<html><head></head><body class="test"><div id="app"></div></body></html>',
      outDir,
      ssrManifest: {},
      render: async () => ({
        html: '<main>Release</main>',
        head: undefined,
        initialState: {},
        teleports: { body: anchors },
      }),
    })
    const html = await readFile(join(outDir, 'index.html'), 'utf-8')
    expect(html).toContain(`<body class="test">${anchors}<div id="app"><main>Release</main></div>`)
  }
  finally {
    await rm(outDir, { recursive: true, force: true })
  }
})

describe('routeToFileName', () => {
  it('converts root / to index.html', () => {
    expect(routeToFileName('/')).toBe('index.html')
  })

  it('converts /about to about.html', () => {
    expect(routeToFileName('/about')).toBe('about.html')
  })

  it('converts trailing-slash path to nested index.html', () => {
    expect(routeToFileName('/posts/')).toBe('posts/index.html')
  })

  it('preserves explicit .html extension', () => {
    expect(routeToFileName('/x.html')).toBe('x.html')
  })

  it('handles deeply nested paths', () => {
    expect(routeToFileName('/a/b/c')).toBe('a/b/c.html')
  })

  it('handles deeply nested paths with trailing slash', () => {
    expect(routeToFileName('/a/b/c/')).toBe('a/b/c/index.html')
  })
})

describe('serializeState', () => {
  it('returns empty string for empty state', () => {
    expect(serializeState({})).toBe('')
  })

  it('returns empty string for null-ish state', () => {
    expect(serializeState(null as any)).toBe('')
  })

  it('wraps serialized state in a script tag', () => {
    const result = serializeState({ count: 1 })
    expect(result).toContain('<script>')
    expect(result).toContain('window.__INITIAL_STATE__=')
    expect(result).toContain('</script>')
  })

  it('escapes < > & and single quotes', () => {
    const result = serializeState({ html: '<b>a&b</b>' })
    expect(result).not.toContain('<b>')
    expect(result).toContain('\\u003c')
    expect(result).toContain('\\u003e')
    expect(result).toContain('\\u0026')
  })

  it('escapes single quotes in state values', () => {
    const result = serializeState({ title: 'it\'s O\'Reilly' })
    expect(result).toContain('\\u0027')
    // \u0027 inside a single-quoted JS string is a valid escape, not a delimiter break
    expect(result).toContain('<script>')
    expect(result).toContain('</script>')
  })

  it('escapes U+2028 and U+2029 line separators', () => {
    const result = serializeState({ text: 'a\u2028b\u2029c' })
    expect(result).toContain('\\u2028')
    expect(result).toContain('\\u2029')
  })
})

describe('renderPreloadLinks', () => {
  it('returns empty string for undefined modules', () => {
    expect(renderPreloadLinks(undefined, {})).toBe('')
  })

  it('returns empty string for empty modules set', () => {
    expect(renderPreloadLinks(new Set(), {})).toBe('')
  })

  it('returns empty string when no manifest entries match', () => {
    expect(renderPreloadLinks(new Set(['unknown']), {})).toBe('')
  })

  it('generates modulepreload for .js files', () => {
    const manifest = { 'mod-a': ['/assets/chunk.js'] }
    const result = renderPreloadLinks(new Set(['mod-a']), manifest)
    expect(result).toContain('<link rel="modulepreload" crossorigin href="/assets/chunk.js">')
  })

  it('generates modulepreload for .mjs files', () => {
    const manifest = { 'mod-a': ['/assets/chunk.mjs'] }
    const result = renderPreloadLinks(new Set(['mod-a']), manifest)
    expect(result).toContain('<link rel="modulepreload" crossorigin href="/assets/chunk.mjs">')
  })

  it('generates stylesheet link for .css files', () => {
    const manifest = { 'mod-a': ['/assets/style.css'] }
    const result = renderPreloadLinks(new Set(['mod-a']), manifest)
    expect(result).toContain('<link rel="stylesheet" href="/assets/style.css">')
  })

  it('generates font preload for .woff2 files', () => {
    const manifest = { 'mod-a': ['/assets/font.woff2'] }
    const result = renderPreloadLinks(new Set(['mod-a']), manifest)
    expect(result).toContain('<link rel="preload" href="/assets/font.woff2" as="font" type="font/woff2" crossorigin>')
  })

  it('generates font preload for .woff files', () => {
    const manifest = { 'mod-a': ['/assets/font.woff'] }
    const result = renderPreloadLinks(new Set(['mod-a']), manifest)
    expect(result).toContain('type="font/woff"')
  })

  it('generates image preload for image extensions', () => {
    for (const ext of ['gif', 'jpg', 'jpeg', 'png', 'webp', 'svg', 'avif']) {
      const manifest = { m: [`/img/pic.${ext}`] }
      const result = renderPreloadLinks(new Set(['m']), manifest)
      expect(result).toContain(`<link rel="preload" href="/img/pic.${ext}" as="image">`)
    }
  })

  it('deduplicates files across modules', () => {
    const manifest = {
      'mod-a': ['/assets/shared.js'],
      'mod-b': ['/assets/shared.js', '/assets/only-b.js'],
    }
    const result = renderPreloadLinks(new Set(['mod-a', 'mod-b']), manifest)
    // shared.js should appear exactly once
    const matches = result.match(/shared\.js/g)
    expect(matches).toHaveLength(1)
    expect(result).toContain('only-b.js')
  })
})
