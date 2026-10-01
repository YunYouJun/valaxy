import type { MetingOptions } from '../types'
import { onMounted } from 'vue'
import { setupHiddenLyricHidingObserver } from './observer'
import { animationIn, autoHidden, handleOptions, useAPlayerMiniSwitcherEventListener } from './utils'

export enum Hook {
  metingInit = 'metingInit',
  metingLoadBefore = 'metingLoadBefore',
  metingLoad = 'metingLoad',
}

export function onMetingInit({ options }: MetingOptions) {
  handleOptions(options, {
    animationIn: () => onMounted(() => import('./styles/animation-in.scss')),
  })
}

export function onMetingLoadBefore({ options }: MetingOptions, body?: HTMLElement) {
  handleOptions(options, {
    animationIn: () => animationIn(Hook.metingLoadBefore, body),
  })
}

export function onMetingLoad({ options }: MetingOptions, body?: HTMLElement) {
  const cleanups: (() => void)[] = []
  handleOptions(options, {
    lyricHidden: () => {
      cleanups.push(setupHiddenLyricHidingObserver(body?.closest<HTMLElement>('.aplayer') ?? document.body))
    },
    animationIn: () => {
      animationIn(Hook.metingLoad, body)
    },
    autoHidden: () => {
      const stopEventListeners = useAPlayerMiniSwitcherEventListener(body)
      if (stopEventListeners)
        cleanups.push(stopEventListeners)
      autoHidden(Hook.metingLoad, body)
    },
  })
  return () => cleanups.forEach(cleanup => cleanup())
}
