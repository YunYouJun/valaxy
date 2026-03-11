import type { ViteDevServer } from 'vite'
import type { ServerFunctions } from '../../rpc'
import type { ValaxyDevtoolsOptions } from './types'
import process from 'node:process'
import dayjs from 'dayjs'
import fg from 'fast-glob'
import fs from 'fs-extra'
import matter from 'gray-matter'
import pathe from 'pathe'

function ensurePrefix(prefix: string, str: string) {
  if (!str.startsWith(prefix))
    return prefix + str
}

/**
 * Extract a string field value from a TS/JS source file.
 * Handles both single and double quoted strings.
 */
function extractStringField(content: string, field: string): string {
  const regex = new RegExp(`\\b${field}\\s*:\\s*['"\`]([^'"\`]*)['"\`]`)
  const match = content.match(regex)
  return match?.[1] || ''
}

/**
 * Extract a boolean field value from a TS/JS source file.
 */
function extractBooleanField(content: string, field: string, defaultValue: boolean): boolean {
  const regex = new RegExp(`\\b${field}\\s*:\\s*(true|false)`)
  const match = content.match(regex)
  if (!match)
    return defaultValue
  return match[1] === 'true'
}

/**
 * Extract item configs from a collection's index.ts items array.
 * Returns items with key, title, and link in the order they appear in the config.
 */
function extractConfigItems(content: string): { key?: string, title?: string, link?: string }[] {
  const items: { key?: string, title?: string, link?: string }[] = []
  // Match each object literal { ... } in the items array
  const itemsMatch = content.match(/items\s*:\s*\[([^\]]*)\]/)
  if (!itemsMatch)
    return items

  const itemsContent = itemsMatch[1]
  const objectRegex = /\{([^}]*)\}/g
  let objMatch: RegExpExecArray | null
  // eslint-disable-next-line no-cond-assign
  while ((objMatch = objectRegex.exec(itemsContent)) !== null) {
    const block = objMatch[1]
    const keyMatch = block.match(/key\s*:\s*['"`]([^'"`]*)['"`]/)
    const titleMatch = block.match(/title\s*:\s*['"`]([^'"`]*)['"`]/)
    const linkMatch = block.match(/link\s*:\s*['"`]([^'"`]*)['"`]/)
    items.push({
      key: keyMatch?.[1],
      title: titleMatch?.[1],
      link: linkMatch?.[1],
    })
  }
  return items
}

export function getFunctions(server: ViteDevServer, devtoolsOptions: ValaxyDevtoolsOptions): ServerFunctions {
  const userRoot = (devtoolsOptions.userRoot || process.cwd()).replace(/\\/g, '/')
  // const userRoot = GLOBAL_STATE.valaxyApp?.options.userRoot || process.cwd()
  // const userRoot = process.cwd()
  // const userRoot = server.config.root

  function getRoutePath(filePath: string) {
    const relativePath = pathe.relative(pathe.resolve(userRoot, 'pages'), filePath).slice(0, -'.md'.length)
    return ensurePrefix('/', relativePath)
  }

  return {
    async getOptions() {
      return {
        userRoot,
      }
    },

    async getPostList() {
      const files = await fg(`${userRoot}/pages/posts/**/*.md`)

      const posts = []
      for await (const file of files) {
        const md = await fs.readFile(file, 'utf-8')
        const { data } = matter(md)
        posts.push({
          routePath: getRoutePath(file),
          frontmatter: data,
          filePath: file,
        })
      }

      return {
        // sort by updated
        posts: posts.sort((a, b) => {
          const bDateValue = dayjs(b.frontmatter.updated || b.frontmatter.date).valueOf()
          const aDateValue = dayjs(a.frontmatter.updated || a.frontmatter.date).valueOf()
          return bDateValue - aDateValue
        }),
        root: userRoot,
      }
    },

    async getPageData(pagePath: string) {
      const relativePath = pagePath.startsWith('/') ? pagePath.slice(1) : pagePath
      const file = pathe.resolve(userRoot, relativePath)
      const { data } = matter(file)

      return {
        routePath: getRoutePath(file),
        filePath: file,
        frontmatter: data,
      }
    },

    async getCollectionList() {
      const collectionsRoot = pathe.resolve(userRoot, 'pages', 'collections')
      if (!await fs.pathExists(collectionsRoot))
        return []

      const entries = await fs.readdir(collectionsRoot, { withFileTypes: true })
      const dirs = entries.filter(f => f.isDirectory()).map(f => f.name)

      const result = []

      for (const dir of dirs) {
        const indexPath = pathe.join(collectionsRoot, dir, 'index.ts')
        if (!await fs.pathExists(indexPath))
          continue

        // Read the index.ts to extract collection config fields
        const indexContent = await fs.readFile(indexPath, 'utf-8')
        const title = extractStringField(indexContent, 'title')
        const cover = extractStringField(indexContent, 'cover')
        const description = extractStringField(indexContent, 'description')
        const collapse = extractBooleanField(indexContent, 'collapse', true)

        // Read all .md files in the directory
        const mdFiles = await fg(`${collectionsRoot}/${dir}/*.md`)
        const items = []
        for (const file of mdFiles) {
          const basename = pathe.basename(file, '.md')
          if (basename === 'index')
            continue
          const md = await fs.readFile(file, 'utf-8')
          const { data } = matter(md)
          items.push({
            title: data.title || basename,
            key: basename,
            filePath: file,
            frontmatter: data,
          })
        }

        // Sort items by collection config order if available, otherwise by date
        const configItems = extractConfigItems(indexContent)
        if (configItems.length > 0) {
          // Merge link-only items from config (they have no .md files)
          for (const ci of configItems) {
            if (ci.link && !items.find(i => i.key === ci.key)) {
              items.push({
                title: ci.title || ci.link,
                key: ci.key || '',
                link: ci.link,
                filePath: '',
                frontmatter: {},
              })
            }
          }

          // Build order map from config — use key for key-based items, link for link-only items
          const orderMap = new Map<string, number>()
          configItems.forEach((ci, i) => {
            if (ci.key)
              orderMap.set(`key:${ci.key}`, i)
            else if (ci.link)
              orderMap.set(`link:${ci.link}`, i)
          })

          items.sort((a, b) => {
            const aIdx = (a.key ? orderMap.get(`key:${a.key}`) : orderMap.get(`link:${a.link}`)) ?? Infinity
            const bIdx = (b.key ? orderMap.get(`key:${b.key}`) : orderMap.get(`link:${b.link}`)) ?? Infinity
            if (aIdx === bIdx)
              return 0
            return aIdx - bIdx
          })
        }
        else {
          items.sort((a, b) => {
            const aVal = dayjs(a.frontmatter.date).valueOf()
            const bVal = dayjs(b.frontmatter.date).valueOf()
            const aDate = Number.isNaN(aVal) ? 0 : aVal
            const bDate = Number.isNaN(bVal) ? 0 : bVal
            return aDate - bDate
          })
        }

        const key = extractStringField(indexContent, 'key') || dir

        result.push({
          key,
          title,
          cover,
          description,
          collapse,
          dirPath: pathe.join(collectionsRoot, dir),
          items,
        })
      }

      return result
    },
  }
}
