import type MarkdownIt from 'markdown-it'
import { extractTitle } from './preWrapper'

// Global title collector
const globalTitleCollector = new Set<string>()

/**
 * Get the global title collector
 */
export function getGlobalTitleCollector(): Set<string> {
  return globalTitleCollector
}

/**
 * Clear the global title collector
 */
export function clearGlobalTitleCollector(): void {
  globalTitleCollector.clear()
}

/**
 * Markdown-it plugin to collect code block titles during processing
 * This plugin should be added before preWrapperPlugin to capture titles
 */
export function titleCollectorPlugin(md: MarkdownIt) {
  const fence = md.renderer.rules.fence!

  md.renderer.rules.fence = (...args) => {
    const [tokens, idx] = args
    const token = tokens[idx]

    // Extract title from token.info before it gets modified by other plugins
    const title = extractTitle(token.info)
    globalTitleCollector.add(title)

    // Call the original fence renderer
    return fence(...args)
  }
}
