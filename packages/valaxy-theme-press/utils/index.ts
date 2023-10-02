/**
 * get locale title
 * @param locale
 * @param frontmatter
 */
export function getLocaleTitle(locale: string, frontmatter: any) {
  return frontmatter[`title${locale === 'en' ? '' : `_${locale}`}`]
}
