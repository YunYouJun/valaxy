/**
 * Algolia search options. Partially copied from
 * `@docsearch/react/dist/esm/DocSearch.d.ts`
 *
 * @see https://vitepress.dev/reference/default-theme-search
 */
export interface AlgoliaSearchOptions extends DocSearchProps {
  locales?: Record<string, Partial<DocSearchProps>>
  /**
   * Configuration or published Agent Studio agent ID to enable Ask AI mode.
   * Pass a string (agent ID) or a full config object.
   * Omit to disable the Ask AI button entirely.
   *
   * @see https://vitepress.dev/reference/default-theme-search#ask-ai
   */
  askAi?: AlgoliaAskAiOptions | string
  /**
   * Ask AI side panel integration mode.
   *
   * - `'auto'`: infer hybrid vs sidePanel-only from provided config
   * - `'sidePanel'`: force sidePanel-only even if keyword search is configured
   * - `'hybrid'`: force hybrid (keyword search modal + Ask AI side panel)
   * - `'modal'`: force modal even if sidePanel is configured
   *
   * @default 'auto'
   */
  mode?: 'auto' | 'sidePanel' | 'hybrid' | 'modal'
}

export interface AlgoliaAskAiOptions {
  /**
   * The published Agent Studio agent ID. Legacy Ask AI assistant IDs are not supported.
   */
  agentId: string
  /**
   * Algolia application ID for Ask AI (defaults to the main `appId`).
   */
  appId?: string
  /**
   * Algolia API key for Ask AI (defaults to the main `apiKey`).
   */
  apiKey?: string
  /**
   * Algolia index name for Ask AI (defaults to the main `indexName`).
   */
  indexName?: string
  /**
   * Enables displaying suggested questions on Ask AI's new conversation screen.
   *
   * @default false
   */
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
  /**
   * Ask AI side panel configuration.
   * Set to `true` for default configuration, or pass a custom config object.
   *
   * @see https://vitepress.dev/reference/default-theme-search#ask-ai-side-panel
   */
  sidePanel?: boolean | AlgoliaSidepanelOptions
}

export interface AlgoliaSidepanelOptions {
  /**
   * Sidepanel button configuration (visibility, text, etc.).
   */
  button?: Record<string, any>
  /**
   * Keyboard shortcuts configuration.
   * Set a shortcut to `false` to disable it.
   *
   * @example { 'Ctrl/Cmd+I': false }
   */
  keyboardShortcuts?: Record<string, boolean>
  /**
   * Sidepanel panel configuration.
   */
  panel?: {
    /**
     * Panel variant.
     * @default 'floating'
     */
    variant?: 'floating' | 'inline'
    /**
     * Panel position side.
     * @default 'right'
     */
    side?: 'left' | 'right'
    /**
     * Panel default width.
     */
    width?: string
    /**
     * Panel expanded width.
     */
    expandedWidth?: string
    /**
     * Whether to show suggested questions.
     */
    suggestedQuestions?: boolean
  }
}

export interface DocSearchProps {
  appId: string
  apiKey: string
  indexName: string
  placeholder?: string
  searchParameters?: SearchOptions
  disableUserPersonalization?: boolean
  initialQuery?: string
  insights?: boolean
  translations?: DocSearchTranslations
}

export interface SearchOptions {
  query?: string
  similarQuery?: string
  facetFilters?: string | string[]
  optionalFilters?: string | string[]
  numericFilters?: string | string[]
  tagFilters?: string | string[]
  sumOrFiltersScores?: boolean
  filters?: string
  page?: number
  hitsPerPage?: number
  offset?: number
  length?: number
  attributesToHighlight?: string[]
  attributesToSnippet?: string[]
  attributesToRetrieve?: string[]
  highlightPreTag?: string
  highlightPostTag?: string
  snippetEllipsisText?: string
  restrictHighlightAndSnippetArrays?: boolean
  facets?: string[]
  maxValuesPerFacet?: number
  facetingAfterDistinct?: boolean
  minWordSizefor1Typo?: number
  minWordSizefor2Typos?: number
  allowTyposOnNumericTokens?: boolean
  disableTypoToleranceOnAttributes?: string[]
  queryType?: 'prefixLast' | 'prefixAll' | 'prefixNone'
  removeWordsIfNoResults?: 'none' | 'lastWords' | 'firstWords' | 'allOptional'
  advancedSyntax?: boolean
  advancedSyntaxFeatures?: ('exactPhrase' | 'excludeWords')[]
  optionalWords?: string | string[]
  disableExactOnAttributes?: string[]
  exactOnSingleWordQuery?: 'attribute' | 'none' | 'word'
  alternativesAsExact?: (
    | 'ignorePlurals'
    | 'singleWordSynonym'
    | 'multiWordsSynonym'
  )[]
  enableRules?: boolean
  ruleContexts?: string[]
  distinct?: boolean | number
  analytics?: boolean
  analyticsTags?: string[]
  synonyms?: boolean
  replaceSynonymsInHighlight?: boolean
  minProximity?: number
  responseFields?: string[]
  maxFacetHits?: number
  percentileComputation?: boolean
  clickAnalytics?: boolean
  personalizationImpact?: number
  enablePersonalization?: boolean
  restrictSearchableAttributes?: string[]
  sortFacetValuesBy?: 'count' | 'alpha'
  typoTolerance?: boolean | 'min' | 'strict'
  aroundLatLng?: string
  aroundLatLngViaIP?: boolean
  aroundRadius?: number | 'all'
  aroundPrecision?: number | { from: number, value: number }[]
  minimumAroundRadius?: number
  insideBoundingBox?: number[][]
  insidePolygon?: number[][]
  ignorePlurals?: boolean | string[]
  removeStopWords?: boolean | string[]
  naturalLanguages?: string[]
  getRankingInfo?: boolean
  userToken?: string
  enableABTest?: boolean
  decompoundQuery?: boolean
  relevancyStrictness?: number
}

export interface DocSearchTranslations {
  button?: ButtonTranslations
  modal?: ModalTranslations
}

export interface ButtonTranslations {
  buttonText?: string
  buttonAriaLabel?: string
}

export interface ModalTranslations extends ScreenStateTranslations {
  searchBox?: SearchBoxTranslations
  footer?: FooterTranslations
}

export interface ScreenStateTranslations {
  errorScreen?: ErrorScreenTranslations
  startScreen?: StartScreenTranslations
  noResultsScreen?: NoResultsScreenTranslations
}

export interface SearchBoxTranslations {
  resetButtonTitle?: string
  resetButtonAriaLabel?: string
  cancelButtonText?: string
  cancelButtonAriaLabel?: string
}

export interface FooterTranslations {
  selectText?: string
  selectKeyAriaLabel?: string
  navigateText?: string
  navigateUpKeyAriaLabel?: string
  navigateDownKeyAriaLabel?: string
  closeText?: string
  closeKeyAriaLabel?: string
  searchByText?: string
}

export interface ErrorScreenTranslations {
  titleText?: string
  helpText?: string
}

export interface StartScreenTranslations {
  recentSearchesTitle?: string
  noRecentSearchesText?: string
  saveRecentSearchButtonTitle?: string
  removeRecentSearchButtonTitle?: string
  favoriteSearchesTitle?: string
  removeFavoriteSearchButtonTitle?: string
}

export interface NoResultsScreenTranslations {
  noResultsText?: string
  suggestedQueryText?: string
  reportMissingResultsText?: string
  reportMissingResultsLinkText?: string
}
