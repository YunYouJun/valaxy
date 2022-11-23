export * from './options'

export const getEmojis = (cdn = 'https://unpkg.com') => {
  return [
    `${cdn}@waline/emojis/bilibili/`,
    `${cdn}@waline/emojis/qq/`,
    `${cdn}@waline/emojis/weibo/`,
  ]
}
