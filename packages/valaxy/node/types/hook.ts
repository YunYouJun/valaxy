import type { EditableTreeNode } from 'vue-router/unplugin'

export type HookResult = Promise<void> | void

export interface PostAfterRenderContext {
  route: EditableTreeNode
  data: Readonly<Record<string, any>>
  excerpt?: string
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
   * Called after a markdown post has been processed and its frontmatter/excerpt resolved.
   * Provides access to the route, raw content, excerpt, frontmatter data, and file path.
   * Useful for addons that need to modify or extend post metadata (e.g., auto-generating excerpts).
   * @see valaxy/node/plugins/vueRouter.ts extendRoute
   */
  'post:afterRender': (ctx: PostAfterRenderContext) => HookResult

  'build:before': () => HookResult
  'build:after': () => HookResult
}
