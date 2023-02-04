/**
 * 生成介于 min 与 max 之间的随机数
 * @returns
 */
export function random(min: number, max: number) {
  return Math.random() * (max - min) + min
}

export function throttleAndDebounce(fn: () => void, delay: number): () => void {
  let timeout: ReturnType<typeof setTimeout>
  let called = false

  return () => {
    if (timeout)
      clearTimeout(timeout)

    if (!called) {
      fn()
      called = true
      setTimeout(() => {
        called = false
      }, delay)
    }
    else {
      timeout = setTimeout(fn, delay)
    }
  }
}
