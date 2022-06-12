import 'vue-router'

import type { Post } from 'valaxy'
import type { Header } from '../node/markdown'

// with vite-plugin-md, markdowns can be treat as Vue components
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
declare module '@valaxyjs/config' {
  // import type { ValaxyConfig } from 'valaxy'
  const config: string
  export default config
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

