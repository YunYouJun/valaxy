import { writeFile } from 'node:fs/promises'
import { ensureFile } from 'fs-extra'
import type { RedirectRule } from 'valaxy/types'

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

export async function writeRedirectFiles(route: string, filePath: string) {
  await ensureFile(filePath)
  await writeFile(filePath, `
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
