import type { InlineConfig } from 'vite'
import type { ResolvedValaxyOptions } from '../types'
import { resolve } from 'node:path'
import { loadConfigFromFile, mergeConfig } from 'vite'
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
): Promise<EffectiveViteConfigResult> {
  const mode = callerViteConfig.mode
    ?? options.config.vite?.mode
    ?? (command === 'build' ? 'production' : 'development')

  const explicitConfigFile = callerViteConfig.configFile !== undefined
    ? callerViteConfig.configFile
    : (options.config.vite as InlineConfig | undefined)?.configFile

  // Match Vite's own cwd-relative resolution for explicit configFile strings.
  const resolvedExplicitConfigFile = typeof explicitConfigFile === 'string'
    ? resolve(explicitConfigFile)
    : undefined

  // Skip loading standard theme/user vite.config.ts here if Vite will load that same
  // file via explicit configFile, so plugins are never registered twice.
  const baseViteConfig = await mergeViteConfigs(
    options,
    command,
    mode,
    resolvedExplicitConfigFile ? [resolvedExplicitConfigFile] : [],
    isSsrBuild,
  )

  let explicitFileConfig: InlineConfig = {}
  if (resolvedExplicitConfigFile) {
    const loaded = await loadConfigFromFile(
      { command, mode, isSsrBuild: isSsrBuild ?? false },
      resolvedExplicitConfigFile,
    )
    if (loaded?.config)
      explicitFileConfig = loaded.config
  }

  const merged = mergeConfig(
    mergeConfig(baseViteConfig, options.config.vite || {}),
    callerViteConfig,
  )

  // Compute canonical build paths using Vite's precedence:
  // discovered/explicit file configs -> options.config.vite -> callerViteConfig.
  const mergedForPaths = mergeConfig(
    mergeConfig(
      mergeConfig(baseViteConfig, explicitFileConfig),
      options.config.vite || {},
    ),
    callerViteConfig,
  )

  const paths = resolveBuildPaths(options, mergedForPaths, explicitOutDir)
  options.outDir = paths.outDir
  options.publicDir = paths.publicDir
  options.base = paths.base

  const viteConfig = mergeConfig(merged, {
    // Preserve explicit configFile so Vite evaluates SSR-aware config functions per pass;
    // otherwise disable auto-discovery since mergeViteConfigs already loaded theme/user configs.
    configFile: resolvedExplicitConfigFile ?? false,
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
