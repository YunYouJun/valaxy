import type { UserModule } from '../types'

import { normalizeRepositoryUrl } from '@valaxyjs/utils'
import pkg from '../../package.json'
import valaxyLogo from '../assets/images/valaxy-logo.png'

// import {addCustomCommand, addCustomTab } from '@vue/devtools-api'

/**
 * add when enable vue devtools
 * https://devtools-next.vuejs.org/plugins/api
 */
export async function addValaxyTabAndCommand() {
  const { addCustomTab, addCustomCommand } = await import('@vue/devtools-api')
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
      // src: import.meta.env.DEV ? 'http://localhost:5001/' : '/__valaxy_devtools__/',
      src: '/__valaxy_devtools__/',
    },
    // category: 'pinned',
    category: 'app',
  })

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
          src: normalizeRepositoryUrl(pkg.repository.url),
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

export const install: UserModule = async () => {
  await addValaxyTabAndCommand()
}
