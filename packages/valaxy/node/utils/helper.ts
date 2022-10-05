export const EXTERNAL_URL_RE = /^https?:/i

/**
 * is url external (http/https:)
 * @param str
 * @returns
 */
export function isExternal(str: string) {
  return EXTERNAL_URL_RE.test(str)
}

export function slash(str: string) {
  return str.replace(/\\/g, '/')
}

export function ensurePrefix(prefix: string, str: string) {
  if (!str.startsWith(prefix))
    return prefix + str
  return str
}

export function toAtFS(path: string) {
  return `/@fs${ensurePrefix('/', slash(path))}`
}

export function isPath(name: string) {
  return name.startsWith('/') || /^\.\.?[\/\\]/.test(name)
}
