import type { CloudflareAccount, PublishTarget } from '../shared/types'

/** A fixed-argument Wrangler invocation whose output stays in the main process. */
export type WranglerRunner = (args: string[], accountId?: string) => Promise<string>

interface PagesProject {
  name: string
  subdomain: string
  production_branch: string
  canonical_deployment?: { url: string, latest_stage: { status: string } }
}

/** Pages adapter with OAuth and asset uploads delegated to the official CLI. */
export class CloudflarePublisher {
  constructor(private readonly run: WranglerRunner, private readonly request: typeof fetch = fetch) {}

  /** Authorize only account selection and Pages publishing scopes. */
  async login(): Promise<CloudflareAccount[]> {
    await this.run(['login', '--browser=false', '--use-keyring', '--scopes', 'account:read', 'user:read', 'pages:write', 'offline_access'])
    return this.accounts()
  }

  /** Query account metadata without returning credentials to the renderer. */
  async accounts(): Promise<CloudflareAccount[]> {
    const result = JSON.parse(await this.run(['whoami', '--json']))
    if (!result.loggedIn || !Array.isArray(result.accounts))
      throw new Error('请先登录 Cloudflare。')
    return result.accounts.map((account: CloudflareAccount) => ({ id: account.id, name: account.name }))
  }

  private async project(accountId: string, name: string): Promise<PagesProject | undefined> {
    const auth = JSON.parse(await this.run(['auth', 'token', '--json']))
    if (!['oauth', 'api_token'].includes(auth.type) || typeof auth.token !== 'string')
      throw new Error('登录已失效，请重新连接 Cloudflare。')
    const response = await this.request(`https://api.cloudflare.com/client/v4/accounts/${accountId}/pages/projects/${name}`, {
      headers: { Authorization: `Bearer ${auth.token}` },
      signal: AbortSignal.timeout(30_000),
    })
    if (response.status === 404)
      return undefined
    const body = await response.json() as { success: boolean, result: PagesProject }
    if (!response.ok || !body.success)
      throw new Error(`读取 Pages 项目失败（${response.status}），请检查账号权限。`)
    return body.result
  }

  /** Connect a named project, creating a Direct Upload project when absent. */
  async connect(accountId: string, name: string): Promise<PublishTarget> {
    if (!/^[a-f0-9]{32}$/.test(accountId) || !/^[a-z0-9][a-z0-9-]{0,57}[a-z0-9]$/.test(name))
      throw new Error('请选择账号，并填写 2–59 个字符的站点名称（小写字母、数字和短横线）。')
    const accounts = await this.accounts()
    if (!accounts.some(account => account.id === accountId))
      throw new Error('当前登录没有这个账号的访问权限。')
    let project = await this.project(accountId, name)
    if (!project) {
      await this.run(['pages', 'project', 'create', name, '--production-branch', 'main'], accountId)
      project = await this.project(accountId, name)
    }
    if (!project || !/^[a-z0-9-]+\.pages\.dev$/.test(project.subdomain) || !project.production_branch)
      throw new Error('Cloudflare 没有返回有效的站点地址。')
    return { accountId, name, url: `https://${project.subdomain}/`, branch: project.production_branch }
  }

  /** Upload the build and verify this deployment rather than an earlier success. */
  async publish(target: PublishTarget, outputDir: string): Promise<string> {
    const output = await this.run(['pages', 'deploy', outputDir, '--project-name', target.name, '--branch', target.branch, '--commit-dirty=true'], target.accountId)
    const deploymentUrls: string[] = output.match(/https:\/\/[a-z0-9.-]+\.pages\.dev/g) || []
    const project = await this.project(target.accountId, target.name)
    const deployment = project?.canonical_deployment
    if (!deployment || deployment.latest_stage.status !== 'success' || !deploymentUrls.includes(deployment.url.replace(/\/$/, '')))
      throw new Error('上传已结束，但尚未确认本次线上部署成功。请检查 Cloudflare 后重试。')
    return target.url
  }
}
