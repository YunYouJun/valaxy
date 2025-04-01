/**
 * Get emojis cdn path
 * @param cdn
 * @param types
 * @param emoji
 */
export function getEmojis(cdn = '//unpkg.com/', types = ['bilibili', 'qq', 'weibo'], emoji?: string[]) {
  if (!emoji || emoji.length === 0) {
    return types.map(type => `${cdn}@waline/emojis/${type}/`)
  }
  else {
    const typePaths = types.map(type => `${cdn}@waline/emojis/${type}/`)
    const emojiPaths = emoji.map(emoji => `${emoji}/`)
    return [...typePaths, ...emojiPaths]
  }
}
