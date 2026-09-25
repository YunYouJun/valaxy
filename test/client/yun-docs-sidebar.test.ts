import type { YunTheme } from '../../packages/valaxy-theme-yun/types'
import { describe, expect, it } from 'vitest'
import {
  containsYunDocsSidebarActiveLink,
  hasYunDocsSidebarNavigation,
  isYunDocsSidebarLinkActive,
  resolveYunDocsSidebar,
} from '../../packages/valaxy-theme-yun/utils/sidebar'

describe('valaxy-theme-yun docs sidebar', () => {
  it('uses the longest matching path prefix', () => {
    const sidebar: YunTheme.Sidebar = {
      '/guide/advanced/': [{ text: 'Advanced', link: '/guide/advanced/' }],
      '/guide/': [{ text: 'Guide', link: '/guide/' }],
      '/': [{ text: 'Home', link: '/' }],
    }

    expect(resolveYunDocsSidebar(sidebar, '/guide/advanced/deploy')).toEqual([
      { text: 'Advanced', link: '/guide/advanced/' },
    ])
  })

  it('applies a shared base to nested links without mutating config', () => {
    const items: YunTheme.SidebarItem[] = [
      {
        text: 'Guide',
        items: [
          { text: 'Start', link: 'start' },
          { text: 'External', link: 'https://valaxy.site' },
        ],
      },
    ]
    const sidebar: YunTheme.Sidebar = {
      '/guide/': { base: '/guide/', items },
    }

    expect(resolveYunDocsSidebar(sidebar, '/guide/start')).toEqual([
      {
        text: 'Guide',
        items: [
          { text: 'Start', link: '/guide/start' },
          { text: 'External', link: 'https://valaxy.site' },
        ],
      },
    ])
    expect(items[0].items?.[0].link).toBe('start')
  })

  it('normalizes document extensions and finds active descendants', () => {
    const item: YunTheme.SidebarItem = {
      text: 'Guide',
      items: [{ text: 'Start', link: '/guide/start.md' }],
    }

    expect(isYunDocsSidebarLinkActive('/guide/start', '/guide/start.md')).toBe(true)
    expect(containsYunDocsSidebarActiveLink('/guide/start', item)).toBe(true)
  })

  it('hides a sidebar containing only the current page and keeps other destinations', () => {
    const sidebar: YunTheme.Sidebar = {
      '/guide/': [{ text: 'Guide', items: [{ text: 'Overview', link: '/guide/' }] }],
    }
    const items = resolveYunDocsSidebar(sidebar, '/guide/')

    expect(hasYunDocsSidebarNavigation(items, '/guide/')).toBe(false)
    expect(hasYunDocsSidebarNavigation(items, '/guide/next')).toBe(true)
    expect(hasYunDocsSidebarNavigation([
      ...items,
      { text: 'Next', link: '/guide/next' },
    ], '/guide/')).toBe(true)
  })
})
