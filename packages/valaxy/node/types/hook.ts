import type { EditableTreeNode } from 'unplugin-vue-router'

export type HookResult = Promise<void> | void

export interface ValaxyHooks {
  'options:resolved': () => HookResult
  'config:init': () => HookResult
  /**
   * @see valaxy/node/plugins/vueRouter.ts extendRoute
   */
  'vue-router:extendRoute': (route: EditableTreeNode) => HookResult
  'vue-router:beforeWriteFiles': (root: EditableTreeNode) => HookResult

  'build:before': () => HookResult
  'build:after': () => HookResult
}
