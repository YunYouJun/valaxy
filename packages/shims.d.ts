declare const __DEV__: boolean
declare interface Window {
  // extend the window

  Waline: any
  twikoo: {
    init: (options: {
      envId: string
      el: string
    } | any) => any
  }

  // algolia
  instantsearch: any
  algoliasearch: any
}
