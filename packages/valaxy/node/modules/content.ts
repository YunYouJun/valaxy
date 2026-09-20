import type { ContentItem, ContentLoader, ContentLoaderContext } from '../types/loader'
import { createHash } from 'node:crypto'
import { consola } from 'consola'
import { colors } from 'consola/utils'
import fs from 'fs-extra'
import { isAbsolute, normalize, resolve } from 'pathe'
import { defineValaxyModule } from '.'
import { publishContentTransaction, recoverContentTransaction } from '../utils/contentTransaction'
import { discoverPageFiles, pagePathToRoute } from '../utils/pageSources'

interface ManifestEntry {
  digest: string
}

type Manifest = Record<string, ManifestEntry>

function computeDigest(content: string): string {
  return createHash('md5').update(content).digest('hex')
}

function getManifestPath(cacheDir: string, loaderName: string): string {
  const safeName = loaderName.replace(/[^\w.-]/g, '_')
  return resolve(cacheDir, `.manifest-${safeName}.json`)
}

async function readManifest(manifestPath: string): Promise<Manifest> {
  try {
    return await fs.readJson(manifestPath)
  }
  catch {
    return {}
  }
}

/**
 * Load content from all loaders and write .md files to cache directory.
 * Uses digest-based incremental caching to skip unchanged files.
 */
export async function loadAllContent(
  loaders: ContentLoader[],
  ctx: ContentLoaderContext,
): Promise<void> {
  const pagesDir = resolve(ctx.cacheDir, 'pages')
  await fs.ensureDir(pagesDir)

  for (const loader of loaders) {
    const loaderLabel = colors.cyan(loader.name)
    consola.start(`[content-loader] Loading content from ${loaderLabel}...`)

    const manifestPath = getManifestPath(ctx.cacheDir, loader.name)
    const transaction = `${manifestPath}.transaction`
    await recoverContentTransaction(transaction)
    const prevManifest = await readManifest(manifestPath)
    const nextManifest: Manifest = {}

    const items: ContentItem[] = []
    const routePaths = new Set<string>()
    try {
      for (const original of await loader.load(ctx)) {
        let item: ContentItem
        try {
          item = loader.transform ? await loader.transform(original) : original
          const normalizedPath = normalize(item.path)
          const route = pagePathToRoute(normalizedPath).replace(/\/$/, '')
          if (isAbsolute(normalizedPath) || normalizedPath.startsWith('..') || item.path.includes('\\') || !normalizedPath.endsWith('.md'))
            throw new Error(`Invalid content path: ${item.path}`)
          if (routePaths.has(route))
            throw new Error(`Duplicate content route: ${item.path}`)
          for (const candidate of [normalizedPath, `${route}.md`, route ? `${route}/index.md` : 'index.md']) {
            if (!prevManifest[candidate] && await fs.pathExists(resolve(pagesDir, candidate)))
              throw new Error(`Content path is owned by another loader: ${item.path}`)
          }
          if (ctx.node.options.userRoot) {
            const userPages = resolve(ctx.node.options.userRoot, 'pages')
            if (await fs.pathExists(resolve(userPages, `${route}.md`)) || await fs.pathExists(resolve(userPages, route, 'index.md')))
              throw new Error(`Content route conflicts with a user page: ${item.path}`)
          }
          routePaths.add(route)
          items.push({ ...item, path: normalizedPath })
        }
        catch (error) {
          if (loader.strict)
            throw error
          consola.warn(`[content-loader] Skipping ${original.path}:`, error)
        }
      }
    }
    catch (error) {
      consola.error(`[content-loader] Failed to load content from ${loaderLabel}:`, error)
      if (loader.strict && ctx.mode === 'build')
        throw error
      continue
    }

    let written = 0
    let cached = 0
    const changes: { path: string, content?: string }[] = []

    for (const item of items) {
      const normalizedPath = item.path
      const filePath = resolve(pagesDir, normalizedPath)
      const digest = item.digest || computeDigest(item.content)

      // Use normalizedPath as manifest key to handle non-canonical inputs (e.g. ./posts/a.md)
      nextManifest[normalizedPath] = { digest }

      // Skip write if content unchanged
      if (prevManifest[normalizedPath]?.digest === digest && await fs.pathExists(filePath)) {
        cached++
        continue
      }

      changes.push({ path: filePath, content: item.content })
      written++
    }

    // Remove stale files from previous manifest that no longer exist in current output
    const staleKeys = Object.keys(prevManifest).filter(key => !(key in nextManifest))
    for (const key of staleKeys) {
      const stalePath = resolve(pagesDir, normalize(key))
      if (stalePath.startsWith(pagesDir) && await fs.pathExists(stalePath)) {
        changes.push({ path: stalePath })
      }
    }

    changes.push({ path: manifestPath, content: JSON.stringify(nextManifest, null, 2) })
    try {
      await publishContentTransaction(transaction, changes)
    }
    catch (error) {
      consola.error(`[content-loader] Failed to publish ${loaderLabel}; previous content restored:`, error)
      if (loader.strict && ctx.mode === 'build')
        throw error
      continue
    }
    await loader.onLoaded?.(ctx)

    consola.success(
      `[content-loader] ${loaderLabel}: ${colors.green(String(written))} written, `
      + `${colors.dim(String(cached))} cached, `
      + `${colors.dim(String(staleKeys.length))} removed`,
    )
  }

  if (ctx.node.options.userRoot && ctx.node.options.pages) {
    const pages = [...(await discoverPageFiles(ctx.node.options.userRoot)).keys()].sort()
    ctx.node.options.pages.splice(0, ctx.node.options.pages.length, ...pages)
  }
}

export const contentModule = defineValaxyModule({
  setup(node) {
    const loaders = node.options.config.loaders
    if (!loaders?.length)
      return

    node.hook('build:before', async () => {
      const cacheDir = resolve(node.options.tempDir, 'content')
      const ctx: ContentLoaderContext = {
        node,
        cacheDir,
        mode: 'build',
      }

      await node.hooks.callHook('content:before-load')
      await loadAllContent(loaders, ctx)
      await node.hooks.callHook('content:loaded')
    })
  },
})
