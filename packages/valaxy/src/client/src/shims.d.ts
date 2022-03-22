import 'vue-router'

import type { Post } from 'valaxy'

declare interface Window {
  // extend the window
  Waline: any
}

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

declare module 'vue-router' {
  interface RouteMeta {
    frontmatter: Post
  }
}
