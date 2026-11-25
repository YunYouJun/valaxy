// @vitest-environment jsdom
import type { MenuItem } from 'valaxy'
import { describe, expect, it, vi } from 'vitest'
import {
  buildOutlineBranchId,
  collectCollapsibleOutlineLinks,
  computeAutoCollapsedLinks,
  filterOutlineHeadersByLocale,
  findOutlineAncestorLinks,
  normalizeOutlineHash,
} from '../../packages/valaxy-theme-yun/utils/outline'
import { resolveOutlineMarkerTop } from '../../packages/valaxy/client/composables/outline/anchor'

vi.mock('valaxy', () => ({
  useSidebar: () => ({ hasSidebar: { value: false } }),
}))

function makeHeader(link: string, children?: MenuItem[]): MenuItem {
  return {
    title: link.replace(/^#/, ''),
    link,
    element: null as unknown as HTMLHeadElement,
    level: 2,
    children,
  }
}

const sampleHeaders: MenuItem[] = [
  makeHeader('#intro'),
  makeHeader('#setup', [
    makeHeader('#install'),
    makeHeader('#中文配置', [
      makeHeader('#主题配色'),
    ]),
  ]),
  makeHeader('#deploy', [
    makeHeader('#github-pages'),
  ]),
]

describe('valaxy-theme-yun outline utils', () => {
  it('normalizes percent-encoded and malformed outline hashes safely', () => {
    expect(normalizeOutlineHash('#%E4%B8%AD%E6%96%87%E9%85%8D%E7%BD%AE')).toBe('#中文配置')
    expect(normalizeOutlineHash('#%E0%A4%A')).toBe('#%E0%A4%A')
  })

  it('collects only heading links that have nested children', () => {
    expect(collectCollapsibleOutlineLinks(sampleHeaders)).toEqual([
      '#setup',
      '#中文配置',
      '#deploy',
    ])
  })

  it('finds all ancestor links including encoded hashes', () => {
    const encodedLeaf = `#${encodeURIComponent('主题配色')}`
    expect([...findOutlineAncestorLinks(sampleHeaders, encodedLeaf)]).toEqual([
      '#setup',
      '#中文配置',
    ])
    expect([...findOutlineAncestorLinks(sampleHeaders, '#intro')]).toEqual([])
    expect([...findOutlineAncestorLinks(sampleHeaders, null)]).toEqual([])
  })

  it('keeps only the active heading and its ancestors expanded in auto mode', () => {
    expect([...computeAutoCollapsedLinks(sampleHeaders, '#%E4%B8%AD%E6%96%87%E9%85%8D%E7%BD%AE')]).toEqual([
      '#deploy',
    ])
    expect([...computeAutoCollapsedLinks(sampleHeaders, '#github-pages')]).toEqual([
      '#setup',
      '#中文配置',
    ])
    expect([...computeAutoCollapsedLinks(sampleHeaders, null)]).toEqual([
      '#setup',
      '#中文配置',
      '#deploy',
    ])
  })

  it('builds unique CSS-safe branch IDs across tree paths including non-ASCII headings', () => {
    const first = buildOutlineBranchId('0-0', '#简介')
    const second = buildOutlineBranchId('1-0', '#总结')
    expect(first).toBe('yun-outline-branch-0-0')
    expect(second).toBe('yun-outline-branch-1-0')
    expect(first).not.toBe(second)
    expect(first).toMatch(/^[a-z0-9_-]+$/)
    expect(second).toMatch(/^[a-z0-9_-]+$/)
    expect(buildOutlineBranchId('0', '#TOC-1')).toBe('yun-outline-branch-0__toc-1')

    // Parent path '0' + slug '0' must never collide with child path '0-0' + empty slug.
    const parentNumeric = buildOutlineBranchId('0', '#章节-0')
    const childChinese = buildOutlineBranchId('0-0', '#介绍')
    expect(parentNumeric).toBe('yun-outline-branch-0__0')
    expect(childChinese).toBe('yun-outline-branch-0-0')
    expect(parentNumeric).not.toBe(childChinese)
    expect(parentNumeric).toMatch(/^[a-z0-9_-]+$/)
  })

  it('resolves outline marker top relative to marker offsetParent across header visibility states', () => {
    const content = {} as HTMLElement

    // 1. Visible 28px header (toc list starts at offsetTop=28 inside content)
    const tocVisibleHeader = { offsetParent: content, offsetTop: 28, offsetHeight: 200 } as unknown as HTMLElement
    const linkUnderVisibleHeader = { offsetParent: tocVisibleHeader, offsetTop: 56, offsetHeight: 28 } as unknown as HTMLElement
    const markerInContent = { offsetParent: content, offsetTop: 32, offsetHeight: 18 } as unknown as HTMLElement
    expect(resolveOutlineMarkerTop(linkUnderVisibleHeader, markerInContent)).toBe(89)

    // 2. Hidden header (< 1280px without toggle: toc shifts up to offsetTop=0)
    const tocHiddenHeader = { offsetParent: content, offsetTop: 0, offsetHeight: 200 } as unknown as HTMLElement
    const linkUnderHiddenHeader = { offsetParent: tocHiddenHeader, offsetTop: 56, offsetHeight: 28 } as unknown as HTMLElement
    expect(resolveOutlineMarkerTop(linkUnderHiddenHeader, markerInContent)).toBe(61)

    // 3. Taller 44px closable header (e.g. PressOutline)
    const tocTallerHeader = { offsetParent: content, offsetTop: 44, offsetHeight: 200 } as unknown as HTMLElement
    const linkUnderTallerHeader = { offsetParent: tocTallerHeader, offsetTop: 0, offsetHeight: 28 } as unknown as HTMLElement
    expect(resolveOutlineMarkerTop(linkUnderTallerHeader, markerInContent)).toBe(49)

    // 4. Fallback when marker is detached or unpositioned
    const detachedMarker = { offsetParent: null, offsetTop: 0, offsetHeight: 0 } as unknown as HTMLElement
    expect(resolveOutlineMarkerTop(linkUnderVisibleHeader, detachedMarker)).toBe(89)
  })

  it('filters mismatched locale headings while preserving shared and matching headings', () => {
    const bilingualHeaders: MenuItem[] = [
      { ...makeHeader('#what-is-valaxy'), lang: 'en' },
      {
        ...makeHeader('#什么是-valaxy', [
          { ...makeHeader('#english-sub'), lang: 'en' },
          { ...makeHeader('#中文子标题'), lang: 'zh-CN' },
          makeHeader('#shared-sub'),
        ]),
        lang: 'zh-CN',
      },
      makeHeader('#vue-component'),
    ]

    const zhResult = filterOutlineHeadersByLocale(bilingualHeaders, 'zh-CN')
    expect(zhResult.map(h => h.link)).toEqual(['#什么是-valaxy', '#vue-component'])
    expect(zhResult[0].children?.map(h => h.link)).toEqual(['#中文子标题', '#shared-sub'])

    const enResult = filterOutlineHeadersByLocale(bilingualHeaders, 'en')
    expect(enResult.map(h => h.link)).toEqual(['#what-is-valaxy', '#english-sub', '#shared-sub', '#vue-component'])
  })

  it('keeps headings inside non-i18n-hidden foreign-language elements like <section lang="fr"> and matches lang case-insensitively', () => {
    const mdBody = document.createElement('div')
    mdBody.className = 'markdown-body'

    const sectionFr = document.createElement('section')
    sectionFr.setAttribute('lang', 'fr')
    const hFrVisible = document.createElement('h2')
    hFrVisible.id = 'bonjour'
    sectionFr.appendChild(hFrVisible)

    const hEnUpper = document.createElement('h2')
    hEnUpper.id = 'english-upper'
    hEnUpper.setAttribute('lang', 'EN')

    const divZh = document.createElement('div')
    divZh.setAttribute('lang', 'zh-CN')
    const hZhHidden = document.createElement('h2')
    hZhHidden.id = 'nihao'
    divZh.appendChild(hZhHidden)

    mdBody.append(sectionFr, hEnUpper, divZh)
    document.body.appendChild(mdBody)

    const headers: MenuItem[] = [
      { title: 'Bonjour', link: '#bonjour', element: hFrVisible as HTMLHeadElement, level: 2 },
      { title: 'English Upper', link: '#english-upper', element: hEnUpper as HTMLHeadElement, level: 2, lang: 'EN' },
      { title: '你好', link: '#nihao', element: hZhHidden as HTMLHeadElement, level: 2 },
    ]

    const enResult = filterOutlineHeadersByLocale(headers, 'en')
    expect(enResult.map(h => h.link)).toEqual(['#bonjour', '#english-upper'])

    mdBody.remove()
  })
})
