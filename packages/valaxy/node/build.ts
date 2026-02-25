import type { InlineConfig } from 'vite'
import type { ViteSSGOptions } from 'vite-ssg'
import type { ResolvedValaxyOptions, ValaxyNode } from './types'
import { execFileSync } from 'node:child_process'
import { join, resolve } from 'node:path'
import process from 'node:process'
import v8 from 'node:v8'
import { consola } from 'consola'

import { colors } from 'consola/utils'
import fs from 'fs-extra'
import { mergeConfig as mergeViteConfig, build as viteBuild } from 'vite'
import generateSitemap from 'vite-ssg-sitemap'
import { build as viteSsgBuild } from 'vite-ssg/node'
import { clearBundleCache } from './build/bundle'
import { defaultViteConfig } from './constants'
import { disposeMdItInstance, disposePreviewMdItInstance } from './plugins/markdown'
import { disposeSharedHighlighter } from './plugins/markdown/highlighterCache'
import { ViteValaxyPlugins } from './plugins/preset'
import { collectRedirects, writeRedirectFiles } from './utils/clientRedirects'

/**
 * Attempt to trigger garbage collection if `--expose-gc` is enabled.
 * Falls back to a no-op otherwise — safe to call unconditionally.
 */
function tryGC() {
  if (typeof globalThis.gc === 'function') {
    globalThis.gc()
  }
}

/**
 * Determine SSG concurrency based on the available JS heap size.
 *
 * Each concurrent page render creates a JSDOM instance + beasties CSS
 * processing, consuming ~100-200 MB. We read V8's heap_size_limit
 * (which reflects `--max-old-space-size`) and scale concurrency accordingly.
 */
function getHeapLimitMB(): number {
  return v8.getHeapStatistics().heap_size_limit / 1024 / 1024
}

function getSSGConcurrency(): number {
  const heapLimitMB = getHeapLimitMB()

  // Each concurrent page render holds a JSDOM instance (~30-50 MB) + Vue App +
  // beasties CSS processing (~20-40 MB).
  // V8's heap_size_limit is ~200 MB above --max-old-space-size, so thresholds
  // are set accordingly (e.g. 2560 covers --max-old-space-size=2048).
  let concurrency: number
  if (heapLimitMB <= 2560)
    concurrency = 1
  else if (heapLimitMB <= 3200)
    concurrency = 2
  else if (heapLimitMB <= 4300)
    concurrency = 4
  else if (heapLimitMB <= 8400)
    concurrency = 8
  else
    concurrency = 16

  consola.info(`SSG concurrency: ${colors.yellow(concurrency)} (heap limit: ${colors.yellow(Math.round(heapLimitMB))} MB)`)
  return concurrency
}

/**
 * Return beasties options or `false` to disable Critical CSS generation.
 *
 * Beasties loads the full CSS bundle into memory and creates a JSDOM-backed
 * HTML parser for **every** page it processes, consuming ~100-200 MB on top
 * of what vite-ssg's own JSDOM instance already uses. Under tight heap
 * limits (≤ 2 GB) this alone is enough to cause OOM, so we disable it.
 */
function getSSGBeastiesOptions(): ViteSSGOptions['beastiesOptions'] {
  const heapLimitMB = getHeapLimitMB()

  // V8's heap_size_limit includes young generation overhead (~200 MB above
  // --max-old-space-size), so we use 2560 to cover --max-old-space-size=2048.
  if (heapLimitMB <= 2560) {
    consola.warn(`Heap limit ${Math.round(heapLimitMB)} MB is too low for beasties — Critical CSS generation disabled`)
    return false
  }

  return {
    preload: 'media',
    reduceInlineStyles: false,
  }
}

export async function build(
  valaxyApp: ValaxyNode,
  viteConfig: InlineConfig = defaultViteConfig,
) {
  const inlineConfig = mergeViteConfig(viteConfig, {
    ...defaultViteConfig,
    plugins: await ViteValaxyPlugins(valaxyApp),
  })

  await viteBuild(inlineConfig)
}

export async function ssgBuild(
  valaxyApp: ValaxyNode,
  viteConfig: InlineConfig = {},
) {
  // SSG builds run two Vite builds (client + server) then render all pages
  // with JSDOM, requiring both --expose-gc (so tryGC() works) and sufficient
  // heap space. When either is missing, respawn this process with correct flags.
  if (!process.env.__VALAXY_SSG_NO_RESPAWN__) {
    const needGC = typeof globalThis.gc !== 'function'
    // Two Vite builds + SSG rendering typically need ~3-4 GB. If the current
    // heap limit is below that, bump it to 4096 MB to avoid OOM.
    const currentHeapMB = getHeapLimitMB()
    const minRequiredMB = 4096
    const needMoreHeap = currentHeapMB < minRequiredMB

    if (needGC || needMoreHeap) {
      const extraNodeArgs: string[] = []
      if (needGC)
        extraNodeArgs.push('--expose-gc')
      if (needMoreHeap)
        extraNodeArgs.push(`--max-old-space-size=${minRequiredMB}`)

      consola.info(`Restarting SSG build with ${extraNodeArgs.join(' ')} (current heap: ${Math.round(currentHeapMB)} MB)...`)

      // Filter out any existing --max-old-space-size from execArgv to avoid conflicts
      const filteredExecArgv = needMoreHeap
        ? process.execArgv.filter(arg => !arg.startsWith('--max-old-space-size') && !arg.startsWith('--max_old_space_size'))
        : process.execArgv
      const nodeArgs = [...extraNodeArgs, ...filteredExecArgv, ...process.argv.slice(1)]

      try {
        execFileSync(process.execPath, nodeArgs, {
          cwd: process.cwd(),
          stdio: 'inherit',
          env: { ...process.env, __VALAXY_SSG_NO_RESPAWN__: '1' },
          timeout: 30 * 60 * 1000, // 30 min timeout
        })
        // Child process completed successfully — skip running SSG in this process
        return
      }
      catch (e: any) {
        if (e.signal) {
          throw new Error(`SSG build was killed by signal ${e.signal}${e.signal === 'SIGTERM' ? ' (possible timeout)' : ''}`, { cause: e })
        }
        if (e.status != null && e.status !== 0) {
          throw new Error(`SSG build failed (exit code: ${e.status})`, { cause: e })
        }
        // If execFileSync itself fails for other reasons, re-throw
        throw e
      }
    }
  }

  const { options } = valaxyApp
  const cdnModuleNames = (options.config.cdn?.modules || []).map(m => m.name)
  const defaultConfig: InlineConfig = {
    ...defaultViteConfig,
    plugins: await ViteValaxyPlugins(valaxyApp),
    ssr: {
      // TODO: workaround until they support native ESM
      noExternal: ['workbox-window', /vue-i18n/, '@vue/devtools-api', ...cdnModuleNames],
    },
    build: {
      // SSR bundle is a temporary artifact deleted after rendering — sourcemaps are never used
      sourcemap: false,
    },
  }

  const inlineConfig: InlineConfig = mergeViteConfig(defaultConfig, viteConfig)

  /**
   * User ssgOptions from `vite.config.ts` or `valaxy.config.ts > vite.ssgOptions`.
   *
   * `vite-ssg` internally merges via `Object.assign({}, config.ssgOptions, ssgOptions)`,
   * where the first argument (ssgOptions) takes priority over `config.ssgOptions`.
   *
   * We extract user ssgOptions from the resolved vite config, then:
   * 1. Shallow-merge with Valaxy defaults (user wins on top-level keys)
   * 2. Deep-merge `beastiesOptions` so user values extend (not replace) defaults
   * 3. Compose `onFinished` to always run Valaxy's sitemap + user callback
   *
   * The merged result is passed as the first argument to `viteSsgBuild`,
   * and `inlineConfig.ssgOptions` is deleted to prevent double-merging.
   *
   * @see https://github.com/antfu-collective/vite-ssg
   */
  const userSsgOptions: Partial<ViteSSGOptions> = inlineConfig.ssgOptions || {}

  // Remove ssgOptions from viteConfig to avoid double-merging inside vite-ssg
  delete inlineConfig.ssgOptions

  const valaxySsgDefaults: Partial<ViteSSGOptions> = {
    script: 'async',
    // html-minifier-terser parses inline JS/CSS into ASTs, consuming ~50-100 MB
    // per page. Disable under tight heap limits; the output gzips equally well.
    formatting: getHeapLimitMB() <= 2560 ? 'none' : 'minify',
    concurrency: getSSGConcurrency(),
    // Disable beasties (Critical CSS) when heap is constrained.
    // beasties loads full CSS into memory and parses HTML via JSDOM for every
    // page, adding ~100-200 MB to the rendering baseline. We fall back to a
    // simple <link rel="stylesheet"> which is fine for most sites.
    beastiesOptions: getSSGBeastiesOptions(),
    onFinished() {
      clearBundleCache()
      generateSitemap(
        {
          hostname: options.config.siteConfig.url,
        },
      )
    },

    // dirStyle default it flat
    // dirStyle: 'nested',
  }

  // User ssgOptions override Valaxy defaults
  // Users can customize beastiesOptions via `vite.ssgOptions.beastiesOptions`
  const mergedSsgOptions: Partial<ViteSSGOptions> = {
    ...valaxySsgDefaults,
    ...userSsgOptions,
  }

  // Deep-merge beastiesOptions so user values extend (not replace) Valaxy defaults
  if (userSsgOptions.beastiesOptions && valaxySsgDefaults.beastiesOptions) {
    mergedSsgOptions.beastiesOptions = {
      ...valaxySsgDefaults.beastiesOptions,
      ...userSsgOptions.beastiesOptions,
    }
  }

  // Compose onFinished: always run Valaxy's sitemap generation,
  // then call the user's onFinished if provided
  if (userSsgOptions.onFinished) {
    const valaxyOnFinished = valaxySsgDefaults.onFinished!
    const userOnFinished = userSsgOptions.onFinished
    mergedSsgOptions.onFinished = async () => {
      await valaxyOnFinished()
      await userOnFinished()
    }
  }

  // Dispose Shiki highlighter before SSG page rendering to free ~20-50MB of
  // language grammar/theme data that is no longer needed after Vite builds.
  let mdDisposePromise: Promise<void> | null = null
  const valaxyOnBeforePageRender: ViteSSGOptions['onBeforePageRender'] = async (_route, indexHTML, _appCtx) => {
    if (!mdDisposePromise) {
      mdDisposePromise = (async () => {
        disposeMdItInstance()
        disposePreviewMdItInstance()
        disposeSharedHighlighter()
        // Hint V8 to collect garbage freed by disposing Shiki/MarkdownIt.
        // This is especially important under tight heap limits where the Vite
        // build phase already consumed most of the budget.
        tryGC()
      })()
    }
    await mdDisposePromise
    return indexHTML
  }

  if (userSsgOptions.onBeforePageRender) {
    const userOnBeforePageRender = userSsgOptions.onBeforePageRender
    mergedSsgOptions.onBeforePageRender = async (route, indexHTML, appCtx) => {
      const html = await valaxyOnBeforePageRender(route, indexHTML, appCtx) ?? indexHTML
      return userOnBeforePageRender(route, html, appCtx)
    }
  }
  else {
    mergedSsgOptions.onBeforePageRender = valaxyOnBeforePageRender
  }

  // Eagerly release Vue app instances and associated objects after each page
  // is rendered. vite-ssg creates a new JSDOM + Vue app per page but never
  // calls jsdom.window.close() or app.unmount(). Without cleanup, each render
  // leaks ~30-80 MB (Vue reactive trees, router matcher, JSDOM window) that
  // accumulates until OOM — the GC trace shows `Mark-Compact` failing at ~2 GB.
  const valaxyOnPageRendered: ViteSSGOptions['onPageRendered'] = (_route, renderedHTML, appCtx) => {
    // Clear serialized Pinia state and any other accumulated SSR state
    if (appCtx.initialState) {
      for (const key of Object.keys(appCtx.initialState))
        delete appCtx.initialState[key]
    }

    // Release Vue app internal references to free component trees and reactive
    // subscriptions. In SSR mode apps are never mounted, so we clean up
    // internal references directly instead of calling app.unmount().
    const app = appCtx.app as any
    if (app) {
      // Clear the component instance tree (all setup() closures, reactive refs)
      app._instance = null
      app._container = null
      if (app._context) {
        // Clear provides chain (may hold large injected state like Pinia stores)
        app._context.provides = Object.create(null)
        app._context.app = null
      }
    }

    // Release the Vue Router instance — its matcher holds all route records
    // and accumulated history entries
    const router = appCtx.router as any
    if (router) {
      router.currentRoute = null
      router.options = null
      // Unref to break the circular reference between app <-> router
      ;(appCtx as any).router = null
    }

    // Release Unhead instance which accumulates head tag entries per page
    if ((appCtx as any).head) {
      (appCtx as any).head = null
    }

    // Null out the app reference on appCtx so vite-ssg's closure can release it
    ;(appCtx as any).app = null

    // Hint V8 to collect garbage between page renders — this is the only
    // chance to free JSDOM instances from the previous render before the
    // next one allocates a new one.
    tryGC()

    return renderedHTML
  }

  if (userSsgOptions.onPageRendered) {
    const userOnPageRendered = userSsgOptions.onPageRendered
    mergedSsgOptions.onPageRendered = async (route, renderedHTML, appCtx) => {
      const html = await userOnPageRendered(route, renderedHTML, appCtx) ?? renderedHTML
      return valaxyOnPageRendered(route, html, appCtx)
    }
  }
  else {
    mergedSsgOptions.onPageRendered = valaxyOnPageRendered
  }

  // Generate static pages for pagination
  if (options.config.build.ssgForPagination) {
    mergedSsgOptions.includedRoutes = (paths, _routes) => {
      const newPaths = paths
      const posts = paths.filter(path => path.startsWith('/posts/'))
      const pageNumber = Math.ceil(posts.length / options.config.siteConfig.pageSize)

      consola.info(`Generate ${colors.yellow(pageNumber)} pages for pagination.`)
      for (let i = 1; i <= pageNumber; i++)
        newPaths.push(`/page/${i}`)

      if (!userSsgOptions.includeAllRoutes)
        return newPaths.filter(path => !path.split('/').some(p => p.startsWith(':')))
      else
        return newPaths
    }
  }

  await viteSsgBuild(mergedSsgOptions, inlineConfig)
}

/**
 * post process for ssg fix extra string like `/html>` `ml>` `l>`
 * handle tasks after ssg build
 * todo find why
 * @param options
 */
export async function postProcessForSSG(options: ResolvedValaxyOptions) {
  const { userRoot } = options
  const indexPath = resolve(userRoot, 'dist/index.html')
  if (fs.existsSync(indexPath)) {
    consola.info('post process for ssg...')

    const indexFile = await fs.readFile(indexPath, 'utf-8')
    // fix incomplete index.html (with extra /html>) generated by vite-ssg
    const htmlTag = '</html>'
    if (!indexFile.endsWith(htmlTag)) {
      consola.warn('fix incomplete index.html...')
      const htmlTagStart = indexFile.lastIndexOf(htmlTag)
      await fs.writeFile(indexPath, indexFile.slice(0, htmlTagStart + htmlTag.length), 'utf-8')
    }
  }

  if (!options.config.siteConfig.redirects?.useVueRouter)
    await generateClientRedirects(options)
}

export async function generateClientRedirects(options: ResolvedValaxyOptions) {
  consola.info('generate client redirects...')
  const outputPath = resolve(options.userRoot, 'dist')
  const redirectRules = collectRedirects(options.redirects)

  const task = redirectRules.map(async (rule) => {
    const fromPath = join(outputPath, `${rule.from}.html`)
    const toPath = join(outputPath, `${rule.to}.html`)
    const routeExist = await fs.pathExists(toPath)
    if (!routeExist)
      throw new Error(`the route of '${rule.to}' not exists`)
    await writeRedirectFiles(rule.to, fromPath)
  })

  await Promise.all(task)
}
