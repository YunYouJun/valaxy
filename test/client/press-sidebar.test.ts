import { describe, expect, it } from 'vitest'
import { containsActiveLink, isActive } from '../../packages/valaxy-theme-press/composables/sidebar'

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
