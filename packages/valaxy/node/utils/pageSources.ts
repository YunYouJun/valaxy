import { existsSync } from 'node:fs'
import fg from 'fast-glob'
import { isAbsolute, relative, resolve } from 'pathe'

/** Physical content roots in the same precedence order used by page consumers. */
export function getPageRoots(userRoot: string) {
  return [resolve(userRoot, 'pages'), resolve(userRoot, '.valaxy/content/pages')]
}

export function getPagePath(file: string, userRoot: string): string | undefined {
  for (const root of getPageRoots(userRoot)) {
    const page = relative(root, file)
    if (page && !isAbsolute(page) && page !== '..' && !page.startsWith('../'))
      return page
  }
}

export function resolvePageFile(page: string, userRoot: string): string | undefined {
  if (isAbsolute(page) || page.includes('\\'))
    return
  for (const root of getPageRoots(userRoot)) {
    const file = resolve(root, page)
    const rel = relative(root, file)
    if (!rel || rel === '..' || rel.startsWith('../') || isAbsolute(rel))
      return
    if (existsSync(file))
      return file
  }
}

export function pagePathToRoute(page: string) {
  return page.replace(/\.(?:md|html)$/, '').replace(/(^|\/)index$/, '')
}

export async function discoverPageFiles(userRoot: string, include = ['**/*.md']) {
  const pages = new Map<string, string>()
  for (const root of getPageRoots(userRoot)) {
    const files = await fg(include, { cwd: root, ignore: ['**/node_modules/**'], onlyFiles: true })
    for (const page of files.sort()) {
      if (!pages.has(page))
        pages.set(page, resolve(root, page))
    }
  }
  return pages
}
