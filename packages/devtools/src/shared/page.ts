import type { InPageChannelProtocol } from 'devframe/in-page-channel'
import type { ClientPageData } from './rpc'

export const PAGE_CHANNEL = 'valaxy:page'

export interface ValaxyPageProtocol extends InPageChannelProtocol {
  functions: {
    pageScript: { getPage: () => ClientPageData }
    panel: Record<string, never>
  }
  events: {
    pageScript: Record<string, never>
    panel: { pageUpdated: (page: ClientPageData) => void }
  }
}
