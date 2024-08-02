/**
 * wrap node
 */
export function wrap(el: HTMLElement, className: string) {
  const wrapper = document.createElement('div')
  wrapper.className = className
  el.parentNode!.insertBefore(wrapper, el)
  el.parentNode!.removeChild(el)
  wrapper.appendChild(el)
}

/**
 * 包裹表格，添加 class 以控制 table 样式
 */
export function wrapTable(container: HTMLElement | Document = document) {
  container.querySelectorAll('table').forEach((el) => {
    if (el.parentElement?.classList.contains('table-container'))
      return
    const container = document.createElement('div')
    container.className = 'table-container'
    wrap(el, 'table-container')
  })
}
