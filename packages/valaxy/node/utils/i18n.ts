/**
 * @experimental 试验性
 * @see https://github.com/YunYouJun/valaxy/issues/566
 * @param key
 *
 * 声明这是一个使用国际化的 key
 * 从 locales/ 目录中获取对应的翻译
 */
export function $t(key: string) {
  return `$locale:${key}`
}
