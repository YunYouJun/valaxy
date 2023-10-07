// this module's typing is broken.

declare module '@docsearch/js' {
  function docsearch<T = any>(props: T): void
  export default docsearch
}

declare module '@docsearch/react/dist/esm/types' {
  export type DocSearchHit = any
}

declare module '*.md' {
  import { type DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}

declare module '*.vue' {
  import { type DefineComponent } from 'vue'

  const component: DefineComponent<object, object, any>
  export default component
}
