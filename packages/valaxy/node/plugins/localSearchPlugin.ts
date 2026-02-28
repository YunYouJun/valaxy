/**
 * Local search powered by MiniSearch
 * @see https://github.com/vuejs/vitepress/blob/main/src/node/plugins/localSearchPlugin.ts
 */

import type { Plugin, ViteDevServer } from 'vite'
import type { ResolvedValaxyOptions } from '../types'
import type { MarkdownEnv } from './markdown/env'
import path from 'node:path'
import process from 'node:process'
import { slash } from '@antfu/utils'
import _debug from 'debug'
import fs from 'fs-extra'
import MiniSearch from 'minisearch'
import pMap from 'p-map'
import { createLightMarkdownRenderer } from './markdown'
import { processIncludes } from './markdown/utils/processInclude'

const debug = _debug('valaxy:local-search')

const LOCAL_SEARCH_INDEX_ID = '@localSearchIndex'
const LOCAL_SEARCH_INDEX_REQUEST_PATH = `/${LOCAL_SEARCH_INDEX_ID}`

interface IndexObject {
  id: string
  text: string
  title: string
  titles: string[]
}

export async function localSearchPlugin(
  options: ResolvedValaxyOptions,
): Promise<Plugin> {
  const siteConfig = options.config.siteConfig

  if (siteConfig.search?.provider !== 'local') {
    return {
      name: 'valaxy:local-search',
      resolveId(id) {
        if (id.startsWith(LOCAL_SEARCH_INDEX_ID)) {
          return LOCAL_SEARCH_INDEX_REQUEST_PATH
        }
      },
      load(id) {
        if (id.startsWith(LOCAL_SEARCH_INDEX_REQUEST_PATH)) {
          return `export default '{}'`
        }
      },
    }
  }

  const srcDir = path.resolve(options.userRoot, 'pages')
  // Snapshot the original page list before other plugins (markdownToVue) may
  // mutate `options.pages` by stripping the `.md` extension for dead-link
  // detection. We need the original paths (with `.md`) to read files on disk
  // and to keep consistent keys with handleHotUpdate which also uses `.md` paths.
  const originalPages = [...options.pages]
  const md = await createLightMarkdownRenderer(options)

  async function render(file: string) {
    if (!fs.existsSync(file))
      return ''
    const relativePath = slash(path.relative(srcDir, file))
    const env: MarkdownEnv = { path: file, relativePath }
    const mdRaw = await fs.promises.readFile(file, 'utf-8')
    const mdSrc = processIncludes(srcDir, mdRaw, file)
    const html = await md.renderAsync(mdSrc, env)
    return env.frontmatter?.search === false ? '' : html
  }

  const indexByLocales = new Map<string, MiniSearch<IndexObject>>()
  // Track which document IDs belong to each page file for incremental HMR updates
  const fileToDocIds = new Map<string, { locale: string, ids: string[] }>()

  function getIndexByLocale(locale: string) {
    let index = indexByLocales.get(locale)
    if (!index) {
      index = new MiniSearch<IndexObject>({
        fields: ['title', 'titles', 'text'],
        storeFields: ['title', 'titles'],
      })
      indexByLocales.set(locale, index)
    }
    return index
  }

  let server: ViteDevServer | undefined

  function onIndexUpdated() {
    if (server) {
      server.moduleGraph.onFileChange(LOCAL_SEARCH_INDEX_REQUEST_PATH)
      const mod = server.moduleGraph.getModuleById(
        LOCAL_SEARCH_INDEX_REQUEST_PATH,
      )
      if (!mod)
        return
      server.ws.send({
        type: 'update',
        updates: [
          {
            acceptedPath: mod.url,
            path: mod.url,
            timestamp: Date.now(),
            type: 'js-update',
          },
        ],
      })
    }
  }

  function getDocId(file: string) {
    const relFile = slash(path.relative(srcDir, file))
    let id = slash(path.join('/', relFile))
    id = id.replace(/(^|\/)index\.md$/, '$1')
    id = id.replace(/\.md$/, '.html')
    return id
  }

  function getLocaleForPath(page: string): string {
    const languages = siteConfig.languages || ['en']
    const firstSegment = page.split('/')[0]
    if (languages.includes(firstSegment)) {
      return firstSegment
    }
    return 'root'
  }

  async function indexFile(page: string) {
    const file = path.join(srcDir, page)
    const fileId = getDocId(file)
    const locale = getLocaleForPath(page)
    const index = getIndexByLocale(locale)

    const html = await render(file)
    const sections = splitPageIntoSections(html)
    const docIds: string[] = []
    for (const section of sections) {
      if (!section || !(section.text || section.titles))
        break
      const { anchor, text, titles } = section
      const id = anchor ? [fileId, anchor].join('#') : fileId
      docIds.push(id)
      index.add({
        id,
        text,
        title: titles.at(-1)!,
        titles: titles.slice(0, -1),
      })
    }
    fileToDocIds.set(page, { locale, ids: docIds })
  }

  /**
   * Remove all indexed entries for a given page file.
   */
  function discardFile(page: string) {
    const entry = fileToDocIds.get(page)
    if (!entry)
      return
    const index = indexByLocales.get(entry.locale)
    if (index) {
      for (const id of entry.ids) {
        try {
          index.discard(id)
        }
        catch (e) {
          debug('Failed to discard document %s: %O', id, e)
        }
      }
    }
    fileToDocIds.delete(page)
  }

  async function scanForBuild() {
    debug('Indexing files for search...')
    indexByLocales.clear()
    fileToDocIds.clear()
    await pMap(originalPages, indexFile, {
      concurrency: 10,
    })
    debug('Indexing finished..., %d locales', indexByLocales.size)
  }

  return {
    name: 'valaxy:local-search',

    config: () => ({
      optimizeDeps: {
        include: [
          'valaxy > @vueuse/integrations/useFocusTrap',
          'valaxy > mark.js/src/vanilla.js',
          'valaxy > minisearch',
        ],
      },
    }),

    async configureServer(_server) {
      server = _server
      await scanForBuild()
      onIndexUpdated()
    },

    resolveId(id) {
      if (id.startsWith(LOCAL_SEARCH_INDEX_ID)) {
        return `/${id}`
      }
    },

    async load(id) {
      if (id === LOCAL_SEARCH_INDEX_REQUEST_PATH) {
        if (process.env.NODE_ENV === 'production') {
          await scanForBuild()
        }
        const records: string[] = []
        for (const [locale] of indexByLocales) {
          records.push(
            `${JSON.stringify(locale)}: () => import('${LOCAL_SEARCH_INDEX_ID}${locale}')`,
          )
        }
        return `export default {${records.join(',')}}`
      }
      else if (id.startsWith(LOCAL_SEARCH_INDEX_REQUEST_PATH)) {
        return `export default ${JSON.stringify(
          JSON.stringify(
            indexByLocales.get(
              id.replace(LOCAL_SEARCH_INDEX_REQUEST_PATH, ''),
            ) ?? {},
          ),
        )}`
      }
    },

    async handleHotUpdate({ file }) {
      if (file.endsWith('.md')) {
        const relPath = slash(path.relative(srcDir, file))
        if (!relPath.startsWith('..')) {
          // Incremental update: discard old entries and re-index only the changed file
          discardFile(relPath)
          await indexFile(relPath)
          debug('Updated index for %s', relPath)
          onIndexUpdated()
        }
      }
    },
  }
}

const headingRegex = /<h(\d)[^>]*>(.*?<a[^>]* href="#[^"]*"[^>]*>[^<]*<\/a>)<\/h\1>/gi
const headingContentRegex = /(.*)<a[^>]* href="#([^"]*)"[^>]*>[^<]*<\/a>/i

/**
 * Splits HTML into sections based on headings
 */
function* splitPageIntoSections(html: string) {
  const result = html.split(headingRegex)
  result.shift()
  let parentTitles: string[] = []
  for (let i = 0; i < result.length; i += 3) {
    const level = Number.parseInt(result[i]) - 1
    const heading = result[i + 1]
    const headingResult = headingContentRegex.exec(heading)
    const title = clearHtmlTags(headingResult?.[1] ?? '').trim()
    const anchor = headingResult?.[2] ?? ''
    const content = result[i + 2]
    if (!title || !content)
      continue
    let titles = parentTitles.slice(0, level)
    titles[level] = title
    titles = titles.filter(Boolean)
    yield { anchor, titles, text: getSearchableText(content) }
    if (level === 0) {
      parentTitles = [title]
    }
    else {
      parentTitles[level] = title
    }
  }
}

function getSearchableText(content: string) {
  return clearHtmlTags(content)
}

/**
 * Extract LaTeX source from KaTeX annotation element.
 * KaTeX renders `<annotation encoding="application/x-tex">...</annotation>` inside
 * a `<semantics>` block. We pull out that plain-text LaTeX so that math formulas
 * remain searchable (e.g. "E = mc^2") instead of becoming garbled span fragments.
 */
function replaceKatexWithSource(html: string): string {
  // Replace each KaTeX wrapper with the original LaTeX from <annotation>
  return html.replace(
    /<span class="katex(?:-display)?">[\s\S]*?<annotation encoding="application\/x-tex">([\s\S]*?)<\/annotation>[\s\S]*?<\/span>(?:<\/span>)?/g,
    (_, tex) => ` ${tex} `,
  )
}

function clearHtmlTags(str: string) {
  // First, replace KaTeX-rendered blocks with their LaTeX source
  str = replaceKatexWithSource(str)
  // Then strip remaining HTML tags
  return str.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ')
}
