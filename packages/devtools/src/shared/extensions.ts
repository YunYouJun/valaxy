import type { ClientPageData, ServerFunctions } from './rpc'

/** Version 1: read-only content access, shared by Node extensions and panels. */
export type ValaxyDevtoolsData = Pick<ServerFunctions, 'getOptions' | 'getPostList' | 'getPageData' | 'getCollectionList' | 'getConfig'> & {
  onChanged: (listener: () => void) => Promise<() => void>
}

interface EditorFieldBase {
  key: string
  label: string
  description?: string
}

export type ValaxyEditorField = EditorFieldBase & (
  | { type: 'text' | 'textarea', maxLength?: number }
  | { type: 'boolean' }
  | { type: 'number', min?: number, max?: number, step?: number }
  | { type: 'select', options: { label: string, value: string }[] }
)

export interface ValaxyEditorActionResult {
  message: string
  severity?: 'success' | 'warn' | 'error' | 'info'
}

export interface ValaxyDevtoolsManifest {
  apiVersion: 1
  plugins: {
    id: string
    name: string
    panels: { id: string, title: string, icon: string, url: string }[]
    fields: ValaxyEditorField[]
    actions: { id: string, label: string }[]
  }[]
}

export interface ValaxyEditorContext {
  /** The saved page; draft holds the current, unsaved frontmatter. */
  page: ClientPageData
  draft: Record<string, unknown>
  data: ValaxyDevtoolsData
}
