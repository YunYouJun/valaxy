import type { WalineInitOptions } from '@waline/client'

export interface WalineCustomOptions {
  /**
   * emoji cdn
   */
  cdn?: string
  emoji?: string[]
  types?: string[]
}

export type WalineOptions = { cdn?: string, types?: string[], emoji?: string[] } & WalineInitOptions
