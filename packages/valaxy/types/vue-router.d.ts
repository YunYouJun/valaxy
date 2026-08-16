/**
 * Extend vue-router's RouteMeta interface
 * @see https://router.vuejs.org/guide/advanced/meta.html#TypeScript
 */
import type { Header } from '@valaxyjs/utils'
import type { Post } from './posts'

export {}

declare module 'vue-router' {
  interface RouteMeta {
    /**
     * Headers extracted from markdown
     */
    headers: Header[]
    /**
     * Frontmatter data from markdown files
     */
    frontmatter: Post
    /**
     * Excerpt from markdown content
     */
    excerpt?: string
    /**
     * Layout name
     */
    layout?: string
  }
}
