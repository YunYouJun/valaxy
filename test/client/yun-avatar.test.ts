import { afterEach, describe, expect, it, vi } from 'vitest'
import { createSSRApp, ref } from 'vue'
import { renderToString } from 'vue/server-renderer'
import YunAuthorAvatar from '../../packages/valaxy-theme-yun/components/author/YunAuthorAvatar.vue'
import YunLinkItem from '../../packages/valaxy-theme-yun/components/YunLinkItem.vue'

const siteConfig = ref({ author: { avatar: '', status: {} } })

vi.mock('valaxy', async () => {
  const { withBase } = await import('../../packages/valaxy/client/utils/path')
  return { useSiteConfig: () => siteConfig, withBase }
})
vi.mock('../../packages/valaxy-theme-yun/utils', () => ({ onImgError: vi.fn() }))

afterEach(() => {
  vi.unstubAllEnvs()
})

async function renderAuthor(avatar: string) {
  siteConfig.value.author.avatar = avatar
  return renderToString(createSSRApp(YunAuthorAvatar))
}

async function renderLink(avatar: string) {
  return renderToString(createSSRApp(YunLinkItem, {
    link: { avatar, name: 'Example', url: 'https://example.com/' },
  }))
}

describe.each([
  { name: 'author', render: renderAuthor },
  { name: 'link', render: renderLink },
])('yun $name avatar', ({ render }) => {
  it.each([
    ['/', '/favicon.svg', '/favicon.svg'],
    ['/repo/', '/favicon.svg', '/repo/favicon.svg'],
    ['/repo/', 'https://example.com/avatar.svg', 'https://example.com/avatar.svg'],
    ['/repo/', '//cdn.example.com/avatar.svg', '//cdn.example.com/avatar.svg'],
    ['/repo/', './avatar.svg', './avatar.svg'],
  ])('renders %s + %s as %s', async (base, avatar, expected) => {
    vi.stubEnv('BASE_URL', base)
    const html = await render(avatar)
    expect(html.match(/\bsrc="([^"]*)"/)?.[1]).toBe(expected)
  })
})
