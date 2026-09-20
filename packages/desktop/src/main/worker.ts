import type { RuntimeMessage } from '../shared/types'
import { stat } from 'node:fs/promises'
import { createRequire } from 'node:module'
import { createServer } from 'node:net'
import { join } from 'node:path'
import process from 'node:process'
import { pathToFileURL } from 'node:url'

const [mode, root, siteUrl] = process.argv.slice(2)
const send = (message: RuntimeMessage) => process.send?.(message)

async function main() {
  // Resolve the project's own Valaxy, themes, and addons, never the app's copies.
  const require = createRequire(join(root, 'package.json'))
  const valaxy = await import(pathToFileURL(require.resolve('valaxy')).href)
  if (valaxy.desktopRuntimeVersion !== 1)
    throw new Error('当前 Valaxy 版本不支持桌面工作台，请升级到包含 desktopRuntimeVersion: 1 的版本。仓库开发请先运行 pnpm build。')

  if (mode === 'dev') {
    const port = await new Promise<number>((resolve, reject) => {
      const socket = createServer()
      socket.on('error', reject)
      socket.listen(0, '127.0.0.1', () => {
        const address = socket.address()
        const port = typeof address === 'object' && address ? address.port : 0
        socket.close(() => resolve(port))
      })
    })
    const server = await valaxy.startValaxyDev({
      root,
      remote: false,
      open: false,
      vite: {
        devtools: false,
        server: { host: '127.0.0.1', port, strictPort: true, open: false, https: undefined },
      },
    })
    if (!server?.resolvedUrls?.local[0])
      throw new Error('预览服务没有返回可用地址，请查看运行日志。')
    const previewUrl = server.resolvedUrls.local[0]
    const devtoolsUrl = server.config.plugins.find((plugin: { name: string }) => plugin.name === 'valaxy:devtools')?.api?.getStandaloneOpenUrl(previewUrl)
    send({ type: 'ready', previewUrl, devtoolsUrl })
    process.on('message', async (message) => {
      if (message === 'stop') {
        await valaxy.GLOBAL_STATE.server?.close()
        process.exit(0)
      }
    })
  }
  else if (mode === 'build') {
    // The managed Node process already has a 4 GB heap. Keep its IPC channel
    // instead of allowing the SSG engine to respawn another CLI process.
    process.env.__VALAXY_SSG_NO_RESPAWN__ = '1'
    await valaxy.execBuild({ root, ssg: true, output: 'dist', log: 'info', siteUrl: siteUrl || undefined })
    const outputDir = join(root, 'dist')
    if (!await stat(join(outputDir, 'index.html')).then(value => value.isFile()).catch(() => false))
      throw new Error('构建未生成 dist/index.html，请检查项目配置和日志。')
    send({ type: 'built', outputDir })
    process.exit(0)
  }
  else {
    throw new Error('Unknown runtime action')
  }
}
void main().catch((error) => {
  console.error(error)
  send({ type: 'error', message: error instanceof Error ? error.message : String(error) })
  process.exit(1)
})
