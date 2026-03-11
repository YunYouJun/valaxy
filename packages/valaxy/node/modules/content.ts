import type { ContentItem, ContentLoader, ContentLoaderContext } from '../types/loader'
import { createHash } from 'node:crypto'
import path from 'node:path'
import { consola } from 'consola'
import { colors } from 'consola/utils'
import fs from 'fs-extra'
import { resolve } from 'pathe'
import { defineValaxyModule } from '.'

interface ManifestEntry {
  digest: string
}

type Manifest = Record<string, ManifestEntry>

function computeDigest(content: string): string {
  return createHash('md5').update(content).digest('hex')
}

function getManifestPath(cacheDir: string, loaderName: string): string {
  return resolve(cacheDir, `.manifest-${loaderName}.json`)
}

async function readManifest(manifestPath: string): Promise<Manifest> {
  try {
    return await fs.readJson(manifestPath)
  }
  catch {
    return {}
  }
}

async function writeManifest(manifestPath: string, manifest: Manifest): Promise<void> {
  await fs.writeJson(manifestPath, manifest, { spaces: 2 })
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
    const prevManifest = await readManifest(manifestPath)
    const nextManifest: Manifest = {}

    let items: ContentItem[]
    try {
      items = await loader.load(ctx)
    }
    catch (e) {
      consola.error(`[content-loader] Failed to load content from ${loaderLabel}:`, e)
      continue
    }

    let written = 0
    let cached = 0

    for (let item of items) {
      if (loader.transform) {
        try {
          item = await loader.transform(item)
        }
        catch (e) {
          consola.error(`[content-loader] Failed to transform ${colors.dim(item.path)}:`, e)
          continue
        }
      }

      const filePath = resolve(pagesDir, item.path)
      const digest = item.digest || computeDigest(item.content)

      nextManifest[item.path] = { digest }

      // Skip write if content unchanged
      if (prevManifest[item.path]?.digest === digest && await fs.pathExists(filePath)) {
        cached++
        continue
      }

      await fs.ensureDir(path.dirname(filePath))
      await fs.writeFile(filePath, item.content, 'utf-8')
      written++
    }

    // Remove stale files from previous manifest that no longer exist in current output
    const staleKeys = Object.keys(prevManifest).filter(key => !(key in nextManifest))
    for (const key of staleKeys) {
      const stalePath = resolve(pagesDir, key)
      if (await fs.pathExists(stalePath)) {
        await fs.remove(stalePath)
        consola.info(`[content-loader] Removed stale: ${colors.dim(key)}`)
      }
    }

    await writeManifest(manifestPath, nextManifest)

    consola.success(
      `[content-loader] ${loaderLabel}: ${colors.green(String(written))} written, `
      + `${colors.dim(String(cached))} cached, `
      + `${colors.dim(String(staleKeys.length))} removed`,
    )
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
