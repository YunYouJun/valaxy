/**
 * 生成介于 min 与 max 之间的随机数
 * @returns
 */
export function random(min: number, max: number) {
  return Math.random() * (max - min) + min
}

/**
 * 获取脚本，并执行回调函数
 * @param url
 * @param callback
 */
export function getScript(url: string, callback: Function) {
  const script = document.createElement('script')
  script.onload = () => {
    setTimeout(callback)
  }
  script.src = url
  document.head.appendChild(script)
}
