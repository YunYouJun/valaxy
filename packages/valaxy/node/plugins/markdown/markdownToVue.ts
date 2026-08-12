import type { PageData } from '../../../types'
import type { StateManager, ValaxyFileInfo } from '../../app/state'
import type { ResolvedValaxyOptions } from '../../types'
import type { MarkdownTransformContext } from './types'
import { createHash } from 'node:crypto'
import _debug from 'debug'
// copy from vitepress
import { LRUCache } from 'lru-cache'
import path from 'pathe'
import { Valaxy } from '../../app'
import { createTransformCodeBlock } from './transform/code-block'
import { createScanDeadLinks } from './transform/dead-links'
import { createTransformEncrypt } from './transform/encrypt'
import { transformFootnoteTooltip } from './transform/footnoteTooltip'
import { transformHexoTags } from './transform/hexo'
import { resolveTransformIncludes } from './transform/include'
import { createTransformMarkdown } from './transform/markdown'
import { generatePageData } from './transform/page-data'

const debug = _debug('valaxy:md')
// A weak key prevents finished build contexts from being retained by this module.
const caches = new WeakMap<StateManager, LRUCache<string, MarkdownCompileResult>>()

function getMarkdownCache(state: StateManager) {
  let cache = caches.get(state)
  if (!cache) {
    cache = new LRUCache<string, MarkdownCompileResult>({ max: 128 })
    caches.set(state, cache)
  }
  return cache
}

function createCacheKey(code: string, id: string, fileInfo?: ValaxyFileInfo) {
  return createHash('sha256')
    .update(id)
    .update('\0')
    .update(code)
    .update('\0')
    .update(JSON.stringify(fileInfo) || '')
    .digest('base64url')
}

/**
 * Clear the markdown render cache to free memory after build completes.
 */
export function clearMarkdownCache(state: StateManager = Valaxy.state) {
  caches.get(state)?.clear()
  caches.delete(state)
}

export function getMarkdownCacheSize(state: StateManager) {
  return caches.get(state)?.size ?? 0
}

export function generateSlots() {
  const slots = [
    'main-header',
    'main-header-after',
    'main-nav',
    'main-content-before',
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
  state: StateManager = Valaxy.state,
) {
  // for dead link detection
  options.pages = options.pages.map(p => p.replace(/\.md$/, '').replace(/\/index$/, ''))

  const transformCodeBlock = createTransformCodeBlock(options)
  const transformMarkdown = createTransformMarkdown(options)
  const transformEncrypt = createTransformEncrypt(options)

  const scanDeadLinks = createScanDeadLinks(options)

  const srcDir = options.userRoot

  const isBuild = options.mode === 'build'
  const cache = isBuild ? getMarkdownCache(state) : undefined

  const compile = async (
    code: string,
    context: MarkdownTransformContext,
  ): Promise<MarkdownCompileResult> => {
    const { id, fileInfo } = context
    const file = id
    const relativePath = path.relative(srcDir, file)
    const deadLinks = scanDeadLinks(code, context)

    // only compute cacheKey in build mode
    let cacheKey: string | undefined
    if (isBuild) {
      cacheKey = createCacheKey(code, id, fileInfo)
      const cached = cache!.get(cacheKey)
      if (cached) {
        debug(`[cache hit] ${relativePath}`)
        return cached
      }
    }

    const start = Date.now()
    // pageData fm.encryptedContent
    // avoid async problems
    // posts transform is parallel
    const pageData = await generatePageData(code, context, options)

    code = transformHexoTags(code, id)
    const data = resolveTransformIncludes(code, id, options)
    const includes = data.includes
    code = data.code
    code = transformCodeBlock(code, context)

    // run it before vue and after md parse
    code = await transformEncrypt(code, id, pageData)

    code = transformFootnoteTooltip(code, id)

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
      cache!.set(cacheKey!, result)

    return result
  }

  return async (code: string, id: string): Promise<MarkdownCompileResult> => {
    // Take an immutable snapshot before the first await. A newer HMR transform
    // for the same id can then record its own environment without being mixed
    // into, or deleted by, this compilation.
    const context: MarkdownTransformContext = {
      id,
      fileInfo: state.take(id),
    }
    return compile(code, context)
  }
}
