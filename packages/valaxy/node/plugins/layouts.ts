/**
 * Valaxy's layout system: scans `layouts/` in every root and serves
 * `virtual:generated-layouts`. The client runtime lives in `client/utils/layouts.ts`.
 *
 * Options, layout-name normalization and runtime behavior follow
 * vite-plugin-vue-layouts-next@3.2.0 (MIT, https://github.com/loicduong/vite-plugin-vue-layouts-next),
 * so existing `layouts` configs and `meta.layout` values keep working.
 */
import type { Plugin } from 'vite'
import type { ResolvedValaxyOptions } from '../types'
import process from 'node:process'
import { isAbsolute, normalize, relative, resolve } from 'pathe'
import { glob, globSync } from 'tinyglobby'
import { toAtFS } from '../utils/resolve'

export type LayoutImportMode = 'sync' | 'async'

export interface LayoutsOptions {
  /**
   * Directories to search for layout components, absolute or relative to the user root.
   * Entries containing `**` are expanded to every matching directory.
   * Later directories override layouts with the same name from earlier ones.
   * @default roots.map(root => `${root}/layouts`) (core → theme → addons → user)
   */
  layoutsDirs: string | string[]
  /**
   * Valid file extensions for layout components.
   * @default ['vue']
   */
  extensions: string[]
  /**
   * List of path globs to exclude when resolving layouts.
   */
  exclude: string[]
  /**
   * Normalized layout name/key to use as the default layout
   * (for example, myDefault.vue -> my-default)
   * @default 'default'
   */
  defaultLayout: string
  /**
   * Layout name/key to render when a page asks for a layout that does not exist.
   * Defaults to `defaultLayout`.
   */
  fallbackLayout?: string
  /**
   * `sync` bundles a layout into the main chunk, `async` lazy-loads it.
   * Defaults to `sync` for every layout in builds (SSG hydration needs it),
   * otherwise `sync` for `default` and `async` for the rest.
   */
  importMode: (name: string) => LayoutImportMode
  /**
   * Whether nested routes should inherit the default layout from parent routes.
   * When false, if a child route has its own layout, the parent route won't use the default layout.
   * @default true
   */
  inheritDefaultLayout: boolean
}

export interface ResolvedLayoutsOptions extends LayoutsOptions {
  /** Absolute layout directories, in override order. */
  dirs: string[]
}

export const LAYOUTS_MODULE_ID = 'virtual:generated-layouts'
const RESOLVED_LAYOUTS_MODULE_ID = `\0${LAYOUTS_MODULE_ID}`

export function defaultImportMode(name: string): LayoutImportMode {
  if (process.env.VITE_SSG)
    return 'sync'
  return name === 'default' ? 'sync' : 'async'
}

const REGEX_BACKSLASH = /\\/g
const REGEX_SEPARATORS = /[-_/.\s]/
const REGEX_NON_ALPHANUMERIC = /[^a-z0-9-]+/gi
const REGEX_REPEATED_DASH = /-+/g
const REGEX_EDGE_DASH = /^-|-$/g
const REGEX_NUMBER = /\d/

function isUppercase(char = '') {
  if (REGEX_NUMBER.test(char))
    return undefined
  return char !== char.toLowerCase()
}

/**
 * Where a word boundary falls when `char` follows `buffer` with no separator:
 * `before` for `aB`, `after` for `ABc` (the last upper starts the next word).
 */
function caseBoundary(previousUpper: boolean | undefined, isUpper: boolean | undefined, buffer: string) {
  if (previousUpper === false && isUpper === true)
    return 'before'
  if (previousUpper === true && isUpper === false && buffer.length > 1)
    return 'after'
}

function splitByCase(value: string) {
  const parts: string[] = []
  let buffer = ''
  let previousUpper: boolean | undefined
  let previousSplitter: boolean | undefined
  const flush = () => {
    if (buffer)
      parts.push(buffer)
  }
  for (const char of value) {
    if (REGEX_SEPARATORS.test(char)) {
      flush()
      buffer = ''
      previousUpper = undefined
      previousSplitter = true
      continue
    }
    const isUpper = isUppercase(char)
    const boundary = previousSplitter === false ? caseBoundary(previousUpper, isUpper, buffer) : undefined
    if (boundary === 'before') {
      flush()
      buffer = char
    }
    else if (boundary === 'after') {
      parts.push(buffer.slice(0, -1))
      buffer = buffer.at(-1) + char
    }
    else {
      buffer += char
    }
    previousUpper = isUpper
    previousSplitter = false
  }
  flush()
  return parts
}

function kebabCaseSegments(segments: string[]) {
  return segments
    .map(segment => segment.toLowerCase())
    .join('-')
    .replace(REGEX_NON_ALPHANUMERIC, '-')
    .replace(REGEX_REPEATED_DASH, '-')
    .replace(REGEX_EDGE_DASH, '')
}

/** Drop directory segments the file name repeats, e.g. `post/PostList.vue` -> `post-list`. */
function resolveLayoutNameSegments(fileName: string, prefixParts: string[]) {
  const fileNameParts = splitByCase(fileName)
  const fileNamePartsContent = fileNameParts.join('/').toLowerCase()
  const layoutNameParts = prefixParts.flatMap(part => splitByCase(part))
  const matchedSuffix: string[] = []
  let index = prefixParts.length - 1
  while (index >= 0) {
    const prefixPart = prefixParts[index]
    matchedSuffix.unshift(...splitByCase(prefixPart).map(part => part.toLowerCase()))
    const matchedSuffixContent = matchedSuffix.join('/')
    if (
      fileNamePartsContent === matchedSuffixContent
      || fileNamePartsContent.startsWith(`${matchedSuffixContent}/`)
      || (prefixPart.toLowerCase() === fileNamePartsContent && prefixParts[index + 1] && prefixParts[index] === prefixParts[index + 1])
    ) {
      layoutNameParts.length = index
    }
    index -= 1
  }
  return [...layoutNameParts, ...fileNameParts]
}

/**
 * Layout key for a file path relative to its layouts directory:
 * `MyPost.vue` -> `my-post`, `blog/index.vue` -> `blog`, `blog/BlogPost.vue` -> `blog-post`.
 */
export function normalizeLayoutName(file: string) {
  const normalizedFile = file.replace(REGEX_BACKSLASH, '/')
  const slashIndex = normalizedFile.lastIndexOf('/')
  const dir = slashIndex === -1 ? '' : normalizedFile.slice(0, slashIndex)
  const basename = slashIndex === -1 ? normalizedFile : normalizedFile.slice(slashIndex + 1)
  const dotIndex = basename.lastIndexOf('.')
  const name = dotIndex <= 0 ? basename : basename.slice(0, dotIndex)
  const prefixParts = splitByCase(dir)
  return kebabCaseSegments(
    resolveLayoutNameSegments(dir && name.toLowerCase() === 'index' ? '' : name, prefixParts).filter(Boolean),
  )
}

/** Expand `layoutsDirs` to absolute directories, keeping their order. */
export function resolveLayoutsDirs(layoutsDirs: string | string[], root: string) {
  const dirs: string[] = []
  for (const dir of Array.isArray(layoutsDirs) ? layoutsDirs : [layoutsDirs]) {
    if (dir.includes('**')) {
      const matches = globSync(dir, { cwd: root, onlyDirectories: true, absolute: true })
      dirs.push(...matches.sort().map(match => normalize(match).replace(/\/$/, '')))
    }
    else {
      dirs.push(normalize(resolve(root, dir)))
    }
  }
  return dirs
}

export function resolveLayoutsOptions(
  options: Pick<ResolvedValaxyOptions, 'roots' | 'userRoot' | 'mode'>,
  userOptions: Partial<LayoutsOptions> = {},
): ResolvedLayoutsOptions {
  const resolved: LayoutsOptions = {
    layoutsDirs: options.roots.map(root => `${root}/layouts`),
    extensions: ['vue'],
    exclude: [],
    defaultLayout: 'default',
    // In SSG builds, layout components must be imported synchronously so that
    // the client-side hydration tree matches the server-rendered HTML. Lazy
    // non-default layouts (post, home, etc.) would not have resolved when
    // hydration starts, causing a mismatch.
    importMode: options.mode === 'build' ? () => 'sync' : defaultImportMode,
    inheritDefaultLayout: true,
  }
  for (const [key, value] of Object.entries(userOptions)) {
    if (value !== undefined)
      (resolved as any)[key] = value
  }
  return { ...resolved, dirs: resolveLayoutsDirs(resolved.layoutsDirs, options.userRoot) }
}

/**
 * Map every layout name to its file. Directories are scanned in order and later
 * ones win, so a user layout overrides an addon's, which overrides the theme's and core's.
 */
export async function scanLayouts(options: Pick<ResolvedLayoutsOptions, 'dirs' | 'extensions' | 'exclude'>) {
  const pattern = options.extensions.length > 1
    ? `**/*.{${options.extensions.join(',')}}`
    : `**/*.${options.extensions[0] || ''}`
  const layouts = new Map<string, string>()
  const dirFiles = await Promise.all(options.dirs.map(dir => glob(pattern, {
    cwd: dir,
    ignore: ['**/node_modules/**', '**/.git/**', '**/__*__/*', ...options.exclude],
    onlyFiles: true,
    expandDirectories: false,
  })))
  options.dirs.forEach((dir, index) => {
    for (const file of dirFiles[index].sort()) {
      const name = normalizeLayoutName(file)
      // Re-insert so iteration order follows the winning file's position.
      layouts.delete(name)
      layouts.set(name, normalize(resolve(dir, file)))
    }
  })
  return layouts
}

export function generateLayoutsCode(
  layouts: Map<string, string>,
  options: Pick<LayoutsOptions, 'defaultLayout' | 'fallbackLayout' | 'importMode' | 'inheritDefaultLayout'>,
  runtime: string,
) {
  const head: string[] = []
  const entries: string[] = []
  for (const [name, file] of layouts) {
    const id = JSON.stringify(toAtFS(file))
    if (options.importMode(name) === 'sync') {
      const variable = `__layout_${head.length}`
      head.push(`import ${variable} from ${id}`)
      entries.push(`  ${JSON.stringify(name)}: ${variable},`)
    }
    else {
      entries.push(`  ${JSON.stringify(name)}: lazyLayout(() => import(${id})),`)
    }
  }
  const fallbackArg = options.fallbackLayout ? `, ${JSON.stringify(options.fallbackLayout)}` : ''
  return `import { createGetRoutes, createLayoutWrapper, createSetupLayouts, lazyLayout, setPageLayout, useLayout } from ${JSON.stringify(toAtFS(runtime))}
${head.join('\n')}
export { createGetRoutes, setPageLayout, useLayout }
export const layouts = {
${entries.join('\n')}
}
const LayoutWrapper = createLayoutWrapper(layouts, ${JSON.stringify(options.defaultLayout)}${fallbackArg})
export const setupLayouts = createSetupLayouts(LayoutWrapper, { inheritDefaultLayout: ${options.inheritDefaultLayout} })
`
}

export function createLayoutsPlugin(options: ResolvedValaxyOptions): Plugin {
  const runtime = resolve(options.clientRoot, 'utils/layouts.ts')
  const resolveOptions = () => resolveLayoutsOptions(options, options.config.layouts)
  const isLayoutFile = (file: string, layoutsOptions: ResolvedLayoutsOptions) => {
    const path = normalize(file)
    return layoutsOptions.extensions.some(ext => path.endsWith(`.${ext}`))
      && layoutsOptions.dirs.some((dir) => {
        const rel = relative(dir, path)
        return !!rel && !rel.startsWith('..') && !isAbsolute(rel)
      })
  }

  return {
    name: 'valaxy:layouts',
    resolveId(id) {
      if (id === LAYOUTS_MODULE_ID)
        return RESOLVED_LAYOUTS_MODULE_ID
    },
    async load(id) {
      if (id !== RESOLVED_LAYOUTS_MODULE_ID)
        return
      const layoutsOptions = resolveOptions()
      return {
        code: generateLayoutsCode(await scanLayouts(layoutsOptions), layoutsOptions, runtime),
        moduleType: 'js',
      }
    },
    configureServer(server) {
      server.watcher.add(resolveOptions().dirs)
      // Edits are handled by Vue HMR; only adding or removing a layout changes the registry.
      const invalidate = (file: string) => {
        if (!isLayoutFile(file, resolveOptions()))
          return
        for (const environment of Object.values(server.environments)) {
          const module = environment.moduleGraph.getModuleById(RESOLVED_LAYOUTS_MODULE_ID)
          if (module)
            environment.moduleGraph.invalidateModule(module)
        }
        server.ws.send({ type: 'full-reload' })
      }
      server.watcher.on('add', invalidate)
      server.watcher.on('unlink', invalidate)
      server.httpServer?.once('close', () => {
        server.watcher.off('add', invalidate)
        server.watcher.off('unlink', invalidate)
      })
    },
  }
}
