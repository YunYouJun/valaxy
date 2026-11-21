import type { MenuItem } from 'valaxy'
import { describe, expect, it } from 'vitest'
import {
  collectCollapsibleOutlineLinks,
  computeAutoCollapsedLinks,
  findOutlineAncestorLinks,
  normalizeOutlineHash,
} from '../../packages/valaxy-theme-yun/utils/outline'

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
})
