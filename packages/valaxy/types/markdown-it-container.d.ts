/**
 * Type augmentation for markdown-it-container
 *
 * Local definitions keep the plugin compatible with markdown-it's bundled v15 types.
 */
declare module 'markdown-it-container' {
  import type { MarkdownIt, RendererRule } from 'markdown-it'

  interface ContainerOptions {
    /**
     * Function to validate tail after opening marker, should return true on success.
     */
    validate?: (params: string) => boolean

    /**
     * Renderer for opening/closing tokens.
     */
    render?: RendererRule

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
