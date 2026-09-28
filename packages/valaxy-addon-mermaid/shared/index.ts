import type { MermaidConfig } from 'mermaid'

export type MermaidOptions = MermaidConfig
export type MermaidSetup = () => Partial<MermaidOptions> | void

export interface MermaidAddonOptions {
  /** Mermaid configuration. Per-diagram options take precedence. */
  config?: MermaidOptions
  /** Enable the click-to-expand viewer. @default true */
  viewer?: boolean
  /** Optional rounded, blue diagram theme. @default 'default' */
  appearance?: 'default' | 'soft'
}

export function defineMermaidSetup(fn: MermaidSetup) {
  return fn
}
