import { onMounted } from 'vue'
import type { MetingOptions } from '../node/index'
import { animationIn, autoHidden, handleOptions, useAPlayerMiniSwitcherEventListener } from './utils'
import { setupHiddenLyricHidingObserver } from './observer'

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

export function onMetingLoadBefore({ options }: MetingOptions) {
  handleOptions(options, {
    animationIn: () => animationIn(Hook.metingLoadBefore),
  })
}

export function onMetingLoad({ options }: MetingOptions) {
  handleOptions(options, {
    lyricHidden: () => setupHiddenLyricHidingObserver(),
    animationIn: () => {
      animationIn(Hook.metingLoad)
    },
    autoHidden: () => {
      useAPlayerMiniSwitcherEventListener()
      autoHidden(Hook.metingLoad)
    },
  })
}
