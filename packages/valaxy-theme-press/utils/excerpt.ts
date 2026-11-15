/**
 * Convert raw Markdown excerpt text to clean plain text for search results,
 * preserving inline code spans, escaped punctuation, autolinks, and math/comparison prose.
 */
export function formatFuseExcerpt(text = ''): string {
  const literals: string[] = []
  const protect = (value: string) => `\u0000${literals.push(value) - 1}\u0000`
  let cleaned = text
    .replace(/^[ \t]*```[\s\S]+?^[ \t]*```/gm, ' ')
    .replace(/^[ \t]*~~~[\s\S]+?^[ \t]*~~~/gm, ' ')
    .replace(/(?<!`)(`+)(?!`)([^\n]+?)(?<!`)\1(?!`)/g, (_, _fence, code: string) => protect(code))
    .replace(/\\([\\`*_~[\]{}()#+\-.!|>])/g, (_, char: string) => protect(char))
    .replace(/<!--[\s\S]*?(?:-->|$)/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/<((?:https?:\/\/|mailto:)[^>\s]+)>/gi, '$1')
    .replace(/<([^\s<>@]+@[^\s<>@.]+(?:\.[^\s<>@.]+)+)>/g, '$1')
    .replace(/<\/?[a-z][\w:-]*(?:\s[^<>]*)?\/?>/gi, ' ')
    .replace(/^[ \t]*#{1,6}[ \t]+/gm, '')
    .replace(/^[ \t]*>[ \t]?/gm, '')

  for (let depth = 0; depth < 3; depth++) {
    cleaned = cleaned
      .replace(/(?<![\p{L}\p{N}_])(_{1,3})(?=\S)(.+?\S|\S)\1(?![\p{L}\p{N}_])/gu, '$2')
      .replace(/(?<!\*)(\*{1,3})(?=\S)(.+?\S|\S)\1(?!\*)/g, '$2')
      .replace(/~~(?=\S)(.+?\S|\S)~~/g, '$1')
  }

  return cleaned
    .replace(/\0(\d+)\0/g, (_, index: string) => literals[Number(index)])
    .replace(/\s+/g, ' ')
    .trim()
}
