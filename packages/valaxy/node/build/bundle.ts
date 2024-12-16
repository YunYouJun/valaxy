import type {
  Rollup,
} from 'vite'
import type { ResolvedValaxyOptions } from '../options'
import path from 'node:path'

// ref vitepress
const cache = new Map<string, boolean>()
const cacheTheme = new Map<string, boolean>()

// https://github.com/sindresorhus/escape-string-regexp/blob/ba9a4473850cb367936417e97f1f2191b7cc67dd/index.js
export function escapeRegExp(str: string) {
  return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d')
}

// https://github.com/vitejs/vite/blob/d2aa0969ee316000d3b957d7e879f001e85e369e/packages/vite/src/node/plugins/splitVendorChunk.ts#L14
// eslint-disable-next-line regexp/no-unused-capturing-group
const CSS_LANGS_RE = /\.(css|less|sass|scss|styl|stylus|pcss|postcss|sss)(?:$|\?)/

/**
 * Check if a module is statically imported by at least one entry.
 */
export function isEagerChunk(id: string, getModuleInfo: Rollup.GetModuleInfo) {
  if (
    id.includes('node_modules')
    && !CSS_LANGS_RE.test(id)
    && staticImportedByEntry(id, getModuleInfo, cache)
  ) {
    return true
  }
}

function staticImportedByEntry(
  id: string,
  getModuleInfo: Rollup.GetModuleInfo,
  cache: Map<string, boolean>,
  entryRE: RegExp | null = null,
  importStack: string[] = [],
): boolean {
  if (cache.has(id)) {
    return !!cache.get(id)
  }
  if (importStack.includes(id)) {
    // circular deps!
    cache.set(id, false)
    return false
  }
  const mod = getModuleInfo(id)
  if (!mod) {
    cache.set(id, false)
    return false
  }

  if (entryRE ? entryRE.test(id) : mod.isEntry) {
    cache.set(id, true)
    return true
  }
  const someImporterIs = mod.importers.some((importer: string) =>
    staticImportedByEntry(
      importer,
      getModuleInfo,
      cache,
      entryRE,
      importStack.concat(id),
    ),
  )
  cache.set(id, someImporterIs)
  return someImporterIs
}

export function getRollupOptions(options: ResolvedValaxyOptions) {
  // these deps are also being used in the client code (outside of the theme)
// exclude them from the theme chunk so there is no circular dependency
  const excludedModules = [
    '/@siteData',
    'node_modules/@vueuse/core/',
    'node_modules/@vueuse/shared/',
    'node_modules/vue/',
    'node_modules/vue-demi/',
    options.clientRoot,
  ]

  const themeEntryRE = new RegExp(
    `^${escapeRegExp(
      path.resolve(options.themeRoot, 'index.ts').replace(/\\/g, '/'),
    )}`,
  )

  const assetsDir = 'assets'
  const rollupOptions: Rollup.RollupOptions = {
    ...options.config.vite?.build?.rollupOptions,
    external: [],
    // important so that each page chunk and the index export things for each
    // other
    preserveEntrySignatures: 'allow-extension',
    output: {
      assetFileNames: `${assetsDir}/[name].[hash].[ext]`,
      entryFileNames: `${assetsDir}/[name].[hash].js`,
      chunkFileNames() {
        return `${assetsDir}/[name].[hash].js`
      },
      manualChunks(id, ctx) {
        // move known framework code into a stable chunk so that
        // custom theme changes do not invalidate hash for all pages
        if (id.startsWith('\0vite')) {
          return 'framework'
        }
        if (id.includes('plugin-vue:export-helper')) {
          return 'framework'
        }

        // lib
        const libs = [
          '@vueuse/motion',

          'date-fns',
          'luxon',
          'vue-i18n',
          'vue-router',
          'nprogress',
          'pinia',
        ]
        for (const lib of libs) {
          if (id.includes(lib)) {
            return `chunks/${lib}`
          }
        }

        if (
          isEagerChunk(id, ctx.getModuleInfo)
          // eslint-disable-next-line regexp/no-unused-capturing-group
          && /@vue\/(runtime|shared|reactivity)/.test(id)
        ) {
          return 'framework'
        }

        if (
          (id.startsWith(options.themeRoot)
            || !excludedModules.some(i => id.includes(i)))
          && staticImportedByEntry(
            id,
            ctx.getModuleInfo,
            cacheTheme,
            themeEntryRE,
          )
        ) {
          return 'theme'
        }
      },
    },
  }
  return rollupOptions
}
