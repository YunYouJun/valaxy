export function apiDestination(path) {
  return path.replace(/^\/typedoc(?=\/)/, '/api').replace(/^\/notes(?=\/)/, '/dev/notes').replace(/\/index\.html$/, '/').replace(/\.html$/, '')
}

export function apiRedirects(legacy) {
  const redirects = new Map([
    ['/', 'https://valaxy.site/api/'],
    ['/index.html', 'https://valaxy.site/api/'],
    ['/README', 'https://valaxy.site/api/'],
    ['/README.html', 'https://valaxy.site/api/'],
  ])
  for (const { path } of legacy.pages) {
    const target = apiDestination(path)
    if (!/^\/(?:api|dev\/notes)(?:\/|$)/.test(target) || /[\s?#]|\.\./.test(path))
      throw new Error(`Invalid legacy API path: ${path}`)
    const variants = [path, path.replace(/\.html$/, '')]
    if (path.endsWith('/index.html'))
      variants.push(path.replace(/index\.html$/, ''), path.replace(/\/index\.html$/, ''))
    for (const from of variants)
      redirects.set(from, `https://valaxy.site${target}`)
  }
  return redirects
}

export function formatApiRedirects(redirects) {
  return `${[...redirects].map(([from, to]) => `${from} ${to} 301`).join('\n')}\n`
}
