export interface MarkdownBaseContext {
  value: string
}

export type MarkdownBase = string | MarkdownBaseContext

export type MarkdownBaseResolver = () => string

export function createMarkdownBaseContext(base = '/'): MarkdownBaseContext {
  return { value: base }
}

export function createMarkdownBaseResolver(base: MarkdownBase): MarkdownBaseResolver {
  return typeof base === 'string' ? () => base : () => base.value
}
