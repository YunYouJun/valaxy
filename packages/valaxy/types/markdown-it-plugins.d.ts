declare module 'markdown-it-emoji' {
  import type { MarkdownIt } from 'markdown-it'

  export interface EmojiOptions {
    defs: Record<string, string>
    enabled: string[]
    shortcuts: Record<string, string | string[]>
  }

  export type EmojiPlugin = (md: MarkdownIt, options?: Partial<EmojiOptions>) => void

  export const bare: EmojiPlugin
  export const full: EmojiPlugin
  export const light: EmojiPlugin
}

declare module 'markdown-it-footnote' {
  import type { MarkdownIt } from 'markdown-it'

  const footnotePlugin: (md: MarkdownIt) => void
  export default footnotePlugin
}
