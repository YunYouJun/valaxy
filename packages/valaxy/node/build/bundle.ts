import type { OutputOptions } from 'rolldown'
import type { ResolvedValaxyOptions } from '../types'

// https://github.com/sindresorhus/escape-string-regexp/blob/ba9a4473850cb367936417e97f1f2191b7cc67dd/index.js
export function escapeRegExp(str: string) {
  return str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&').replace(/-/g, '\\x2d')
}

/**
 * Clear rolldown chunk-splitting caches after build completes.
 */
export function clearBundleCache() {
  // No longer needed with codeSplitting (Rolldown handles caching internally),
  // but kept for backward compatibility with callers.
}

/**
 * Build Rolldown output options with codeSplitting groups for Vite 8.
 *
 * Migrated from Rollup's manualChunks to Rolldown's codeSplitting API.
 * @see https://rolldown.rs/in-depth/manual-code-splitting
 */
export function getRolldownOutputOptions(options: ResolvedValaxyOptions): OutputOptions {
  const assetsDir = 'assets'

  // Escape theme root for regex matching
  const escapedThemeRoot = escapeRegExp(
    options.themeRoot.replace(/\\/g, '/'),
  )

  const outputOptions: OutputOptions = {
    assetFileNames: `${assetsDir}/[name].[hash].[ext]`,
    entryFileNames: `${assetsDir}/[name].[hash].js`,
    chunkFileNames: `${assetsDir}/[name].[hash].js`,
    codeSplitting: {
      groups: [
        // Vite internal virtual modules → framework chunk
        {
          name: 'framework',
          test: /[\\/]@vue[\\/](runtime|shared|reactivity)|plugin-vue:export-helper|\0vite/,
          priority: 30,
        },

        // Group icons CSS virtual module
        {
          name: 'group-icons',
          test: /virtual:group-icons\.css/,
          priority: 25,
        },

        // Individual library chunks (high priority so they're split before vendor)
        {
          name: 'chunks/dayjs',
          test: /[\\/]dayjs[\\/]/,
          priority: 20,
        },
        {
          name: 'chunks/vue-i18n',
          test: /[\\/]vue-i18n[\\/]/,
          priority: 20,
        },
        {
          name: 'chunks/vue-router',
          test: /[\\/]vue-router[\\/]/,
          priority: 20,
        },
        {
          name: 'chunks/nprogress',
          test: /[\\/]nprogress[\\/]/,
          priority: 20,
        },
        {
          name: 'chunks/pinia',
          test: /[\\/]pinia[\\/]/,
          priority: 20,
        },
        {
          name: 'chunks/@vueuse/motion',
          test: /[\\/]@vueuse[\\/]motion[\\/]/,
          priority: 20,
        },

        // Theme code → theme chunk
        {
          name: 'theme',
          test: new RegExp(escapedThemeRoot),
          priority: 10,
        },
      ],
    },
  }

  return outputOptions
}
