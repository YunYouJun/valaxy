import process from 'node:process'

/**
 * 全局网络拦截配置 - 需要被拦截（抛弃）的 URL 列表
 * 这些 URL 将在所有测试中被自动拦截，不会发起实际的网络请求
 */
export const abortUrls = [
  // 第三方统计和分析服务
  'hitokoto.cn',
  'busuanzi.ibruce.info',

  // 评论系统
  'utteranc.es',
  'giscus.app',

  // 广告和追踪服务
  'google-analytics.com',
  'googletagmanager.com',
  'doubleclick.net',
  'googlesyndication.com',

  'fonts.googleapis.com', // Google 字体（可选）
  'fonts.gstatic.com', // Google 字体（可选）

  // 可以根据实际需要添加更多 URL
] as const

/**
 * 网络拦截配置选项
 */
export const networkConfig = {
  // 是否启用详细日志记录（显示所有被拦截的请求）
  enableVerboseLogging: process.env.PLAYWRIGHT_VERBOSE === 'true',
  // 需要拦截的 URL 列表
  abortUrls,
} as const

/**
 * 快速检查 URL 是否应该被拦截
 * @param url 要检查的 URL
 * @returns 是否应该拦截该 URL
 */
export function shouldAbortUrl(url: string): boolean {
  return abortUrls.some(abortUrl => url.includes(abortUrl))
}
