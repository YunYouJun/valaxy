import type { UserConfig } from 'vite'

export const EXCERPT_SEPARATOR = '<!-- more -->'

export const PATHNAME_PROTOCOL_RE = /^pathname:\/\//

export const ALL_ROUTE = '/:all(.*)*'

export const customElements = new Set([
  // katex
  'annotation',
  'math',
  'menclose',
  'mfrac',
  'mglyph',
  'mi',
  'mlabeledtr',
  'mn',
  'mo',
  'mover',
  'mpadded',
  'mphantom',
  'mroot',
  'mrow',
  'mspace',
  'msqrt',
  'mstyle',
  'msub',
  'msubsup',
  'msup',
  'mtable',
  'mtd',
  'mtext',
  'mtr',
  'munder',
  'munderover',
  'semantics',
])

/**
 * @see https://vitejs.dev/config/shared-options.html#css-preprocessoroptions for sass@2
 * vite@7 default use sass modern api
 */
export const defaultViteConfig: UserConfig = {}
