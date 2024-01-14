import { addCustomCommand, addCustomTab } from '@vue/devtools-api'
import type { UserModule } from '../types'

import valaxyLogo from '../assets/images/valaxy-logo.png'
import pkg from '../../package.json'

/**
 * add when enable vue devtools
 * https://devtools-next.vuejs.org/plugins/api
 */
export function addValaxyTab() {
  addCustomTab({
    // unique identifier
    name: 'valaxy',
    // title to display in the tab
    title: 'Valaxy',
    // any icon from Iconify, or a URL to an image
    icon: valaxyLogo,
    // iframe view
    view: {
      type: 'iframe',
      src: 'https://valaxy.site',
    },
    // category: 'pinned',
    category: 'app',
  })
}

function addValaxyCommand() {
  addCustomCommand({
    id: 'valaxy',
    title: 'Valaxy',
    icon: valaxyLogo,
    children: [
      {
        id: 'valaxy:github',
        title: 'Github',
        icon: 'i-ri-github-fill',
        action: {
          type: 'url',
          src: pkg.repository.url,
        },
      },
      {
        id: 'valaxy:website',
        title: 'Website',
        icon: valaxyLogo,
        action: {
          type: 'url',
          src: 'https://valaxy.site/',
        },
        order: 2,
      },
    ],
  })
}

export const install: UserModule = ({ isClient }) => {
  const enableDevtools = import.meta.env.DEV && isClient
  if (enableDevtools) {
    addValaxyTab()
    addValaxyCommand()
  }
}
