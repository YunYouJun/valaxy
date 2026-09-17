import type { DevframeScopedNodeContext } from 'devframe'
import type { ValaxyDevtoolsData, ValaxyEditorActionResult, ValaxyEditorContext, ValaxyEditorField } from './shared/extensions'

export type * from './shared/extensions'

export interface ValaxyDevtoolsPlugin {
  apiVersion: 1
  /** Stable lowercase identifier, unique within the project. */
  id: string
  name: string
  panels?: {
    id: string
    title: string
    icon?: string
    /** Absolute path to a prebuilt SPA directory. Build with base: './'. */
    clientAssets: string
  }[]
  editor?: {
    /** Optional top-level frontmatter fields. Values are only written on Save. */
    fields?: ValaxyEditorField[]
    /** Read-only checks; receive the unsaved draft and never implicitly save it. */
    actions?: { id: string, label: string, run: (context: ValaxyEditorContext) => ValaxyEditorActionResult | Promise<ValaxyEditorActionResult> }[]
  }
  setup?: (context: {
    data: ValaxyDevtoolsData
    /** RPCs and state are scoped to valaxy:addon:<id>. */
    rpc: DevframeScopedNodeContext<string>['rpc']
    onDispose: (cleanup: () => void | Promise<void>) => void
  }) => void | Promise<void>
}

export interface ValaxyDevtoolsAddonContext {
  userRoot: string
  addonRoot: string
  options: Record<string, unknown>
}

export type ValaxyDevtoolsAddon = (context: ValaxyDevtoolsAddonContext) =>
  ValaxyDevtoolsPlugin | Promise<ValaxyDevtoolsPlugin | { default: ValaxyDevtoolsPlugin }>

export function defineValaxyDevtoolsPlugin(plugin: ValaxyDevtoolsPlugin): ValaxyDevtoolsPlugin {
  return plugin
}
