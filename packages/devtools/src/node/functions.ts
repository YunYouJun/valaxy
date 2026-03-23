import type { ViteDevServer } from 'vite'
import type { BatchFrontmatterOperation, ServerFunctions } from '../../rpc'
import type { ValaxyDevtoolsOptions } from './types'
import process from 'node:process'
import dayjs from 'dayjs'
import fg from 'fast-glob'
import fs from 'fs-extra'
import matter from 'gray-matter'
import pathe from 'pathe'
import { DANGEROUS_FIELD_KEYS, readConfigs, writeConfigField } from './utils/config-rw'
import { migration } from './utils/migration'

function ensurePrefix(prefix: string, str: string) {
  if (!str.startsWith(prefix))
    return prefix + str
  return str
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

    async updateFrontmatter(req) {
      const { filePath, frontmatter: newFm } = req
      if (!fs.existsSync(filePath))
        throw new Error(`File not found: ${filePath}`)
      const rawMd = await fs.readFile(filePath, 'utf-8')
      const matterFile = matter(rawMd)
      matterFile.data = newFm
      const newMd = matter.stringify(matterFile.content, matterFile.data)
      await fs.writeFile(filePath, newMd)
      return { success: true }
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
            if (ci.link && !items.some(i => i.key === ci.key)) {
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

        const itemsSectionIndex = indexContent.indexOf('items:')
        const topLevelArea = itemsSectionIndex === -1
          ? indexContent
          : indexContent.slice(0, itemsSectionIndex)
        const key = extractStringField(topLevelArea, 'key') || dir

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

    async batchUpdateFrontmatter(filePaths: string[], operations: BatchFrontmatterOperation[]) {
      const pagesDir = pathe.resolve(userRoot, 'pages')

      const result = {
        total: filePaths.length,
        updated: 0,
        errors: [] as { filePath: string, error: string }[],
      }

      for (const filePath of filePaths) {
        try {
          // Validate file path is within userRoot/pages and is a .md file
          const resolved = pathe.resolve(filePath)
          if (!resolved.startsWith(pagesDir) || !resolved.endsWith('.md')) {
            result.errors.push({ filePath, error: 'Invalid file path: must be within pages directory and end with .md' })
            continue
          }

          if (!await fs.pathExists(filePath)) {
            result.errors.push({ filePath, error: 'File not found' })
            continue
          }

          const rawMd = await fs.readFile(filePath, 'utf-8')
          const matterFile = matter(rawMd)
          let modified = false

          for (const op of operations) {
            // Reject dangerous keys to prevent prototype pollution
            if (DANGEROUS_FIELD_KEYS.has(op.key) || (op.newKey && DANGEROUS_FIELD_KEYS.has(op.newKey)))
              continue

            switch (op.type) {
              case 'set':
                matterFile.data[op.key] = op.value
                modified = true
                break
              case 'delete':
                if (op.key in matterFile.data) {
                  delete matterFile.data[op.key]
                  modified = true
                }
                break
              case 'rename':
                if (op.key in matterFile.data && op.newKey) {
                  matterFile.data[op.newKey] = matterFile.data[op.key]
                  delete matterFile.data[op.key]
                  modified = true
                }
                break
            }
          }

          if (modified) {
            const newMd = matter.stringify(matterFile.content, matterFile.data)
            await fs.writeFile(filePath, newMd)
            result.updated++
          }
        }
        catch (e: any) {
          result.errors.push({ filePath, error: e.message || String(e) })
        }
      }

      return result
    },

    async getConfig() {
      return readConfigs(userRoot)
    },

    async updateConfigField(configType, fieldPath, value) {
      try {
        await writeConfigField(userRoot, configType, fieldPath, value)
        return { success: true }
      }
      catch (e: any) {
        return { success: false, error: e.message || String(e) }
      }
    },

    async runMigration(filePaths, frontmatter) {
      const workers = filePaths.map(path => migration(path, frontmatter))
      await Promise.all(workers)
      return { success: true }
    },

    async createPost(options) {
      try {
        const { title, path: customPath, tags, categories } = options
        const postsDir = pathe.resolve(userRoot, 'pages', 'posts')

        let filePath: string
        if (customPath) {
          // User specified a path like 'my-post.md' or 'sub/my-post.md'
          const normalized = customPath.endsWith('.md') ? customPath : `${customPath}.md`
          filePath = pathe.resolve(postsDir, normalized)
        }
        else {
          // Auto-generate from title (kebab-case)
          const slug = title
            .toLowerCase()
            .replace(/[\s_]+/g, '-')
            .replace(/[^\w\u4E00-\u9FFF-]/g, '')
            .replace(/-+/g, '-')
            .replace(/^-|-$/g, '')
            || `post-${Date.now()}`
          filePath = pathe.resolve(postsDir, `${slug}.md`)
        }

        // Ensure parent directory exists
        await fs.ensureDir(pathe.dirname(filePath))

        // Ensure unique filename
        if (await fs.pathExists(filePath)) {
          const ext = pathe.extname(filePath)
          const base = filePath.slice(0, -ext.length)
          let counter = 1
          while (await fs.pathExists(filePath)) {
            filePath = `${base}-${counter}${ext}`
            counter++
          }
        }

        const now = dayjs().format('YYYY-MM-DD HH:mm:ss')
        const frontmatter: Record<string, unknown> = {
          title,
          date: now,
          updated: now,
          draft: true,
        }
        if (tags && tags.length > 0)
          frontmatter.tags = tags
        if (categories && categories.length > 0)
          frontmatter.categories = categories

        const content = matter.stringify('\n', frontmatter)
        await fs.writeFile(filePath, content, 'utf-8')

        return { success: true, filePath }
      }
      catch (e: any) {
        return { success: false, error: e.message || String(e) }
      }
    },
  }
}
