import { EXTERNAL_URL_RE } from '../constants'

/**
 * is url external (http/https:)
 * @param str
 */
export function isExternal(str: string) {
  return EXTERNAL_URL_RE.test(str)
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
