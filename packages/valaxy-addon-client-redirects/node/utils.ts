import type { RedirectRule } from '../types'

function handleRoute(route: string) {
  if (route === '/')
    return '/index'
  if (route.endsWith('/'))
    return route.slice(0, -1)
  return route
}

interface RedirectItem {
  from: string
  to: string
}

export function collectRedirects(redirectRule: RedirectRule[]) {
  const redirects: RedirectItem[] = []
  for (const rule of redirectRule) {
    if (Array.isArray(rule.from)) {
      for (const from of rule.from) {
        redirects.push({
          from: handleRoute(from),
          to: handleRoute(rule.to),
        })
      }
    }
    else {
      redirects.push({
        from: handleRoute(rule.from),
        to: handleRoute(rule.to),
      })
    }
  }

  return redirects
}
