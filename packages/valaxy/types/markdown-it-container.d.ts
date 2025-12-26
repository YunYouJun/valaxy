/**
 * Type augmentation for markdown-it-container
 *
 * The official @types/markdown-it-container@2.0.11 depends on @types/markdown-it@13.0.9,
 * but we use @types/markdown-it@14.1.2. This file provides compatible type definitions.
 */
declare module 'markdown-it-container' {
  import type MarkdownIt from 'markdown-it'
  import type Token from 'markdown-it/lib/token.mjs'

  interface ContainerOptions {
    /**
     * Function to validate tail after opening marker, should return true on success.
     */
    validate?: (params: string) => boolean

    /**
     * Renderer for opening/closing tokens.
     */
    render?: (tokens: Token[], idx: number, options: any, env: any, self: any) => string

    /**
     * Character to use in delimiter, default is ":"
     */
    marker?: string
  }

  /**
   * markdown-it plugin for creating block-level custom containers
   */
  function container(
    md: MarkdownIt,
    name: string,
    options?: ContainerOptions,
  ): void

  export = container
}
