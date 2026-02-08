import type { EditableTreeNode } from 'vue-router/unplugin'

export type HookResult = Promise<void> | void

export interface MdAfterRenderContext {
  route: EditableTreeNode
  data: Readonly<Record<string, any>>
  /**
   * The resolved excerpt (rendered HTML/text/md depending on `excerpt_type`),
   * including auto-generated excerpts. Empty string if no excerpt is available.
   */
  excerpt: string
  /**
   * Raw markdown content (without frontmatter) from gray-matter.
   */
  content: string
  path: string
}

export interface ValaxyHooks {
  'options:resolved': () => HookResult
  'config:init': () => HookResult
  /**
   * @see valaxy/node/plugins/vueRouter.ts extendRoute
   */
  'vue-router:extendRoute': (route: EditableTreeNode) => HookResult
  'vue-router:beforeWriteFiles': (root: EditableTreeNode) => HookResult

  /**
   * Called after a markdown page has been loaded and its frontmatter/excerpt resolved.
   * Fires for all `.md` routes (posts, pages, collections, etc.).
   * Provides access to the route, raw markdown content, resolved excerpt, frontmatter data, and file path.
   * Useful for addons that need to inspect or extend page metadata (e.g., auto-generating excerpts).
   * @see valaxy/node/plugins/vueRouter.ts extendRoute
   */
  'md:afterRender': (ctx: MdAfterRenderContext) => HookResult

  'build:before': () => HookResult
  'build:after': () => HookResult
}
