import type { Ref } from 'vue'
import type { MetingOptions } from '../types'
import { onMounted, onUnmounted } from 'vue'
import { onMetingLoad, onMetingLoadBefore } from './hook'

export function setupHiddenLyricHidingObserver(root: HTMLElement = document.body) {
  // This condition needs to be executed before onMounted
  const observer = new MutationObserver((mutations) => {
    const lrcElement = root.querySelector<HTMLElement>('.aplayer-lrc .aplayer-lrc-contents .aplayer-lrc-current')
    const lrcButton = root.querySelector<HTMLElement>('.aplayer-icon-lrc')
    function removelrc() {
      if (lrcElement) {
        lrcElement.style.display = 'none'
        if (lrcElement.textContent !== 'Loading') {
          lrcButton?.click()
          lrcElement.style.display = ''
          observer?.disconnect()
        }
      }
    }
    mutations.forEach((_mutation) => {
      removelrc()
    })
  })
  observer.observe(root, { childList: true, subtree: true })
  return () => observer.disconnect()
}

export function useMetingLoadObserver(addon: MetingOptions, target?: Readonly<Ref<HTMLElement | null | undefined>>) {
  let hasExecuted = false
  let observer: MutationObserver | undefined
  let timeout: number | undefined
  let frame: number | undefined
  let stopEventListeners: (() => void) | undefined

  onMounted(() => {
    const root = target ? target.value : document.body
    if (!root)
      return

    function load() {
      const body = root!.querySelector<HTMLElement>('.aplayer.aplayer-fixed .aplayer-body')
      if (hasExecuted || !body)
        return

      hasExecuted = true
      observer?.disconnect()
      observer = undefined
      timeout = window.setTimeout(() => {
        timeout = undefined
        onMetingLoadBefore(addon, body)
        frame = requestAnimationFrame(() => {
          frame = undefined
          stopEventListeners = onMetingLoad(addon, body)
        })
      }, 0)
    }

    observer = new MutationObserver(load)
    observer.observe(root, { childList: true, subtree: true })
    load()
  })

  onUnmounted(() => {
    observer?.disconnect()
    observer = undefined
    if (timeout !== undefined)
      clearTimeout(timeout)
    if (frame !== undefined)
      cancelAnimationFrame(frame)
    stopEventListeners?.()
  })
}
