import 'vue-router'

import type { Post } from './types'
import type { Header } from './node/markdown'

declare interface Window {
  // algolia
  instantsearch: any
  algoliasearch: any
}

// markdowns can be treat as Vue components
declare module '*.md' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// vite hmr data
declare module '/@valaxyjs/site' {
  const config: string
  export default config
}

declare module '/@valaxyjs/context' {
  const ctx: string
  export default ctx
}
declare module '/@valaxyjs/addons' {
  import type { DefineComponent } from 'vue'
  const components: { props: any, component: DefineComponent<{}, {}, any> }[]
  export default components
}

declare module '/@valaxyjs/locales' {
  const messages: {}
  export default messages
}

declare module 'vue-router' {
  interface RouteMeta {
    headers: Header[]
    frontmatter: Post
  }
}

