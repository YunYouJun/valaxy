import type { ViteSSGContext } from 'vite-ssg'
import type mermaid from 'mermaid'

export type UserModule = (ctx: ViteSSGContext) => void

export type MermaidOptions = (typeof mermaid.initialize) extends (a: infer A) => any ? A : never
