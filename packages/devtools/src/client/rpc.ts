import type { ClientFunctions, ServerFunctions } from '../../rpc'
import { createRPCClient } from 'vite-dev-rpc'
import { createHotContext } from 'vite-hot-client'
import { NAMESPACE } from '../config'

// use this instead of import.meta.hot
const hot = createHotContext('/___', `${location.pathname.split('/__valaxy_devtools__')[0] || ''}/`.replace(/\/\//g, '/'))
export const rpc = createRPCClient<ServerFunctions, ClientFunctions>(
  NAMESPACE,
  hot,
  {
    async onModuleUpdated() {
      // onModuleUpdated.trigger()
    },
  },
)
