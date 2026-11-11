import { describe, expect, it } from 'vitest'
import { resolveSocialSameAs } from '../../packages/valaxy/client/utils/seo'

const site = 'https://example.com/blog/'
const links = (...values: string[]) => values.map(link => ({ link }))

describe('social identity URLs', () => {
  it('normalizes HTTP(S) and site-relative profiles, preserving query and fragment identity', () => {
    expect(resolveSocialSameAs(site, links(
      ' HTTPS://SOCIAL.EXAMPLE:443/@author ',
      'https://social.example/@author',
      '//social.example/@other',
      '/about',
      '/blog/about',
      './about',
      '../profile',
      'https://music.example/#/user/home?id=123',
      'https://social.example/profile.php?id=123&lang=en#me',
      'http://author.example',
    ))).toEqual([
      'https://social.example/@author',
      'https://social.example/@other',
      'https://example.com/about',
      'https://example.com/blog/about',
      'https://example.com/profile',
      'https://music.example/#/user/home?id=123',
      'https://social.example/profile.php?id=123&lang=en#me',
      'http://author.example/',
    ])
  })

  it('rejects empty, non-web, malformed, credentialed and fragment-only links', () => {
    expect(resolveSocialSameAs(site, links(
      '',
      '  ',
      '#',
      '#profile',
      '?id=123',
      'mailto:me@example.com',
      'tel:123',
      'javascript:alert(1)',
      'data:text/html,hello',
      'ftp://example.com/me',
      'https:example.com/me',
      'https:/example.com/me',
      'https:///example.com/me',
      '///example.com/me',
      'https://',
      '//',
      'https://user:password@example.com/',
      'https://example.com/\nprofile',
      '\\profile',
    ))).toEqual([])
    expect(resolveSocialSameAs('/', links('/about', 'https://author.example'))).toEqual(['https://author.example/'])
  })

  it('filters feed files and the configured site feeds without guessing from account names', () => {
    expect(resolveSocialSameAs(site, links(
      '/atom.xml',
      './feed.xml?view=full#feed',
      '/feed.json',
      'https://feeds.example/rss.xml',
      'https://feeds.example/my.atom',
      'https://feeds.example/my.rss',
      '/%61tom.xml',
      '/blog/custom.xml?all=1',
      './custom.json',
      '/blog/custom.atom',
      'https://github.com/rss',
      'https://social.example/feed',
      'https://rss.example/@author',
      'https://other.example/custom.json',
    ), 'custom')).toEqual([
      'https://github.com/rss',
      'https://social.example/feed',
      'https://rss.example/@author',
      'https://other.example/custom.json',
    ])
  })

  it('allows navigation-only opt-outs without mutating the social list', () => {
    const social = [
      { link: '/subscribe', sameAs: false },
      { link: 'https://chat.example/invite', sameAs: false },
      { link: 'https://author.example/', sameAs: true },
    ]
    const before = structuredClone(social)
    expect(resolveSocialSameAs(site, social)).toEqual(['https://author.example/'])
    expect(social).toEqual(before)
  })
})
