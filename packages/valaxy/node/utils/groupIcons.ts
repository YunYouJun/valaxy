import type { ResolvedValaxyOptions } from '../types'
import { readFile } from 'node:fs/promises'
import _debug from 'debug'
import pMap from 'p-map'
import { resolve } from 'pathe'

const debug = _debug('valaxy:group-icons')

/**
 * Regex to extract code block titles from markdown fenced code blocks.
 *
 * Matches patterns like:
 * - ` ```ts [filename.ts] ` → captures "filename.ts"
 * - ` ```typescript [builtin.ts] ` → captures "builtin.ts"
 * - ` ```sh [pnpm] ` → captures "pnpm"
 * - ` ```ts {7-9} [site.config.ts] ` → captures "site.config.ts"
 *
 * Allows up to 3 leading spaces per CommonMark spec (indented fences in
 * lists/blockquotes). Uses `[^\n[]*` to match any content on the same
 * line before `[title]`, preventing cross-line false matches.
 */
const codeBlockTitleRE = /^[ \t]{0,3}`{3}[^\n[]*\[((?:[^[\]]|\[[^[\]]*\])*)\]/gm

/**
 * Scan all markdown pages to extract code block titles.
 *
 * During SSG builds, the `vitepress-plugin-group-icons` Vite plugin's
 * `transform` hook may not fire for all markdown files because file IDs
 * don't always match its filter pattern. This causes the generated icon
 * CSS to be empty, resulting in missing icons in production.
 *
 * By pre-scanning markdown files and passing all titles as `defaultLabels`,
 * we ensure icon CSS is always generated regardless of transform hook behavior.
 */
export async function scanCodeBlockTitles(options: ResolvedValaxyOptions): Promise<string[]> {
  const pagesDir = resolve(options.userRoot, 'pages')
  const titles = new Set<string>()

  await pMap(
    options.pages,
    async (page) => {
      try {
        const content = await readFile(resolve(pagesDir, page), 'utf-8')
        extractCodeBlockTitles(content, titles)
      }
      catch (error) {
        debug('Failed to read %s: %O', page, error)
      }
    },
    { concurrency: 64 },
  )

  return [...titles].sort()
}

/**
 * Extract code block titles from raw markdown content.
 */
export function extractCodeBlockTitles(markdown: string, titles: Set<string> = new Set<string>()): Set<string> {
  // Reset regex state
  codeBlockTitleRE.lastIndex = 0
  for (
    let match = codeBlockTitleRE.exec(markdown);
    match !== null;
    match = codeBlockTitleRE.exec(markdown)
  ) {
    titles.add(match[1])
  }

  return titles
}
