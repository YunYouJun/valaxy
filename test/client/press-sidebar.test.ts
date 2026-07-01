import { describe, expect, it } from 'vitest'
import { containsActiveLink, isActive } from '../../packages/valaxy-theme-press/composables/sidebar'
import { getSidebar } from '../../packages/valaxy-theme-press/utils/sidebar'

describe('valaxy-theme-press sidebar active matching', () => {
  it('matches paths with or without a leading slash', () => {
    expect(isActive('/themes/press/sidebar-nav', '/themes/press/sidebar-nav')).toBe(true)
    expect(isActive('themes/press/sidebar-nav', '/themes/press/sidebar-nav')).toBe(true)
  })

  it('detects active links in nested sidebar items from route.path', () => {
    expect(containsActiveLink('/themes/press/sidebar-nav', [
      {
        text: 'Theme Press',
        items: [
          { text: 'Overview', link: '/themes/press' },
          { text: 'Navigation And Sidebar', link: '/themes/press/sidebar-nav' },
        ],
      },
    ])).toBe(true)
  })
})

describe('valaxy-theme-press sidebar resolving', () => {
  it('uses the most specific matched sidebar section', () => {
    const sidebar = {
      '/themes/press': [{ text: 'Theme Press', items: [{ text: 'Search', link: '/themes/press/search-i18n' }] }],
      '/themes/': [{ text: 'Themes', items: [{ text: 'Gallery', link: '/themes/gallery' }] }],
      '/': [{ text: 'Guide', link: '/guide/getting-started' }],
    }

    expect(getSidebar(sidebar, '/themes/press/search-i18n')).toEqual([
      { text: 'Theme Press', items: [{ text: 'Search', link: '/themes/press/search-i18n' }] },
    ])

    expect(getSidebar(sidebar, '/themes/gallery')).toEqual([
      { text: 'Themes', items: [{ text: 'Gallery', link: '/themes/gallery' }] },
    ])
  })
})
