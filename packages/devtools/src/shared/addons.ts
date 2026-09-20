export interface InstalledAddon {
  name: string
  version?: string
  specifier?: string
  description?: string
  /** Enabled in the running Valaxy configuration, including theme addons. */
  enabled: boolean
  /** Only direct dependencies of this project may be removed. */
  direct: boolean
}

export interface AddonPackageDetails {
  name: string
  version: string
  description: string
  homepage?: string
  repository?: string
  license?: string
  peerDependencies: Record<string, string>
}

export interface AddonOperationPlan {
  id: string
  action: 'install' | 'remove'
  name: string
  version?: string
  command: string
  configFile?: string
  configBefore?: string
  configAfter?: string
}

export interface AddonOperation extends AddonOperationPlan {
  status: 'running' | 'succeeded' | 'failed'
  log: string
  error?: string
}

export interface AddonInventory {
  installed: InstalledAddon[]
  /** Null means package management is unavailable; browsing remains usable. */
  packageManager: 'pnpm' | null
  managementError?: string
  configFile?: string
  operation?: AddonOperation
}
