import type { MetingOptions } from '../types'
import { onMounted, onUnmounted } from 'vue'
import { onMetingLoad, onMetingLoadBefore } from './hook'

export function setupHiddenLyricHidingObserver() {
  // This condition needs to be executed before onMounted
  const observer = new MutationObserver((mutations) => {
    const lrcElement = document.querySelector('.aplayer-lrc .aplayer-lrc-contents .aplayer-lrc-current') as HTMLElement
    const lrcButton = document.querySelector('.aplayer-icon-lrc') as HTMLElement
    function removelrc() {
      if (lrcElement) {
        lrcElement.style.display = 'none'
        if (lrcElement.textContent !== 'Loading') {
          lrcButton.click()
          lrcElement.style.display = ''
          observer?.disconnect()
        }
      }
    }
    mutations.forEach((_mutation) => {
      removelrc()
    })
  })
  observer.observe(document.body, { childList: true, subtree: true })
}

export function useMetingLoadObserver(addon: MetingOptions) {
  let hasExecuted = false
  let observer: MutationObserver | undefined
  let timeout: number | undefined
  let frame: number | undefined
  let stopEventListeners: (() => void) | undefined

  onMounted(() => {
    function load() {
      if (hasExecuted || !document.querySelector('.aplayer.aplayer-fixed .aplayer-body'))
        return

      hasExecuted = true
      observer?.disconnect()
      observer = undefined
      timeout = window.setTimeout(() => {
        timeout = undefined
        onMetingLoadBefore(addon)
        frame = requestAnimationFrame(() => {
          frame = undefined
          stopEventListeners = onMetingLoad(addon)
        })
      }, 0)
    }

    observer = new MutationObserver(load)
    observer.observe(document.body, { childList: true, subtree: true })
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
