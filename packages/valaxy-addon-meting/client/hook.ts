import type { MetingOptions } from '../node/index'
import { animationIn, aplayerMiniswitcherEventListener, autoHidden, handleOptions } from './utils'
import { setupHiddenLyricHidingObserver } from './observer'

export enum Hook {
  metingInit = 'metingInit',
  metingLoadBefore = 'metingLoadBefore',
  metingLoad = 'metingLoad',
}

export function onMetingInit({ options }: MetingOptions) {
  handleOptions(options, {
    animationIn: () => import('../style/animation-in.scss'),
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
      aplayerMiniswitcherEventListener()
      autoHidden(Hook.metingLoad)
    },
  })
}
