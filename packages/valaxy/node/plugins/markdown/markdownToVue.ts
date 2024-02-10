// copy from vitepress
import fs from 'fs-extra'
import c from 'picocolors'
import { LRUCache } from 'lru-cache'
import _debug from 'debug'
import { resolveTitleFromToken } from '@mdit-vue/shared'
import type { HeadConfig, PageData } from 'valaxy/types'
import path from 'pathe'
import type MarkdownIt from 'markdown-it'
import { EXTERNAL_URL_RE } from '../../constants'
import { getGitTimestamp, slash, transformObject } from '../../utils'
import type { ResolvedValaxyOptions } from '../../options'
import { encryptContent } from '../../utils/encrypt'
import { processIncludes } from './utils/processInclude'
import { createMarkdownRenderer } from '.'
import type { MarkdownEnv } from '.'

const debug = _debug('valaxy:md')
const cache = new LRUCache<string, MarkdownCompileResult>({ max: 1024 })
const includesRE = /<!--\s*@include:\s*(.*?)\s*-->/g

export function injectPageDataCode(
  data: PageData,
  _replaceRegex: RegExp,
) {
  const vueContextImports = [
    `import { provide } from 'vue'`,
    `import { useRoute } from 'vue-router'`,
    `export const data = ${transformObject(data)}`,
    `export default {
      name:'${data.relativePath}',
      data() {
        return { data, frontmatter: data.frontmatter, $frontmatter: data.frontmatter }
      },
      setup() {
        const route = useRoute()
        route.meta.frontmatter = Object.assign(route.meta.frontmatter || {}, data.frontmatter || {})
        provide('pageData', data)
      }
    }`,
  ]

  return vueContextImports
}

/**
 * valaxy main layout
 */
export function getValaxyMain(mainContentMd: string) {
  const pageComponent = 'ValaxyMain'
  // :data="data"
  return `
  <${pageComponent} :frontmatter="frontmatter" >
    <template #main-content-md>${mainContentMd}</template>
    ${generateSlots()}
    <slot />
  </${pageComponent}>
`
}

export interface MarkdownCompileResult {
  vueSrc: string
  pageData: PageData
  deadLinks: string[]
  includes: string[]
}

function inferTitle(md: MarkdownIt, frontmatter: Record<string, any>, title: string) {
  if (typeof frontmatter.title === 'string') {
    const titleToken = md.parseInline(frontmatter.title, {})[0]
    if (titleToken) {
      return resolveTitleFromToken(titleToken, {
        shouldAllowHtml: false,
        shouldEscapeText: false,
      })
    }
  }
  return title
}

function getHeadMetaContent(head: HeadConfig[], name: string): string | undefined {
  if (!head || !head.length)
    return undefined

  const meta = head.find(([tag, attrs = {}]) => {
    return tag === 'meta' && attrs.name === name && attrs.content
  })

  return meta && meta[1].content
}

function inferDescription(frontmatter: Record<string, any>) {
  const { description, head } = frontmatter

  if (description !== undefined)
    return description

  return (head && getHeadMetaContent(head, 'description')) || ''
}

function handleCodeHeightlimit(mainContentMd: string, options: ResolvedValaxyOptions, codeHeightLimit?: number): string {
  if (typeof codeHeightLimit !== 'number' || codeHeightLimit <= 0)
    return mainContentMd

  const siteConfigLimit = options.config.siteConfig.codeHeightLimit
  mainContentMd = mainContentMd.replaceAll(/<div.+class="language-\w+">/g, (matchStr) => {
    if (siteConfigLimit !== undefined && siteConfigLimit > 0)
      matchStr = matchStr.replace(/\d+/, codeHeightLimit.toString())
    else matchStr = `${matchStr.slice(0, 5)}style="max-height: ${codeHeightLimit}px;"${matchStr.slice(5)}`

    return matchStr
  })
  return mainContentMd
}

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
  const slotsText = slots
    .map(s => `<template #${s}><slot name="${s}" /></template>`)
    .join('')
  return slotsText
}

export async function createMarkdownToVueRenderFn(
  options: ResolvedValaxyOptions,
  srcDir: string,
  pages: string[],
  includeLastUpdatedData = false,
) {
  const md = await createMarkdownRenderer(options)

  // for dead link detection
  pages = pages.map(p => p.replace(/\.md$/, '').replace(/\/index$/, ''))

  return async (
    src: string,
    file: string,
    publicDir: string,
  ): Promise<MarkdownCompileResult> => {
    const fileOrig = file
    const dir = path.dirname(file)
    const relativePath = path.relative(srcDir, file)

    const cacheKey = JSON.stringify({ src, file: fileOrig })

    const cached = cache.get(cacheKey)
    if (cached) {
      debug(`[cache hit] ${relativePath}`)
      return cached
    }

    const start = Date.now()

    // resolve includes
    const includes: string[] = []
    src = processIncludes(srcDir, src, fileOrig, includes)
    src = src.replace(includesRE, (m, m1) => {
      try {
        const includePath = path.join(dir, m1)
        const content = fs.readFileSync(includePath, 'utf-8')
        includes.push(includePath)
        return content
      }
      catch (error) {
        return m // silently ignore error if file is not present
      }
    })

    // reset env before render
    const env: MarkdownEnv = {
      path: file,
      relativePath,
      realPath: fileOrig,
    }

    const html = md.render(src, env)
    const {
      frontmatter = {},
      headers = [],
      links = [],
      title = '',
    } = env

    // validate data.links
    const deadLinks: string[] = []
    const recordDeadLink = (url: string) => {
      console.warn(
        c.yellow(
          `\n(!) Found dead link ${c.cyan(url)} in file ${c.white(
            c.dim(file),
          )}\nIf it is intended, you can use:\n    ${c.cyan(
            `<a href="${url}" target="_blank" rel="noreferrer">${url}</a>`,
          )}`,
        ),
      )
      deadLinks.push(url)
    }

    if (links) {
      const dir = path.dirname(file)
      for (let url of links) {
        if (/\.(?!html|md)\w+($|\?)/i.test(url))
          continue

        if (url.replace(EXTERNAL_URL_RE, '').startsWith('//localhost:')) {
          recordDeadLink(url)
          continue
        }

        url = url.replace(/[?#].*$/, '').replace(/\.(html|md)$/, '')
        const resolved = decodeURIComponent(
          slash(
            url.startsWith('/')
              ? url.slice(1)
              : path.relative(srcDir, path.resolve(dir, url)),
          ),
        ).replace(/\/index$/, '')

        if (
          !(
            resolved.endsWith('/')
              ? (
                  pages.includes(resolved.slice(0, -1))
                )
              : (
                  pages.includes(resolved)
                  || fs.existsSync(path.resolve(dir, publicDir, `${resolved}.html`))
                  || fs.existsSync(path.resolve(dir, publicDir, `${resolved}/index.html`))
                )
          )
        )
          recordDeadLink(url)
      }
    }

    // provide load
    const pageData: PageData = {
      title: inferTitle(md, frontmatter, title),
      titleTemplate: frontmatter.titleTemplate as any,
      description: inferDescription(frontmatter),
      frontmatter,
      headers,
      relativePath,
      path: path.join(srcDir, relativePath),
    }

    if (includeLastUpdatedData)
      pageData.lastUpdated = await getGitTimestamp(file)

    let mainContentMd = html.replace(/<a (.*?)>(.*?)<\/a>/g, '<AppLink $1>$2</AppLink>')

    mainContentMd = handleCodeHeightlimit(mainContentMd, options, frontmatter.codeHeightLimit)

    // handle mainContent, encrypt
    const { config: { siteConfig: { encrypt } } } = options
    if (encrypt.enable) {
      // partial encryption
      const encryptRegexp = /<!-- valaxy-encrypt-start:(?<password>\w+) -->(?<content>.*?)<!-- valaxy-encrypt-end -->/gs
      const encryptcommentRegexp = /((<!-- valaxy-encrypt-start:\w+ -->)|(<!-- valaxy-encrypt-end -->))/g
      if (frontmatter.password) {
        mainContentMd = mainContentMd.replaceAll(encryptcommentRegexp, '')
      }
      else {
        const partiallyEncryptedContents: string[] = []
        for (const matchArr of mainContentMd.matchAll(encryptRegexp)) {
          partiallyEncryptedContents.push(
            await encryptContent(matchArr.groups!.content, {
              password: matchArr.groups!.password,
              iv: encrypt.iv,
              salt: encrypt.salt,
            }),
          )
        }
        frontmatter.partiallyEncryptedContents = partiallyEncryptedContents.length ? partiallyEncryptedContents : undefined
        let i = 0
        mainContentMd = mainContentMd.replaceAll(encryptRegexp, () => `<ValaxyDecrypt :encrypted-content="frontmatter.partiallyEncryptedContents[${i++}]" />`)
      }

      // encrypt the entire article
      if (frontmatter.password) {
        const encryptedContent = await encryptContent(mainContentMd, {
          password: frontmatter.password,
          iv: encrypt.iv,
          salt: encrypt.salt,
        })
        mainContentMd = ''
        frontmatter.encryptedContent = encryptedContent
        frontmatter.encrypt = true
        delete frontmatter.password
      }
      if (frontmatter.gallery_password) {
        const encryptedPhotos = await encryptContent(JSON.stringify(frontmatter.photos), {
          password: frontmatter.gallery_password,
          iv: encrypt.iv,
          salt: encrypt.salt,
        })
        frontmatter.encryptedPhotos = encryptedPhotos
        delete frontmatter.gallery_password
        delete frontmatter.photos
      }
    }

    const vueSrc = [
      // ...injectPageDataCode(),
      getValaxyMain(mainContentMd),
    ].join('\n')

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
