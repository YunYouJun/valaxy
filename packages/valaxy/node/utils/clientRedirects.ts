import type { RedirectItem, RedirectRule } from '../../types'
import fs from 'fs-extra'

function handleRoute(route: string) {
  if (route === '/')
    return '/index'
  if (route.endsWith('/'))
    return route.slice(0, -1)
  return route
}

export function collectRedirects(redirectRules?: RedirectRule[]): RedirectItem[] {
  if (!redirectRules)
    return []

  const redirects: RedirectItem[] = []
  for (const rule of redirectRules) {
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

export async function writeRedirectFiles(route: string, filePath: string) {
  await fs.ensureFile(filePath)
  await fs.writeFile(filePath, `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=${route}">
  <link rel="canonical" href="${route}">
</head>
  <script>
    window.location.href = '${route}' + window.location.search + window.location.hash
  </script>
</html>
  `)
}
