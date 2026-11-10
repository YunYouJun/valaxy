import { describe, expect, it } from 'vitest'
import { resolveShareImage } from '../packages/valaxy/client/utils/seo'
import { pickShareImage } from '../packages/valaxy/shared/seo'

describe('share image candidates', () => {
  it.each([
    'cover.png',
    'cover.JPG?width=1200#preview',
    'images/cover.png',
    'images/render?width=1200',
    './cover.webp',
    '../images/cover.avif',
    '/images/cover.svg',
    'favicon.svg',
    '//cdn.example.com/cover.png',
    'https://cdn.example.com/render?width=1200#preview',
    'http://cdn.example.com/cover.jpg',
  ])('accepts image resource %s', (src) => {
    expect(pickShareImage([src])).toBe(src)
  })

  it.each([
    '',
    'HelloCover',
    'HelloCover.vue',
    './components/HelloCover.vue',
    'hello-cover',
    'notes.md',
    'HelloCover?image=cover.png',
    'HelloCover#cover.png',
    'https:cover.png',
    'https:/images/cover.png',
    'javascript:alert(1)',
    'JaVaScRiPt:images/cover.png',
    'data:image/png;base64,AAAA',
    'file:///tmp/cover.png',
    'blob:https://example.com/cover.png',
    'ftp://example.com/cover.png',
    'custom+scheme:images/cover.png',
    'https://',
    '//',
    'images\\cover.png',
    'java\nscript:cover.png',
  ])('skips unusable or unsafe candidate %s', (src) => {
    expect(pickShareImage([src, '/fallback.png'])).toBe('/fallback.png')
  })

  it('preserves candidate priority and removes optional Markdown image titles', () => {
    expect(pickShareImage([null, undefined, 'HelloCover', ' images/cover.png "Title" ', '/fallback.png']))
      .toBe('images/cover.png')
    expect(pickShareImage(['<cover.png?width=1200#preview> "Title"']))
      .toBe('cover.png?width=1200#preview')
    expect(pickShareImage([null, undefined, 'HelloCover'])).toBeUndefined()
  })
})

describe('share image URL resolution', () => {
  it.each([
    ['cover.png', 'https://example.com/posts/cover.png'],
    ['images/cover.png', 'https://example.com/posts/images/cover.png'],
    ['./cover.png?width=1200&height=630#preview', 'https://example.com/posts/cover.png?width=1200&height=630#preview'],
    ['../images/cover.png?token=a%2Fb#preview', 'https://example.com/images/cover.png?token=a%2Fb#preview'],
    ['/images/cover.png?width=1200#preview', 'https://example.com/images/cover.png?width=1200#preview'],
  ])('resolves %s with its query and fragment intact', (src, expected) => {
    expect(resolveShareImage('https://example.com/', '/posts/hello', src)).toBe(expected)
  })

  it('respects directory routes and deployment subpaths', () => {
    expect(resolveShareImage('https://example.com/blog/', '/posts/hello/', 'cover.png?width=1200#preview'))
      .toBe('https://example.com/blog/posts/hello/cover.png?width=1200#preview')
    expect(resolveShareImage('https://example.com/blog', 'posts/hello', 'images/cover.png?width=1200#preview'))
      .toBe('https://example.com/blog/posts/images/cover.png?width=1200#preview')
    expect(resolveShareImage('https://example.com/blog/', '/posts/hello', '/images/cover.png?width=1200#preview'))
      .toBe('https://example.com/blog/images/cover.png?width=1200#preview')
  })

  it.each(['https://cdn.example.com/cover.png?q=1#preview', '//cdn.example.com/cover.png?q=1#preview'])('keeps external URL %s intact', (src) => {
    expect(resolveShareImage('https://example.com/blog/', '/posts/hello', src)).toBe(src)
  })

  it('retains the source when no canonical site URL is configured', () => {
    expect(resolveShareImage('', '/posts/hello', 'cover.png?width=1200#preview'))
      .toBe('cover.png?width=1200#preview')
  })
})
