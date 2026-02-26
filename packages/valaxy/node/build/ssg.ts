import type { InlineConfig } from 'vite'
import type { ValaxyNode } from '../types'
import type { RenderResult } from './render'
import { execFileSync } from 'node:child_process'
import { readFile, rm } from 'node:fs/promises'
import { isAbsolute, resolve } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'
import v8 from 'node:v8'
import { consola } from 'consola'
import { colors } from 'consola/utils'
import pMap from 'p-map'
import { mergeConfig as mergeViteConfig, build as viteBuild } from 'vite'
import generateSitemap from 'vite-ssg-sitemap'
import { defaultViteConfig } from '../constants'
import { disposeMdItInstance, disposePreviewMdItInstance } from '../plugins/markdown'
import { disposeSharedHighlighter } from '../plugins/markdown/highlighterCache'
import { clearMarkdownCache } from '../plugins/markdown/markdownToVue'
import { ViteValaxyPlugins } from '../plugins/preset'
import { clearBundleCache } from './bundle'
import { renderPage } from './render'

/**
 * Attempt to trigger garbage collection if `--expose-gc` is enabled.
 */
function tryGC() {
  if (typeof globalThis.gc === 'function')
    globalThis.gc()
}

function getHeapLimitMB(): number {
  return v8.getHeapStatistics().heap_size_limit / 1024 / 1024
}

/**
 * Extract flat route paths from vue-router route records.
 */
function routesToPaths(routes: any[]): string[] {
  if (!routes)
    return ['/']

  const paths = new Set<string>()

  function getPaths(routes: any[], prefix = '') {
    prefix = prefix.replace(/\/$/g, '')
    for (const route of routes) {
      let path = route.path
      if (route.path != null) {
        path = prefix && !route.path.startsWith('/')
          ? `${prefix}${route.path ? `/${route.path}` : ''}`
          : route.path
        paths.add(path)
      }
      if (Array.isArray(route.children))
        getPaths(route.children, path)
    }
  }

  getPaths(routes)
  return Array.from(paths)
}

/**
 * Exclude dynamic route segments (`:param`, `*`).
 */
function defaultIncludedRoutes(paths: string[]): string[] {
  return paths.filter(i => !i.includes(':') && !i.includes('*'))
}

export interface ValaxySSGOptions {
  concurrency?: number
  onBeforePageRender?: (route: string, html: string) => Promise<string | void> | string | void
  onPageRendered?: (route: string, html: string) => Promise<string | void> | string | void
  onFinished?: () => Promise<void> | void
  includedRoutes?: (paths: string[], routes: any[]) => string[] | Promise<string[]>
  includeAllRoutes?: boolean
}

export async function ssgBuild(
  valaxyApp: ValaxyNode,
  viteConfig: InlineConfig = {},
  userSsgOptions: ValaxySSGOptions = {},
) {
  const { options } = valaxyApp

  // === Process respawn for --expose-gc and sufficient heap ===
  if (!process.env.__VALAXY_SSG_NO_RESPAWN__) {
    const needGC = typeof globalThis.gc !== 'function'
    const currentHeapMB = getHeapLimitMB()
    const minRequiredMB = 2048
    const needMoreHeap = currentHeapMB < minRequiredMB

    if (needGC || needMoreHeap) {
      const extraNodeArgs: string[] = []
      if (needGC)
        extraNodeArgs.push('--expose-gc')
      if (needMoreHeap)
        extraNodeArgs.push(`--max-old-space-size=${minRequiredMB}`)

      consola.info(`Restarting SSG build with ${extraNodeArgs.join(' ')} (current heap: ${Math.round(currentHeapMB)} MB)...`)

      const filteredExecArgv = needMoreHeap
        ? process.execArgv.filter(arg => !arg.startsWith('--max-old-space-size') && !arg.startsWith('--max_old_space_size'))
        : process.execArgv
      const nodeArgs = [...extraNodeArgs, ...filteredExecArgv, ...process.argv.slice(1)]

      try {
        execFileSync(process.execPath, nodeArgs, {
          cwd: process.cwd(),
          stdio: 'inherit',
          env: { ...process.env, __VALAXY_SSG_NO_RESPAWN__: '1' },
          timeout: 30 * 60 * 1000,
        })
        return
      }
      catch (e: any) {
        if (e.signal) {
          throw new Error(`SSG build was killed by signal ${e.signal}${e.signal === 'SIGTERM' ? ' (possible timeout)' : ''}`, { cause: e })
        }
        if (e.status != null && e.status !== 0) {
          throw new Error(`SSG build failed (exit code: ${e.status})`, { cause: e })
        }
        throw e
      }
    }
  }

  const cdnModuleNames = (options.config.cdn?.modules || []).map((m: any) => m.name)
  const configOutDir = (viteConfig.build?.outDir as string) || 'dist'
  const outDir = isAbsolute(configOutDir) ? configOutDir : resolve(options.userRoot, configOutDir)
  const ssgTemp = resolve(outDir, '../.vite-ssg-temp')

  const defaultConfig: InlineConfig = {
    ...defaultViteConfig,
    plugins: await ViteValaxyPlugins(valaxyApp),
    ssr: {
      noExternal: ['workbox-window', /vue-i18n/, '@vue/devtools-api', ...cdnModuleNames],
    },
    build: {
      sourcemap: false,
    },
  }

  const inlineConfig: InlineConfig = mergeViteConfig(defaultConfig, viteConfig)

  try {
    // === Step 1: Client Build (with SSR manifest) ===
    consola.info('Building client bundle...')
    await viteBuild(mergeViteConfig(inlineConfig, {
      build: {
        ssrManifest: true,
        outDir,
      },
    }))

    // === Step 2: Server Build ===
    consola.info('Building server bundle...')
    await viteBuild(mergeViteConfig(inlineConfig, {
      build: {
        ssr: resolve(options.clientRoot, 'entry-ssr.ts'),
        outDir: ssgTemp,
        minify: false,
        cssCodeSplit: false,
        rollupOptions: {
          output: {
            entryFileNames: '[name].mjs',
          },
        },
      },
    }))

    // === Step 3: Release build resources ===
    consola.info('Releasing build resources...')
    disposeMdItInstance()
    disposePreviewMdItInstance()
    disposeSharedHighlighter()
    clearMarkdownCache()
    tryGC()

    // === Step 4: Load SSR entry and discover routes ===
    const entryPath = resolve(ssgTemp, 'entry-ssr.mjs')
    const { render, routes } = await import(pathToFileURL(entryPath).href) as {
      render: (route: string) => Promise<RenderResult>
      routes: any[]
    }

    let routePaths: string[]
    if (userSsgOptions.includedRoutes) {
      routePaths = await userSsgOptions.includedRoutes(routesToPaths(routes), routes)
    }
    else if (userSsgOptions.includeAllRoutes) {
      routePaths = routesToPaths(routes)
    }
    else {
      routePaths = defaultIncludedRoutes(routesToPaths(routes))
    }

    // Generate pagination routes if enabled
    if (options.config.build.ssgForPagination) {
      const posts = routePaths.filter(path => path.startsWith('/posts/'))
      const pageNumber = Math.ceil(posts.length / options.config.siteConfig.pageSize)
      consola.info(`Generate ${colors.yellow(pageNumber)} pages for pagination.`)
      for (let i = 1; i <= pageNumber; i++)
        routePaths.push(`/page/${i}`)
    }

    // === Step 5: Read template and SSR manifest ===
    const template = await readFile(resolve(outDir, 'index.html'), 'utf-8')
    const ssrManifest = JSON.parse(
      await readFile(resolve(outDir, '.vite/ssr-manifest.json'), 'utf-8'),
    )

    // === Step 6: Render pages concurrently ===
    const concurrency = userSsgOptions.concurrency ?? 20
    consola.info(`Rendering ${colors.yellow(routePaths.length)} pages (concurrency: ${colors.yellow(concurrency)})...`)

    await pMap(
      routePaths,
      route => renderPage({
        render,
        route,
        template,
        ssrManifest,
        outDir,
        onBeforePageRender: userSsgOptions.onBeforePageRender,
        onPageRendered: userSsgOptions.onPageRendered,
      }),
      { concurrency },
    )

    consola.success(`${routePaths.length} pages rendered.`)
  }
  finally {
    // === Step 7: Cleanup temporary files ===
    await rm(ssgTemp, { recursive: true, force: true }).catch(() => {})
    await rm(resolve(outDir, '.vite'), { recursive: true, force: true }).catch(() => {})
  }

  // === Step 8: Sitemap and user callbacks ===
  clearBundleCache()
  generateSitemap({
    hostname: options.config.siteConfig.url,
  })

  if (userSsgOptions.onFinished)
    await userSsgOptions.onFinished()
}
