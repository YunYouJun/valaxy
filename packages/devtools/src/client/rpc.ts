import type { ClientFunctions, ServerFunctions } from '../rpc'
import { createRPCClient } from 'vite-dev-rpc'

export const rpc = createRPCClient<ServerFunctions, ClientFunctions>('demo', import.meta.hot, {
  // client functions
})
