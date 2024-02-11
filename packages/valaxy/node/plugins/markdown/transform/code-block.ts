import type { ResolvedValaxyOptions } from 'valaxy'

function handleCodeHeightLimit(mainContentMd: string, options: ResolvedValaxyOptions, codeHeightLimit?: number): string {
  if (typeof codeHeightLimit !== 'number' || codeHeightLimit <= 0)
    return mainContentMd

  const siteConfigLimit = options.config.siteConfig.codeHeightLimit
  mainContentMd = mainContentMd.replaceAll(/<div.+class="language-\w+">/g, (matchStr) => {
    if (siteConfigLimit !== undefined && siteConfigLimit > 0)
      matchStr = matchStr.replace(/\d+/, codeHeightLimit.toString())
    else matchStr = `${matchStr.slice(0, 5)}style="max-height: ${codeHeightLimit}px;"${matchStr.slice(5)}`

    return matchStr
  })
  return mainContentMd
}

export function createTransformCodeBlock(options: ResolvedValaxyOptions) {
  return (code: string) => {
    const { frontmatter = {} as Record<string, any> } = options.env
    return handleCodeHeightLimit(code, options, frontmatter.codeHeightLimit)
  }
}
