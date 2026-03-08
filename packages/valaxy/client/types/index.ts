import type mermaid from 'mermaid'
import type { ValaxySSGContext } from '../setups'

export type UserModule = (ctx: ValaxySSGContext) => void

/**
 * @see https://mermaid.js.org/config/schema-docs/config.html#mermaid-config-schema
 */
export type MermaidOptions = (typeof mermaid.initialize) extends (a: infer A) => any ? A : never

export * from './collection'
