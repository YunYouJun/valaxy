import { useEventListener } from '@vueuse/core'
import type { MetingOptions } from '../node/index'
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
export function useAPlayerMiniSwitcherEventListener() {
  const aplayerFixedElement = document.querySelector('.aplayer.aplayer-fixed .aplayer-body') as HTMLElement
  const aplayerIconButton = document.querySelector('.aplayer-body .aplayer-miniswitcher .aplayer-icon') as HTMLElement
  let aplayerNarrow = true

  function toggleAplayerVisibility() {
    aplayerNarrow = !aplayerNarrow
  }

  function hiddenAplayer() {
    if (aplayerNarrow)
      aplayerFixedElement.style.left = '-66px'
  }

  function showAplayer() {
    aplayerFixedElement.style.left = '0'
  }

  useEventListener(aplayerFixedElement, 'mouseenter', showAplayer)
  useEventListener(aplayerFixedElement, 'mouseleave', hiddenAplayer)
  useEventListener(aplayerIconButton, 'click', toggleAplayerVisibility)
}

function handleAplayerAction(action: string, leftValue: string) {
  const aplayerNarrowElement = document.querySelector('.aplayer.aplayer-fixed.aplayer-narrow .aplayer-body') as HTMLElement
  if (!aplayerNarrowElement)
    return

  if (action === Hook.metingLoadBefore)
    aplayerNarrowElement.style.display = 'initial'
  else if (action === Hook.metingLoad)
    aplayerNarrowElement.style.left = leftValue
}

export function animationIn(action: string) {
  handleAplayerAction(action, '0')
}

export function autoHidden(action: string) {
  handleAplayerAction(action, '-66px')
}
