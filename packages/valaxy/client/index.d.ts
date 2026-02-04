import type { Ref } from 'vue'
import type { Post } from '../types'

import './shims.d'
// Import vue-router RouteMeta augmentation
import '../types/vue-router.d'

export * from '../dist/types/index.mjs'
export * from './index'

declare module '@docsearch/js' {
  function docsearch<T = any>(props: T): void
  export default docsearch
}

declare interface Window {
  // for devtools
  __VUE_DEVTOOLS_ROUTER__: import('vue-router').Router
  $frontmatter: any
  $pageData: any
  $valaxy: {
    postList: Ref<Post[]>
  }

  // algolia
  instantsearch: any
  algoliasearch: any
}

// markdowns can be treat as Vue components
declare module '*.md' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}
