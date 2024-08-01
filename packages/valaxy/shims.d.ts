import 'vue-router'

// import './client/typed-router'

import type { Ref } from 'vue'
import type { Header } from '@valaxyjs/utils'
import type { Post } from './types'

declare module 'valaxy-addon-*'
declare module '@docsearch/js' {
  function docsearch<T = any>(props: T): void
  export default docsearch
}

declare interface Window {
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

// vite hmr data
declare module '/@valaxyjs/config' {
  const config: string
  export default config
}

declare module '/@valaxyjs/context' {
  const ctx: string
  export default ctx
}
declare module '/@valaxyjs/addons' {
  import type { DefineComponent } from 'vue'

  const components: { props: any, component: DefineComponent<object, object, any> }[]
  export default components
}

declare module '/@valaxyjs/locales' {
  const messages: object
  export default messages
}

declare module 'vue-router' {
  interface RouteMeta {
    headers: Header[]
    frontmatter: Post
  }
}

declare module '/@valaxyjs/redirects' {
  import type { RouteRecordRaw } from 'vue-router'

  export const redirectRoutes: RouteRecordRaw[]

  export const useVueRouter: boolean
}

declare module 'mermaid/dist/mermaid.esm.mjs' {
  import Mermaid from 'mermaid/dist/mermaid.d.ts'

  export default Mermaid
}
