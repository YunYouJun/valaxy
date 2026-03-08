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
import { clearBundleCache } from './build/bundle'
import { defaultViteConfig } from './constants'
import { disposeMdItInstance, disposePreviewMdItInstance } from './plugins/markdown'
import { disposeSharedHighlighter } from './plugins/markdown/highlighterCache'
import { ViteValaxyPlugins } from './plugins/preset'
import { collectRedirects, writeRedirectFiles } from './utils/clientRedirects'

// Re-export the new self-built SSG
export { ssgBuild } from './build/ssg'

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
 */
function getHeapLimitMB(): number {
  return v8.getHeapStatistics().heap_size_limit / 1024 / 1024
}

function getSSGConcurrency(): number {
  const heapLimitMB = getHeapLimitMB()

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

function getSSGBeastiesOptions(): any {
  const heapLimitMB = getHeapLimitMB()
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

/**
 * Legacy SSG build using vite-ssg (JSDOM-based).
 * Kept as fallback for `--ssg-engine vite-ssg`.
 */
export async function ssgBuildLegacy(
  valaxyApp: ValaxyNode,
  viteConfig: InlineConfig = {},
) {
  // Lazy-import vite-ssg so it's not required when using the new SSG engine
  const { build: viteSsgBuild } = await import('vite-ssg/node')

  if (!process.env.__VALAXY_SSG_NO_RESPAWN__) {
    const needGC = typeof globalThis.gc !== 'function'
    const currentHeapMB = getHeapLimitMB()
    const minRequiredMB = 2560
    const needMoreHeap = currentHeapMB < minRequiredMB
    // Only respawn for --expose-gc if heap is also constrained.
    // On memory-rich machines, tryGC() being a no-op is acceptable.
    const needRespawn = needMoreHeap || (needGC && currentHeapMB < 4096)

    if (needRespawn) {
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
        // Parent process returns after successful respawn. Any in-process
        // JavaScript callbacks (e.g. ssgOptions callbacks) will only
        // run in the child process, not here.
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

  const { options } = valaxyApp
  const cdnModuleNames = (options.config.cdn?.modules || []).map(m => m.name)
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

  const userSsgOptions: Partial<ViteSSGOptions> = (inlineConfig.ssgOptions || {}) as Partial<ViteSSGOptions>
  delete inlineConfig.ssgOptions

  const valaxySsgDefaults: Partial<ViteSSGOptions> = {
    script: 'async',
    formatting: getHeapLimitMB() <= 2560 ? 'none' : 'minify',
    concurrency: getSSGConcurrency(),
    beastiesOptions: getSSGBeastiesOptions(),
    onFinished() {
      clearBundleCache()
      generateSitemap({
        hostname: options.config.siteConfig.url,
      })
    },
  }

  const mergedSsgOptions: Partial<ViteSSGOptions> = {
    ...valaxySsgDefaults,
    ...userSsgOptions,
  }

  if (userSsgOptions.beastiesOptions && valaxySsgDefaults.beastiesOptions) {
    mergedSsgOptions.beastiesOptions = {
      ...valaxySsgDefaults.beastiesOptions,
      ...userSsgOptions.beastiesOptions,
    }
  }

  if (userSsgOptions.onFinished) {
    const valaxyOnFinished = valaxySsgDefaults.onFinished!
    const userOnFinished = userSsgOptions.onFinished
    mergedSsgOptions.onFinished = async () => {
      await valaxyOnFinished()
      await userOnFinished()
    }
  }

  let mdDisposePromise: Promise<void> | null = null
  const valaxyOnBeforePageRender: ViteSSGOptions['onBeforePageRender'] = async (_route, indexHTML, _appCtx) => {
    if (!mdDisposePromise) {
      mdDisposePromise = (async () => {
        disposeMdItInstance()
        disposePreviewMdItInstance()
        disposeSharedHighlighter()
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

  const valaxyOnPageRendered: ViteSSGOptions['onPageRendered'] = (_route, renderedHTML, appCtx) => {
    if (appCtx.initialState) {
      for (const key of Object.keys(appCtx.initialState))
        delete appCtx.initialState[key]
    }

    const app = appCtx.app as any
    if (app) {
      app._instance = null
      app._container = null
      if (app._context) {
        app._context.provides = Object.create(null)
        app._context.app = null
      }
    }

    const router = appCtx.router as any
    if (router) {
      router.currentRoute = null
      router.options = null
      ;(appCtx as any).router = null
    }

    if ((appCtx as any).head) {
      (appCtx as any).head = null
    }

    ;(appCtx as any).app = null

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
