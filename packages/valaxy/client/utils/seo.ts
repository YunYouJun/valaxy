import { EXTERNAL_URL_RE } from '../../shared'
import { resolveSiteUrl } from './path'

/**
 * Resolve a share image against the page when it is relative, and against the
 * site origin when it is root-absolute. Absolute URLs are unchanged.
 */
export function resolveShareImage(siteUrl: string, pagePath: string, src: string): string {
  if (!src || EXTERNAL_URL_RE.test(src) || !/^https?:\/\//.test(siteUrl))
    return src
  if (src.startsWith('/'))
    return resolveSiteUrl(siteUrl, src)

  const directory = pagePath.endsWith('/') ? pagePath : pagePath.replace(/[^/]*$/, '')
  const basePath = directory.startsWith('/') ? directory : `/${directory}`
  try {
    return resolveSiteUrl(siteUrl, new URL(src, `http://valaxy.local${basePath}`).pathname)
  }
  catch {
    return src
  }
}
