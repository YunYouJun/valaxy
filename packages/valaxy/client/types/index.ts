import type { ViteSSGContext } from 'vite-ssg'
import type mermaid from 'mermaid'

export type UserModule = (ctx: ViteSSGContext) => void

/**
 * @see https://mermaid.js.org/config/schema-docs/config.html#mermaid-config-schema
 */
export type MermaidOptions = (typeof mermaid.initialize) extends (a: infer A) => any ? A : never
