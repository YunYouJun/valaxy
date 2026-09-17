/** Browser-local diagnostics, separate from the server's source-file config. */
export interface ValaxyPageDebug {
  route: {
    path: string
    fullPath: string
    name?: string
    layout: string
    query: Record<string, unknown>
    params: Record<string, unknown>
  }
  viewport: {
    width: number
    height: number
    breakpoints: { label: string, active: boolean }[]
  }
  config: {
    theme: string
    site: { lang?: string, title?: string, url?: string }
    themeConfig: Record<string, unknown>
  }
}
