import type { DevframeConnectionStatus, DevframeRpcClient } from 'devframe/client'
import type {} from '../node/definition'
import type { ServerFunctions } from '../shared/rpc'
import { connectDevframe, consumeOtpFromUrl } from 'devframe/client'
import { ref } from 'vue'

export const connectionStatus = ref<DevframeConnectionStatus>('connecting')
export const connectionError = ref('')
let client: DevframeRpcClient | undefined
let pending: Promise<DevframeRpcClient> | undefined
// Capture before Vue's hash router interprets the authentication fragment.
let initialCode = consumeOtpFromUrl()

export function getClient(): Promise<DevframeRpcClient> {
  return pending ??= connectDevframe({
    // The development SPA is served at /; Kit iframes inherit their connection.
    baseURL: import.meta.env.DEV ? '/__valaxy_devtools__/' : './',
    simpleAuth: false,
    otpParam: false,
    webmcp: false,
    callTimeout: 30_000,
  }).then(async (connected) => {
    if (initialCode) {
      const code = initialCode
      initialCode = undefined
      await connected.requestTrustWithCode(code)
    }
    client = connected
    // `ui` is an optional Hub-provider config; standalone Devframe has none.
    const ui = Reflect.get(connected.connectionMeta.configs || {}, 'ui')
    const primary = ui?.branding?.primaryColor
    if (typeof primary === 'string' && CSS.supports('color', primary))
      document.documentElement.style.setProperty('--devframe-primary', primary)
    connectionStatus.value = connected.status
    connected.events.on('connection:status', (status) => {
      if (client === connected)
        connectionStatus.value = status
    })
    return connected
  }).catch((error) => {
    connectionStatus.value = 'error'
    connectionError.value = error.message
    pending = undefined
    throw error
  })
}

export async function reconnect() {
  const previous = client
  client = undefined
  pending = undefined
  previous?.close?.()
  connectionStatus.value = 'connecting'
  connectionError.value = ''
  await getClient()
}

export const rpc: ServerFunctions = {
  getPostContent: async filePath => (await getClient()).call('valaxy:get-post-content', filePath),
  updatePostContent: async req => (await getClient()).call('valaxy:update-post-content', req),
  getOptions: async () => (await getClient()).call('valaxy:get-options'),
  getPostList: async () => (await getClient()).call('valaxy:get-post-list'),
  getCollectionList: async () => (await getClient()).call('valaxy:get-collection-list'),
  getPageData: async path => (await getClient()).call('valaxy:get-page-data', path),
  updateFrontmatter: async req => (await getClient()).call('valaxy:update-frontmatter', req),
  batchUpdateFrontmatter: async (paths, operations) => (await getClient()).call('valaxy:batch-update-frontmatter', paths, operations),
  getConfig: async () => (await getClient()).call('valaxy:get-config'),
  updateConfigField: async (type, path, value) => (await getClient()).call('valaxy:update-config-field', type, path, value),
  runMigration: async (paths, frontmatter) => (await getClient()).call('valaxy:run-migration', paths, frontmatter),
  createPost: async options => (await getClient()).call('valaxy:create-post', options),
}

if (import.meta.hot)
  import.meta.hot.dispose(() => client?.close?.())
