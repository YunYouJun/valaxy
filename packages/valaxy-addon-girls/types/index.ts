export interface GirlEntry {
  name: string
  avatar?: string
  from?: string
  reason?: string
  url?: string
  [key: string]: unknown
}

export type GirlsSource = GirlEntry[] | string

export type GirlReasonMode = 'hidden' | 'inline' | 'hover'

export type GirlsLayout = 'bubbles' | 'grid' | 'orbit'

export type GirlsMotionMode = 'auto' | 'off'

export type GirlsRenderMode = 'all' | 'progressive'

export interface GirlsLayoutProps {
  autoLoad: boolean
  batchSize: number
  girls: readonly GirlEntry[]
  initialCount: number
  motion: GirlsMotionMode
  reasonMode: GirlReasonMode
  renderMode: GirlsRenderMode
  selectedIndex: number
}

export interface GirlsHeaderSlotProps {
  count: number
  error: Error | null
  isLoading: boolean
  random: boolean
}
