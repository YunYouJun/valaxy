import type { WalineInitOptions } from '@waline/client'

export interface WalineCustomOptions {
  /**
   * emoji cdn
   */
  cdn?: string
}

export type WalineOptions = { cdn?: string } & WalineInitOptions
