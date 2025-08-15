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

// Types for virtual modules
// `#valaxy/*` is an alias for `/@valaxyjs/*`, because TS will consider `/@valaxyjs/*` as an absolute path that we can't override

declare module '/@valaxyjs/redirects' {
  import type { RouteRecordRaw } from 'vue-router'

  export const redirectRoutes: RouteRecordRaw[]

  export const useVueRouter: boolean
}

declare module '#valaxy/styles' {
  // side-effects only
  const styles: string
  export default styles
}

// valaxy features
declare module '#valaxy/blog/collections' {
  import type { CollectionConfig } from './types'

  const collections: CollectionConfig[]
  export default collections
}
