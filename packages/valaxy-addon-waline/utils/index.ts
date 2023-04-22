/**
 * Get emojis cdn path
 * @param cdn
 * @param types
 * @returns
 */
export function getEmojis(cdn = '//unpkg.com/', types = ['bilibili', 'qq', 'weibo']) {
  return types.map(type => `${cdn}@waline/emojis/${type}/`)
}
