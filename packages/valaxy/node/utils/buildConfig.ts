import type { InlineConfig } from 'vite'
import type { ResolvedValaxyOptions } from '../types'
import { resolve } from 'node:path'
import process from 'node:process'
import { mergeConfig } from 'vite'
import { mergeViteConfigs } from '../common'

export interface ResolvedBuildPaths {
  outDir: string
  publicDir: string | false
  base: string
}

export interface EffectiveViteConfigResult extends ResolvedBuildPaths {
  viteConfig: InlineConfig
}

/**
 * Resolve Vite's `publicDir` relative to `userRoot`, preserving `false` when disabled.
 */
export function resolvePublicDir(userRoot: string, publicDir?: string | false): string | false {
  if (publicDir === false)
    return false
  return resolve(userRoot, publicDir || 'public')
}

/**
 * Resolve canonical `outDir`, `publicDir`, and `base` from Valaxy and Vite config.
 */
export function resolveBuildPaths(
  options: Pick<ResolvedValaxyOptions, 'userRoot' | 'outDir' | 'publicDir' | 'base' | 'config'>,
  viteConfig?: InlineConfig,
  explicitOutDir?: string,
): ResolvedBuildPaths {
  const rawOutDir = explicitOutDir
    ?? viteConfig?.build?.outDir
    ?? options.outDir
    ?? options.config?.vite?.build?.outDir
    ?? 'dist'

  const outDir = resolve(options.userRoot, rawOutDir)

  const rawPublicDir = viteConfig?.publicDir !== undefined
    ? viteConfig.publicDir
    : options.publicDir !== undefined
      ? options.publicDir
      : options.config?.vite?.publicDir

  const publicDir = resolvePublicDir(options.userRoot, rawPublicDir)
  const base = viteConfig?.base ?? options.base ?? options.config?.vite?.base ?? '/'

  return { outDir, publicDir, base }
}

/**
 * Merge Vite configs (`mergeViteConfigs` + `options.config.vite` + `callerViteConfig`),
 * persist canonical `outDir` / `publicDir` / `base` on `options`, and inject them into Vite config.
 */
export async function resolveEffectiveViteConfig(
  options: ResolvedValaxyOptions,
  command: 'serve' | 'build',
  callerViteConfig: InlineConfig = {},
  explicitOutDir?: string,
  isSsrBuild?: boolean,
  persistPaths = isSsrBuild !== true,
): Promise<EffectiveViteConfigResult> {
  const mode = callerViteConfig.mode
    ?? options.config.vite?.mode
    ?? (command === 'build' ? 'production' : 'development')

  // Mirror Vite's resolveConfig() initialization so configs branching on
  // process.env.NODE_ENV observe the effective build/serve default before evaluation.
  if (!process.env.NODE_ENV)
    process.env.NODE_ENV = command === 'build' ? 'production' : 'development'

  const explicitConfigFile = callerViteConfig.configFile !== undefined
    ? callerViteConfig.configFile
    : (options.config.vite as InlineConfig | undefined)?.configFile

  // Match Vite's own cwd-relative resolution for explicit configFile strings.
  const resolvedExplicitConfigFile = typeof explicitConfigFile === 'string'
    ? resolve(explicitConfigFile)
    : undefined

  // Evaluate theme/user/explicit config files once per pass using the effective mode & isSsrBuild,
  // preserving theme < user < explicit < options.config.vite < callerViteConfig precedence.
  // Respect configFile: false by skipping config-file loading altogether.
  const baseViteConfig = explicitConfigFile === false
    ? {}
    : await mergeViteConfigs(
        options,
        command,
        mode,
        resolvedExplicitConfigFile ? [resolvedExplicitConfigFile] : [],
        isSsrBuild,
      )

  const merged = mergeConfig(
    mergeConfig(baseViteConfig, options.config.vite || {}),
    callerViteConfig,
  )

  const paths = resolveBuildPaths(options, merged, explicitOutDir)
  if (persistPaths) {
    options.outDir = paths.outDir
    options.publicDir = paths.publicDir
    options.base = paths.base
  }

  const viteConfig = mergeConfig(merged, {
    // Config files were already evaluated for this pass, so disable Vite's own loading
    // to prevent duplicate plugin registration and precedence inversion.
    configFile: false,
    base: paths.base,
    publicDir: paths.publicDir,
    build: {
      outDir: paths.outDir,
    },
  } as InlineConfig)

  return {
    viteConfig,
    ...paths,
  }
}
