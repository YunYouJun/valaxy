export interface ContentDiagnostic {
  code: string
  severity: 'error' | 'warning'
  message: string
  hint: string
  line?: number
}

export interface ContentPageInfo {
  path: string
  /** Routes after configured build-time hooks; runtime router changes are excluded. */
  routes: { path: string, aliases: string[], previewPath: string, layout: string | false }[]
  /** Only public article metadata, never raw configuration or frontmatter. */
  metadata: Record<string, string | string[] | boolean>
  draft: boolean
  hidden: boolean
  includedInProductionRoutes: boolean
}

export interface ContentCheckResult {
  path: string
  ok: boolean
  page?: ContentPageInfo
  diagnostics: ContentDiagnostic[]
  /** At most 100 diagnostics are returned; this counts all detected diagnostics. */
  totalDiagnostics: number
}

export interface ContentServiceOptions {
  /** Apply the MCP visibility policy. CLI/API callers can inspect their own private files. */
  publicOnly?: boolean
  includeDrafts?: boolean
  /** Resolved Vite base, when called from a running development server. */
  base?: string
  /** Resolved Vite public directory; false disables public assets. */
  publicDir?: string | false
}
