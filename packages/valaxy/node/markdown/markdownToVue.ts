// copy from vitepress
import fs from 'fs'
import path from 'path'
import c from 'picocolors'
import matter from 'gray-matter'
import LRUCache from 'lru-cache'
import _debug from 'debug'
import { EXTERNAL_URL_RE, getGitTimestamp, slash, transformObject } from '../utils'
import type { HeadConfig, PageData } from '../../types'
import { deeplyParseHeader } from './markdown-it/parseHeader'
import { createMarkdownRenderer } from '.'
import type { MarkdownOptions } from '.'

const debug = _debug('vitepress:md')
const cache = new LRUCache<string, MarkdownCompileResult>({ max: 1024 })
const includesRE = /<!--\s*@include:\s*(.*?)\s*-->/g

export interface MarkdownCompileResult {
  vueSrc: string
  pageData: PageData
  deadLinks: string[]
  includes: string[]
}

const inferTitle = (frontmatter: Record<string, any>, content: string) => {
  if (frontmatter.title)
    return deeplyParseHeader(frontmatter.title)

  const match = content.match(/^\s*#+\s+(.*)/m)

  if (match)
    return deeplyParseHeader(match[1].trim())

  return ''
}

const getHeadMetaContent = (
  head: HeadConfig[],
  name: string,
): string | undefined => {
  if (!head || !head.length)
    return undefined

  const meta = head.find(([tag, attrs = {}]) => {
    return tag === 'meta' && attrs.name === name && attrs.content
  })

  return meta && meta[1].content
}

const inferDescription = (frontmatter: Record<string, any>) => {
  const { description, head } = frontmatter

  if (description !== undefined)
    return description

  return (head && getHeadMetaContent(head, 'description')) || ''
}

export async function createMarkdownToVueRenderFn(
  srcDir: string,
  options: MarkdownOptions = {},
  pages: string[],
  userDefines: Record<string, any> | undefined,
  isBuild = false,
  base = '/',
  includeLastUpdatedData = false,
) {
  const md = await createMarkdownRenderer(srcDir, options, base)

  pages = pages.map(p => slash(p.replace(/\.md$/, '')))

  const userDefineRegex = userDefines
    ? new RegExp(
        `\\b(${Object.keys(userDefines)
          .map(key => key.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&'))
          .join('|')})`,
        'g',
    )
    : null

  return async (
    src: string,
    file: string,
    publicDir: string,
  ): Promise<MarkdownCompileResult> => {
    const relativePath = slash(path.relative(srcDir, file))
    const dir = path.dirname(file)

    const cached = cache.get(src)
    if (cached) {
      debug(`[cache hit] ${relativePath}`)
      return cached
    }

    const start = Date.now()

    // resolve includes
    const includes: string[] = []
    src = src.replace(includesRE, (_, m1) => {
      const includePath = path.join(dir, m1)
      const content = fs.readFileSync(includePath, 'utf-8')
      includes.push(slash(includePath))
      return content
    })

    const { content, data: frontmatter } = matter(src)

    // reset state before render
    md.__path = file
    md.__relativePath = relativePath

    let html = md.render(content)
    const data = md.__data

    if (isBuild) {
      // avoid env variables being replaced by vite
      html = html
        .replace(/\bimport\.meta/g, 'import.<wbr/>meta')
        .replace(/\bprocess\.env/g, 'process.<wbr/>env')

      // also avoid replacing vite user defines
      if (userDefineRegex) {
        html = html.replace(
          userDefineRegex,
          _ => `${_[0]}<wbr/>${_.slice(1)}`,
        )
      }
    }

    // validate data.links
    const deadLinks: string[] = []
    const recordDeadLink = (url: string) => {
      console.warn(
        c.yellow(
          `\n(!) Found dead link ${c.cyan(url)} in file ${c.white(c.dim(file))}`,
        ),
      )
      deadLinks.push(url)
    }

    if (data.links) {
      const dir = path.dirname(file)
      for (let url of data.links) {
        if (/\.(?!html|md)\w+($|\?)/i.test(url))
          continue

        if (url.replace(EXTERNAL_URL_RE, '').startsWith('//localhost:')) {
          recordDeadLink(url)
          continue
        }

        url = url.replace(/[?#].*$/, '').replace(/\.(html|md)$/, '')
        if (url.endsWith('/'))
          url += 'index'
        const resolved = decodeURIComponent(
          slash(
            url.startsWith('/')
              ? url.slice(1)
              : path.relative(srcDir, path.resolve(dir, url)),
          ),
        )
        if (
          !pages.includes(resolved)
          && !fs.existsSync(path.resolve(dir, publicDir, `${resolved}.html`))
        )
          recordDeadLink(url)
      }
    }

    const pageData: PageData = {
      title: inferTitle(frontmatter, content),
      titleTemplate: frontmatter.titleTemplate,
      description: inferDescription(frontmatter),
      frontmatter,
      headers: data.headers || [],
      relativePath,
      path: path.join(srcDir, relativePath),
    }

    if (includeLastUpdatedData)
      pageData.lastUpdated = await getGitTimestamp(file)

    const pageComponent = 'ValaxyMain'

    function generateSlots() {
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
      const slotsText = slots.map(s => `<template #${s}><slot name="${s}" /></template>`).join('')
      return slotsText
    }
    const vueSrc
      = `${genPageDataCode(data.hoistedTags || [], pageData).join('\n')
      }\n<template><${pageComponent} :frontmatter="frontmatter" :data="data">
        <template #main-content-md>${html}</template>
        ${generateSlots()}
        <slot />
      </${pageComponent}></template>`

    debug(`[render] ${file} in ${Date.now() - start}ms.`)

    const result = {
      vueSrc,
      pageData,
      deadLinks,
      includes,
    }
    cache.set(src, result)
    return result
  }
}

const scriptRE = /<\/script>/
const scriptLangTsRE = /<\s*script[^>]*\blang=['"]ts['"][^>]*/
const scriptSetupRE = /<\s*script[^>]*\bsetup\b[^>]*/
const scriptClientRE = /<\s*script[^>]*\bclient\b[^>]*/
const defaultExportRE = /((?:^|\n|;)\s*)export(\s*)default/
const namedDefaultExportRE = /((?:^|\n|;)\s*)export(.+)as(\s*)default/

function genPageDataCode(tags: string[], data: PageData) {
  const code = ''

  const existingScriptIndex = tags.findIndex((tag) => {
    return (
      scriptRE.test(tag)
      && !scriptSetupRE.test(tag)
      && !scriptClientRE.test(tag)
    )
  })

  const isUsingTS = tags.findIndex(tag => scriptLangTsRE.test(tag)) > -1

  const exportScript = `
  export default {
    name:'${data.relativePath}',
    data() {
      return {
        frontmatter:${transformObject(data.frontmatter)},
        data: ${transformObject(data)}
      }
    }
  }`

  if (existingScriptIndex > -1) {
    const tagSrc = tags[existingScriptIndex]
    // user has <script> tag inside markdown
    // if it doesn't have export default it will error out on build
    const hasDefaultExport
      = defaultExportRE.test(tagSrc) || namedDefaultExportRE.test(tagSrc)
    tags[existingScriptIndex] = tagSrc.replace(
      scriptRE,
      `${code
        + (hasDefaultExport
          ? ''
          : `\n${exportScript}`)
        }</script>`,
    )
  }
  else {
    tags.unshift(
      `<script ${isUsingTS ? 'lang="ts"' : ''}>${code}\n${exportScript}</script>`,
    )
  }

  return tags
}
