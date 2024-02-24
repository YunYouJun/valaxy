import type { MetingOptions } from '../node/index'
import { onMetingLoad, onMetingLoadBefore } from './hook'

export function setupHiddenLyricHidingObserver() {
  const observer = new MutationObserver((mutations) => {
    const lrcElement = document.querySelector('.aplayer-lrc .aplayer-lrc-contents .aplayer-lrc-current') as HTMLElement
    const lrcButton = document.querySelector('.aplayer-icon-lrc') as HTMLElement
    function removelrc() {
      if (lrcElement) {
        lrcElement.style.display = 'none'
        if (lrcElement.textContent !== 'Loading') {
          lrcButton.click()
          lrcElement.style.display = ''
          observer.disconnect()
        }
      }
    }
    mutations.forEach((_mutation) => {
      removelrc()
    })
  })
  observer.observe(document.body, { childList: true, subtree: true })
}

export function setupMetingLoadObserver(addon: MetingOptions) {
  let hasExecuted = false
  const observer = new MutationObserver((mutations) => {
    function load() {
      if (hasExecuted)
        return
      const aplayerNarrowElement = document.querySelector('.aplayer.aplayer-fixed.aplayer-narrow .aplayer-body') as HTMLElement
      if (aplayerNarrowElement) {
        hasExecuted = true
        setTimeout(() => {
          onMetingLoadBefore(addon)
          requestAnimationFrame(() => {
            onMetingLoad(addon)
            observer.disconnect()
          })
        }, 0)
      }
    }
    mutations.forEach((_mutation) => {
      load()
    })
  })
  observer.observe(document.body, { childList: true, subtree: true })
}
