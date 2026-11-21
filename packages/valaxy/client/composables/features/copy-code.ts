// ref vitepress copyCode.ts
import { isClient } from '@vueuse/core'
import { getCurrentScope, onScopeDispose } from 'vue'
import { copyToClipboard } from '../../utils/clipboard'

const timeoutIdMap: WeakMap<HTMLElement, ReturnType<typeof setTimeout>> = new WeakMap()
let activeCopyCodeListeners = 0

function handleCopyClick(e: MouseEvent) {
  const el = e.target
  if (!(el instanceof Element) || !el.matches('div[class*="language-"] > button.copy'))
    return

  const parent = el.parentElement
  const sibling = el.nextElementSibling?.nextElementSibling
  if (!parent || !sibling)
    return

  // eslint-disable-next-line regexp/no-unused-capturing-group
  const isShell = /language-(shellscript|shell|bash|sh|zsh)/.test(
    parent.className,
  )

  let text = ''

  sibling
    .querySelectorAll('span.line:not(.diff.remove)')
    .forEach(node => (text += `${node.textContent || ''}\n`))
  text = text.slice(0, -1)

  if (isShell)
    text = text.replace(/^ *(\$|>) /gm, '').trim()

  copyToClipboard(text)
    .then((copied) => {
      if (!copied)
        return
      el.classList.add('copied')
      clearTimeout(timeoutIdMap.get(el as HTMLElement))
      const timeoutId = setTimeout(() => {
        el.classList.remove('copied')
        ;(el as HTMLElement).blur?.()
        timeoutIdMap.delete(el as HTMLElement)
      }, 2000)
      timeoutIdMap.set(el as HTMLElement, timeoutId)
    })
    .catch(() => {})
}

export function useCopyCode() {
  if (!isClient)
    return () => {}

  if (activeCopyCodeListeners === 0)
    window.addEventListener('click', handleCopyClick)
  activeCopyCodeListeners++

  let disposed = false
  const cleanup = () => {
    if (disposed)
      return
    disposed = true
    activeCopyCodeListeners = Math.max(0, activeCopyCodeListeners - 1)
    if (activeCopyCodeListeners === 0)
      window.removeEventListener('click', handleCopyClick)
  }

  if (getCurrentScope())
    onScopeDispose(cleanup)

  return cleanup
}
