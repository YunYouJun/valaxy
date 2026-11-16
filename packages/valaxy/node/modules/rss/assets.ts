import type { Plugin } from 'vite'
import type { ResolvedValaxyOptions } from '../../types'
import { dirname, isAbsolute, join, relative, resolve, sep } from 'node:path'
import { consola } from 'consola'
import fs from 'fs-extra'
import { Parser } from 'htmlparser2'
import MagicString from 'magic-string'

type RssAssetOptions = Pick<ResolvedValaxyOptions, 'tempDir' | 'userRoot'>

interface RssAssetManifest {
  outDir: string
  base: string
  files: [source: string, emitted: string][]
}

function assetManifestPath(options: RssAssetOptions) {
  return join(options.tempDir || join(options.userRoot, '.valaxy'), 'rss-assets.json')
}

function sourceKey(file: string, root: string) {
  const path = relative(root, file)
  if (path && path !== '..' && !path.startsWith(`..${sep}`) && !isAbsolute(path))
    return path.split(sep).join('/')
}

/** Save Vite's source identities locally so standalone `valaxy rss` can reuse them. */
export function createRssAssetsPlugin(options: RssAssetOptions): Plugin {
  return {
    name: 'valaxy:rss-assets',
    apply: 'build',
    async writeBundle(output, bundle) {
      const { config } = this.environment
      // SSG builds the server into a separate temporary directory after the client.
      if (config.build.ssr || !output.dir)
        return

      const files = new Map<string, string>()
      for (const asset of Object.values(bundle)) {
        if (asset.type !== 'asset')
          continue
        for (const original of asset.originalFileNames) {
          const key = sourceKey(resolve(config.root, original), options.userRoot)
          if (key)
            files.set(key, asset.fileName)
        }
      }
      const manifest: RssAssetManifest = {
        outDir: resolve(config.root, output.dir),
        base: config.base,
        files: [...files],
      }
      await fs.outputJson(assetManifestPath(options), manifest)
    },
  }
}

export async function readBuiltAssetUrls(options: RssAssetOptions, outDir: string, siteUrl: string) {
  try {
    const manifest: RssAssetManifest = await fs.readJson(assetManifestPath(options))
    if (manifest.outDir !== outDir)
      return
    const base = new URL(manifest.base || './', siteUrl)
    return new Map(manifest.files.map(([source, emitted]) => [
      source,
      new URL(emitted.split('/').map(encodeURIComponent).join('/'), base).href,
    ]))
  }
  catch {
    // Builds made without a manifest still use the legacy HTML lookup.
  }
}

export function findBuiltAsset(url: string, markdownFile: string, root: string, assets: Map<string, string>) {
  let pathname = url
  try {
    pathname = decodeURIComponent(pathname)
  }
  catch {
    // A literal percent can be part of a filename.
  }
  if (isAbsolute(pathname))
    return
  const key = sourceKey(resolve(dirname(markdownFile), pathname), root)
  if (key)
    return assets.get(key)
}

/** Older builds only have rendered HTML; do not guess when two files have the same name. */
export async function readLegacyImageUrls(htmlPath: string, siteUrl: string) {
  const images = new Map<string, string | null>()
  try {
    if (!await fs.pathExists(htmlPath))
      return images

    const html = await fs.readFile(htmlPath, 'utf-8')
    new Parser({
      onopentag(name, { src }) {
        if (name !== 'img' || !src)
          return
        const pathname = src.split(/[?#]/, 1)[0]
        const match = pathname.match(/\/assets\/([^/]+)\.[a-z0-9]+\.([a-z0-9]+)$/i)
        if (!match)
          return
        const original = `${match[1]}.${match[2]}`
        const url = new URL(pathname, siteUrl).href
        const existing = images.get(original)
        images.set(original, existing !== undefined && existing !== url ? null : url)
      },
    }).end(html)
  }
  catch (error) {
    consola.debug(`Failed to extract image paths from ${htmlPath}:`, error)
  }
  return images
}

export function rewriteSourceAttributes(html: string, resolveUrl: (src: string, isImage: boolean) => string | undefined) {
  const output = new MagicString(html)
  let isImage = false
  const parser = new Parser({
    onopentagname(name) {
      isImage = name === 'img'
    },
    onattribute(name, src) {
      if (name !== 'src')
        return
      const url = resolveUrl(src, isImage)
      if (url !== undefined)
        output.overwrite(parser.startIndex, parser.endIndex, `src="${url.replaceAll('&', '&amp;').replaceAll('"', '&quot;').replaceAll('<', '&lt;')}"`)
    },
  })
  parser.end(html)
  return output.toString()
}
