declare const __DEV__: boolean

declare module '*.md' {
  import { type DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.vue' {
  import { type DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

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
