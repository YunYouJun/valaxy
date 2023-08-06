// copy from vitepress
import path from 'node:path'
import fs from 'fs-extra'
import c from 'picocolors'
import { LRUCache } from 'lru-cache'
import _debug from 'debug'
import { resolveTitleFromToken } from '@mdit-vue/shared'
import { EXTERNAL_URL_RE } from '../constants'
import { getGitTimestamp, slash, transformObject } from '../utils'
import type { CleanUrlsMode, HeadConfig, PageData } from '../../types'
import type { ResolvedValaxyOptions } from '../options'
import { encryptContent } from '../utils/encrypt'
import type { MarkdownOptions } from './types'
import { createMarkdownRenderer } from '.'
import type { MarkdownEnv, MarkdownRenderer } from '.'

const jsStringBreaker = '\u200B'
const vueTemplateBreaker = '<wbr>'

const debug = _debug('vitepress:md')
const cache = new LRUCache<string, MarkdownCompileResult>({ max: 1024 })
const includesRE = /<!--\s*@include:\s*(.*?)\s*-->/g

function genReplaceRegexp(
  userDefines: Record<string, any> = {},
  isBuild: boolean,
): RegExp {
  // `process.env` need to be handled in both dev and build
  // @see https://github.com/vitejs/vite/blob/cad27ee8c00bbd5aeeb2be9bfb3eb164c1b77885/packages/vite/src/node/plugins/clientInjections.ts#L57-L64
  const replacements = ['process.env']
  if (isBuild)
    replacements.push('import.meta', ...Object.keys(userDefines))

  return new RegExp(
    `\\b(${replacements
      .map(key => key.replace(/[-[\]/{}()*+?.\\^$|]/g, '\\$&'))
      .join('|')})`,
    'g',
  )
}

/**
 * To avoid env variables being replaced by vite:
 * - insert `'\u200b'` char into those strings inside js string (page data)
 * - insert `<wbr>` tag into those strings inside html string (vue template)
 *
 * @see https://vitejs.dev/guide/env-and-mode.html#production-replacement
 */
function replaceConstants(str: string, replaceRegex: RegExp, breaker: string) {
  // replace a to AppLink
  str = str.replace(/<a (.*?)>(.*?)<\/a>/g, '<AppLink $1>$2</AppLink>')

  return str.replace(replaceRegex, _ => `${_[0]}${breaker}${_.slice(1)}`)
}

export interface MarkdownCompileResult {
  vueSrc: string
  pageData: PageData
  deadLinks: string[]
  includes: string[]
}

function inferTitle(md: MarkdownRenderer,
  frontmatter: Record<string, any>,
  title: string) {
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

function getHeadMetaContent(head: HeadConfig[],
  name: string): string | undefined {
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

export async function createMarkdownToVueRenderFn(
  options: ResolvedValaxyOptions,
  srcDir: string,
  mdOptions: MarkdownOptions = {},
  pages: string[],
  userDefines: Record<string, any> | undefined,
  isBuild = false,
  includeLastUpdatedData = false,
  // https://vitepress.vuejs.org/config/app-configs#cleanurls-experimental
  cleanUrls: CleanUrlsMode = 'with-subfolders',
) {
  const md = await createMarkdownRenderer(mdOptions)

  // for dead link detection
  pages = pages.map(p => slash(p.replace(/\.md$/, '')).replace(/\/index$/, ''))

  const replaceRegex = genReplaceRegexp(userDefines, isBuild)

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
    src = src.replace(includesRE, (m, m1) => {
      try {
        const includePath = path.join(dir, m1)
        const content = fs.readFileSync(includePath, 'utf-8')
        includes.push(slash(includePath))
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
      cleanUrls,
    }

    const html = md.render(src, env)
    const {
      frontmatter = {},
      headers = [],
      links = [],
      sfcBlocks,
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
      const slotsText = slots
        .map(s => `<template #${s}><slot name="${s}" /></template>`)
        .join('')
      return slotsText
    }

    let mainContentMd = replaceConstants(
      html,
      replaceRegex,
      vueTemplateBreaker,
    )
    // handle mainContent, encrypt
    const { config: { siteConfig: { encrypt } } } = options
    if (encrypt.enable) {
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
      ...injectPageDataCode(
        sfcBlocks?.scripts.map(item => item.content) ?? [],
        pageData,
        replaceRegex,
      ),
      `<template><${pageComponent} :frontmatter="frontmatter" :data="data">`,
      `<template #main-content-md>${mainContentMd}</template>`,
      generateSlots(),
      '<slot />',
      `</${pageComponent}></template>`,
      ...(sfcBlocks?.styles.map(item => item.content) ?? []),
      ...(sfcBlocks?.customBlocks.map(item => item.content) ?? []),
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

const scriptRE = /<\/script>/
const scriptLangTsRE = /<\s*script[^>]*\blang=['"]ts['"][^>]*/
const scriptSetupRE = /<\s*script[^>]*\bsetup\b[^>]*/
const scriptClientRE = /<\s*script[^>]*\bclient\b[^>]*/
const defaultExportRE = /((?:^|\n|;)\s*)export(\s*)default/
const namedDefaultExportRE = /((?:^|\n|;)\s*)export(.+)as(\s*)default/

function injectPageDataCode(
  tags: string[],
  data: PageData,
  replaceRegex: RegExp,
) {
  const dataJson = JSON.stringify(data)
  const code = `\nexport const __pageData = JSON.parse(${JSON.stringify(
    replaceConstants(dataJson, replaceRegex, jsStringBreaker),
  )})`

  const existingScriptIndex = tags.findIndex((tag) => {
    return (
      scriptRE.test(tag)
      && !scriptSetupRE.test(tag)
      && !scriptClientRE.test(tag)
    )
  })

  const isUsingTS = tags.findIndex(tag => scriptLangTsRE.test(tag)) > -1

  const exportScript = `
  import { provide } from 'vue'
  import { useRoute } from 'vue-router'
  const data = ${transformObject(data)}

  export default {
    name:'${data.relativePath}',
    data() {
      return { data, frontmatter: data.frontmatter, $frontmatter: data.frontmatter }
    },
    setup() {
      const route = useRoute()
      route.meta.frontmatter = Object.assign(route.meta.frontmatter, data.frontmatter)
      provide('pageData', data)
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
