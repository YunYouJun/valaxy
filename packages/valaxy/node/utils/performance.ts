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
