function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function hasMarkdownInclude(source: string, path: string) {
  const escapedPath = escapeRegExp(path)
  const includePattern = new RegExp(
    `<!--\\s*@include:\\s*${escapedPath}(?:\\{\\d+(?:,\\d*)?\\})?\\s*-->`,
  )
  return includePattern.test(source)
}
