import type { ChildProcess } from 'node:child_process'
import { spawn } from 'node:child_process'
import { mkdir } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { stripVTControlCharacters } from 'node:util'

/** Run the bundled CLI outside the blog directory, without loading blog config. */
export class WranglerClient {
  private child?: ChildProcess

  constructor(
    private readonly nodePath: string,
    private readonly resources: string,
    private readonly directory: string,
    private readonly openLogin: (url: string) => Promise<void>,
  ) {}

  /** Execute an internal, fixed argument list. Never stream credential output. */
  async run(args: string[], accountId?: string): Promise<string> {
    if (this.child)
      throw new Error('请等待当前 Cloudflare 操作完成。')
    await mkdir(this.directory, { recursive: true })
    return new Promise((resolve, reject) => {
      const child = spawn(this.nodePath, ['--no-warnings', join(this.resources, 'cloudflare/node_modules/wrangler/wrangler-dist/cli.js'), ...args], {
        cwd: this.directory,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...process.env,
          NODE_OPTIONS: undefined,
          ELECTRON_RUN_AS_NODE: undefined,
          CLOUDFLARE_API_TOKEN: undefined,
          CLOUDFLARE_API_KEY: undefined,
          CLOUDFLARE_EMAIL: undefined,
          CLOUDFLARE_ACCOUNT_ID: accountId,
          WRANGLER_SEND_METRICS: 'false',
          FORCE_COLOR: '0',
          PATH: `${dirname(this.nodePath)}${process.platform === 'win32' ? ';' : ':'}${process.env.PATH || ''}`,
        },
      })
      this.child = child
      let output = ''
      let opened = false
      const timeout = setTimeout(() => child.kill('SIGKILL'), 300_000)
      child.stdout.on('data', (data) => {
        output = `${output}${data}`.slice(-4_000_000)
        if (args[0] === 'login' && !opened) {
          const url = stripVTControlCharacters(output).match(/https:\/\/dash\.cloudflare\.com\/oauth2\/auth\?\S+/)?.[0]
          if (url) {
            opened = true
            void this.openLogin(url).catch(() => child.kill())
          }
        }
      })
      // Raw stderr can contain auth diagnostics. Keep only the exit code in UI.
      child.stderr.resume()
      child.once('error', () => {
        clearTimeout(timeout)
        this.child = undefined
        reject(new Error('无法启动发布工具，请重新安装客户端。'))
      })
      child.once('close', (code) => {
        clearTimeout(timeout)
        this.child = undefined
        if (code === 0)
          resolve(stripVTControlCharacters(output))
        else
          reject(new Error(`Cloudflare 操作未完成（${code ?? '已取消'}），请检查网络和登录状态后重试。`))
      })
    })
  }

  /** Stop a pending login or upload when the app exits. */
  close(): void {
    this.child?.kill('SIGKILL')
  }
}
