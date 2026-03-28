import { consola } from 'consola'
import { colors } from 'consola/utils'

/**
 * count performance time
 * Returns colored time string:
 * - green: < 500ms (fast)
 * - yellow: 500ms ~ 3s (moderate)
 * - red: > 3s (slow)
 * @example load config
 */
export function countPerformanceTime() {
  const start = performance.now()
  return () => {
    const end = performance.now()
    const duration = end - start

    let timeStr: string
    if (duration > 1000)
      timeStr = `${(duration / 1000).toFixed(2)}s`
    else
      timeStr = `${duration.toFixed(2)}ms`

    if (duration > 3000)
      return colors.red(timeStr)
    if (duration > 500)
      return colors.yellow(timeStr)
    return colors.green(timeStr)
  }
}

/**
 * function execution performance time
 * 获取函数执行时间
 */
export async function funcTime(fn: (...args: any) => any) {
  const start = performance.now()
  await fn()
  const end = performance.now()
  consola.info(`%c${fn.name} %c${end - start}ms`, 'color: #0e93e0', 'color: #e0a80e')
  return end - start
}
