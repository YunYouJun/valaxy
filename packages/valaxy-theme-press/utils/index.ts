/**
 * get locale title
 * @param locale
 * @param frontmatter
 * @returns
 */
export function getLocaleTitle(locale: string, frontmatter: any) {
  return frontmatter[`title${locale === 'en' ? '' : `_${locale}`}`]
}
