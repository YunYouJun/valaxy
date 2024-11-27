import type { PageData } from 'valaxy/types'
import type { ResolvedConfig } from 'vite'
import type { ResolvedValaxyOptions } from '../../options'
import _debug from 'debug'
// copy from vitepress
import { LRUCache } from 'lru-cache'
import path from 'pathe'
import { createTransformCodeBlock } from './transform/code-block'
import { createScanDeadLinks } from './transform/dead-links'
import { createTransformEncrypt } from './transform/encrypt'
import { transformFootnoteTooltip } from './transform/footnoteTooltip'
import { transformHexoTags } from './transform/hexo'
import { resolveTransformIncludes } from './transform/include'
import { createTransformMarkdown } from './transform/markdown'
import { generatePageData } from './transform/page-data'

const debug = _debug('valaxy:md')
const cache = new LRUCache<string, MarkdownCompileResult>({ max: 128 })

export function generateSlots() {
  const slots = [
    'main-header',
    'main-header-after',
    'main-nav',
    'main-content',
    'main-content-after',
    'main-nav-before',
    'main-nav-after',
    'comment',
    'footer',
    'aside',
    'aside-custom',
  ]
  const slotsText = slots
    .map(s => `<template #${s}><slot name="${s}" /></template>`)
    .join('')
  return slotsText
}

/**
 * valaxy main layout
 */
export function getValaxyMain(mainContentMd: string) {
  const pageComponent = 'ValaxyMain'
  // :data="data"
  return `
<${pageComponent} :frontmatter="$frontmatter">
  <template #main-content-md>${mainContentMd}</template>
  ${generateSlots()}
  <slot />
</${pageComponent}>
`
}

export interface MarkdownCompileResult {
  code: string
  pageData: PageData
  deadLinks: { url: string, file: string }[]
  includes: string[]
}

/**
 * create transform
 */
export async function createMarkdownToVueRenderFn(
  options: ResolvedValaxyOptions,
  _viteConfig: ResolvedConfig,
) {
  // for dead link detection
  options.pages = options.pages.map(p => p.replace(/\.md$/, '').replace(/\/index$/, ''))

  const transformCodeBlock = createTransformCodeBlock(options)
  const transformMarkdown = createTransformMarkdown(options)

  const transformEncrypt = createTransformEncrypt(options)

  const scanDeadLinks = createScanDeadLinks(options)

  const srcDir = options.userRoot

  const isBuild = options.mode === 'build'

  return async (
    code: string,
    id: string,
  ): Promise<MarkdownCompileResult> => {
    const file = id
    const relativePath = path.relative(srcDir, file)
    // do not await, depend options.env
    const deadLinks = scanDeadLinks(code, id)

    // only in build
    const cacheKey = JSON.stringify({ code, id })
    if (isBuild) {
      const cacheKey = JSON.stringify({ code, id })
      const cached = cache.get(cacheKey)
      if (cached) {
        debug(`[cache hit] ${relativePath}`)
        return cached
      }
    }

    const start = Date.now()
    // pageData fm.encryptedContent
    // avoid async problems
    // posts transform is parallel
    const pageData = await generatePageData(code, id, options)

    code = transformHexoTags(code, id)
    const data = resolveTransformIncludes(code, id, options)
    const includes = data.includes
    code = data.code
    code = transformCodeBlock(code)

    // run it before vue and after md parse
    code = await transformEncrypt(code, id, pageData)

    code = transformFootnoteTooltip(code)

    code = transformMarkdown(code, id, pageData)

    debug(`[render] ${file} in ${Date.now() - start}ms.`)

    // console.log(code)

    const result = {
      code,
      pageData,
      deadLinks,
      includes,
    }
    if (isBuild)
      cache.set(cacheKey, result)

    return result
  }
}
