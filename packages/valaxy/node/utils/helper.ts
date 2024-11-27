import { EXTERNAL_URL_RE } from '../constants'

/**
 * is url external (http/https:)
 * @param str
 */
export function isExternal(str: string) {
  return EXTERNAL_URL_RE.test(str)
}

/**
 * slash path for windows
 * @param str
 */
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
  return name.startsWith('/') || /^\.\.?[/\\]/.test(name)
}

/**
 * transform obj for vite code
 * @param obj
 */
export function transformObject(obj: any) {
  return `JSON.parse(${JSON.stringify(JSON.stringify(obj))})`
}
