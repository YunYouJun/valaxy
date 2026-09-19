/** A project selected by the user through the native directory picker. */
export interface DesktopProject {
  root: string
  name: string
  version: string
  dependenciesReady: boolean
}

/** Serializable lifecycle state owned by the main process. */
export interface DesktopState {
  project?: DesktopProject
  recentProjects: string[]
  preview: 'stopped' | 'starting' | 'running' | 'stopping' | 'error'
  build: 'idle' | 'building' | 'success' | 'error' | 'cancelled'
  previewUrl?: string
  devtoolsUrl?: string
  outputDir?: string
  error?: string
  logs: string
  setup?: 'installing' | 'error'
  accounts?: CloudflareAccount[]
  publishTarget?: PublishTarget
  publishing?: boolean
  publishedUrl?: string
}

/** Cloudflare account metadata without credentials. */
export interface CloudflareAccount { id: string, name: string }

/** A verified Pages project selected for this local blog. */
export interface PublishTarget { accountId: string, name: string, url: string, branch: string }

/** New-blog metadata collected by the creation form. */
export interface CreateBlogOptions {
  directory: string
  title: string
  author: string
}

/** Explicit desktop capabilities; no generic IPC or shell access is exposed. */
export interface DesktopApi {
  loginCloudflare: () => Promise<void>
  connectPublishTarget: (accountId: string, name: string) => Promise<void>
  publishSite: () => Promise<void>
  openPublishedSite: () => Promise<void>
  createBlog: (options: CreateBlogOptions) => Promise<void>
  installDependencies: () => Promise<void>
  getState: () => Promise<DesktopState>
  openProject: (recentRoot?: string) => Promise<void>
  startPreview: () => Promise<void>
  stopPreview: () => Promise<void>
  buildSite: () => Promise<void>
  cancelBuild: () => Promise<void>
  openOutput: () => Promise<void>
  openPreview: () => Promise<void>
  onState: (listener: (state: DesktopState) => void) => () => void
}

/** Messages returned by a project runtime process. */
export type RuntimeMessage
  = | { type: 'ready', previewUrl: string, devtoolsUrl?: string }
    | { type: 'built', outputDir: string }
    | { type: 'error', message: string }
