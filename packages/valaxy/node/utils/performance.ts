import consola from 'consola'

/**
 * count performance time
 * @example load config
 */
export function countPerformanceTime() {
  const start = performance.now()
  return () => {
    const end = performance.now()
    const duration = end - start

    if (duration > 1000)
      return `${(duration / 1000).toFixed(2)}s`
    return `${duration.toFixed(2)}ms`
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
