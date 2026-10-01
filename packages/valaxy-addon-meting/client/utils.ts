import type { MetingOptions } from '../types'
import { useEventListener } from '@vueuse/core'
import { Hook } from './hook'

type Rules = {
  [K in string]: () => void;
}
export function handleOptions(options: MetingOptions['options'], rules: Rules) {
  if (!options)
    return
  Object.entries(rules).forEach(([key, action]) => {
    if (options[key as keyof typeof options])
      action()
  })
}

/**
 * APlayer mini switcher
 */
export function useAPlayerMiniSwitcherEventListener(aplayerFixedElement = document.querySelector<HTMLElement>('.aplayer.aplayer-fixed .aplayer-body')) {
  if (!aplayerFixedElement)
    return

  const hiddenAplayer = () => {
    if (aplayerFixedElement.closest('.aplayer-narrow'))
      aplayerFixedElement.style.left = '-66px'
  }

  const showAplayer = () => {
    aplayerFixedElement.style.left = '0'
  }

  const stopMouseenter = useEventListener(aplayerFixedElement, 'mouseenter', showAplayer)
  const stopMouseleave = useEventListener(aplayerFixedElement, 'mouseleave', hiddenAplayer)
  return () => {
    stopMouseenter()
    stopMouseleave()
  }
}

export function animationIn(action: string, aplayerBody = document.querySelector<HTMLElement>('.aplayer.aplayer-fixed .aplayer-body')) {
  if (!aplayerBody)
    return

  if (action === Hook.metingLoadBefore) {
    aplayerBody.style.display = 'initial'
  }
  else if (action === Hook.metingLoad) {
    aplayerBody.style.left = '0'
    aplayerBody.setAttribute('data-valaxy-meting-loaded', '')
  }
}

export function autoHidden(action: string, body = document.querySelector<HTMLElement>('.aplayer.aplayer-fixed .aplayer-body')) {
  if (action !== Hook.metingLoad)
    return
  if (body?.closest('.aplayer-narrow'))
    body.style.left = '-66px'
}
