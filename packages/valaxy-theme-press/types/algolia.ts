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
   * Configuration or assistant id to enable Ask AI mode.
   * Pass a string (assistant id) or a full config object.
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
  assistantId: string
  appId?: string
  apiKey?: string
  indexName?: string
  suggestedQuestions?: boolean
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
