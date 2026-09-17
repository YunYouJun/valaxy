/**
 * Algolia search types for valaxy-theme-press.
 *
 * These are defined locally to avoid depending on unpublished types
 * from valaxy-addon-algolia. When the addon publishes updated types,
 * these can be replaced with re-exports.
 */

export interface AlgoliaSearchOptions extends DocSearchProps {
  locales?: Record<string, Partial<DocSearchProps>>
  /**
   * Configuration or published Agent Studio agent ID to enable Ask AI mode.
   * Pass a string (agent ID) or a full config object.
   * Omit to disable the Ask AI button entirely.
   */
  askAi?: AlgoliaAskAiOptions | string
  /**
   * Ask AI side panel integration mode.
   *
   * @default 'auto'
   */
  mode?: 'auto' | 'sidePanel' | 'hybrid' | 'modal'
}

export interface AlgoliaAskAiOptions {
  agentId: string
  appId?: string
  apiKey?: string
  indexName?: string
  suggestedQuestions?: boolean
  /** Agent Studio search indices; defaults to indexName or the main search index. */
  indices?: string[]
  /** Agent Studio search overrides, keyed by index name. */
  searchParameters?: Record<string, {
    filters?: string
    attributesToRetrieve?: string[]
    restrictSearchableAttributes?: string[]
    distinct?: boolean | number | string
  }>
  sidePanel?: boolean | AlgoliaSidepanelOptions
}

export interface AlgoliaSidepanelOptions {
  button?: Record<string, any>
  keyboardShortcuts?: Record<string, boolean>
  panel?: {
    variant?: 'floating' | 'inline'
    side?: 'left' | 'right'
    width?: string
    expandedWidth?: string
    suggestedQuestions?: boolean
  }
}

export interface DocSearchProps {
  appId: string
  apiKey: string
  indexName: string
  placeholder?: string
  searchParameters?: Record<string, any>
  disableUserPersonalization?: boolean
  initialQuery?: string
  insights?: boolean
  translations?: Record<string, any>
}
