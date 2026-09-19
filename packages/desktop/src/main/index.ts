import type { IpcMainInvokeEvent } from 'electron'
import type { CreateBlogOptions } from '../shared/types'
import { fork } from 'node:child_process'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import process from 'node:process'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { app, BrowserWindow, dialog, ipcMain, Menu, shell } from 'electron'
import { CloudflarePublisher } from './cloudflare'
import { createBlog } from './onboarding'
import { inspectProject } from './project'
import { DesktopRuntime } from './runtime'
import { WranglerClient } from './wrangler'

const directory = dirname(fileURLToPath(import.meta.url))
const resources = app.isPackaged ? join(process.resourcesPath, 'desktop') : join(directory, '../../resources')
const nodePath = join(resources, 'runtime', process.platform === 'win32' ? 'node.exe' : 'node')
const workerPath = app.isPackaged ? join(process.resourcesPath, 'app.asar.unpacked/dist/main/worker.js') : join(directory, 'worker.js')
const rendererUrl = pathToFileURL(join(directory, '../renderer/index.html')).href
let window: BrowserWindow | undefined
let quitting = false
let selecting = false
let publishTimer: ReturnType<typeof setTimeout> | undefined
const runtime = new DesktopRuntime((mode, root, siteUrl) => {
  const child = fork(workerPath, [mode, root, join(resources, 'pnpm/bin/pnpm.cjs'), siteUrl || ''], {
    cwd: root,
    execPath: nodePath,
    stdio: ['ignore', 'pipe', 'pipe', 'ipc'],
    execArgv: ['--max-old-space-size=4096'],
    env: {
      ...process.env,
      FORCE_COLOR: '0',
      ELECTRON_RUN_AS_NODE: undefined,
      NODE_OPTIONS: undefined,
      PATH: `${dirname(nodePath)}${process.platform === 'win32' ? ';' : ':'}${process.env.PATH || ''}`,
    },
  })
  return Object.assign(child, { postMessage: (message: unknown) => {
    if (child.connected)
      child.send(message as string)
  } })
}, () => {
  // Coalesce verbose build output instead of cloning the entire log per chunk.
  publishTimer ??= setTimeout(() => {
    publishTimer = undefined
    if (window && !window.isDestroyed())
      window.webContents.send('desktop:state', runtime.state)
  }, 50)
})
let wrangler: WranglerClient
let publisher: CloudflarePublisher
let cloudflareBusy = false

function validateSender(event: IpcMainInvokeEvent) {
  if (!window || event.sender !== window.webContents || event.senderFrame !== window.webContents.mainFrame || event.senderFrame.url !== rendererUrl)
    throw new Error('Unknown desktop IPC sender')
}

function handle(channel: string, action: (...args: any[]) => unknown) {
  ipcMain.handle(channel, (event, ...args) => {
    validateSender(event)
    if (cloudflareBusy && !['desktop:state', 'desktop:open-preview', 'desktop:open-published', 'desktop:cancel-build'].includes(channel))
      throw new Error('请等待当前发布操作完成。')
    return action(...args)
  })
}

async function cloudflareAction(action: () => Promise<void>) {
  cloudflareBusy = true
  runtime.state.publishing = true
  runtime.state.error = undefined
  runtime.notify()
  try {
    await action()
  }
  catch (error) {
    runtime.state.error = error instanceof Error ? error.message : String(error)
    throw error
  }
  finally {
    cloudflareBusy = false
    runtime.state.publishing = false
    runtime.notify()
  }
}

async function saveHistory() {
  const storage = join(app.getPath('userData'), 'projects.json')
  await mkdir(dirname(storage), { recursive: true })
  await writeFile(storage, JSON.stringify(runtime.state.recentProjects), 'utf8')
}

async function createProject(options: CreateBlogOptions) {
  if (selecting)
    return
  selecting = true
  try {
    runtime.assertCanSelect()
    const selected = await dialog.showOpenDialog(window!, { title: '选择博客的保存位置', properties: ['openDirectory', 'createDirectory'] })
    if (selected.canceled)
      return
    const root = await createBlog(selected.filePaths[0], options, resources)
    runtime.selectProject(await inspectProject(root))
    await saveHistory()
    await runtime.installDependencies()
    runtime.startPreview()
  }
  finally {
    selecting = false
  }
}

async function openProject(recentRoot?: unknown) {
  if (selecting)
    return
  selecting = true
  try {
    let root: string | undefined
    if (recentRoot !== undefined) {
      if (typeof recentRoot !== 'string' || !runtime.state.recentProjects.includes(recentRoot))
        throw new Error('请通过目录选择器打开项目。')
      root = recentRoot
    }
    else {
      const selected = await dialog.showOpenDialog(window!, { title: '打开 Valaxy 项目', properties: ['openDirectory'] })
      if (!selected.canceled)
        root = selected.filePaths[0]
    }
    if (!root)
      return
    runtime.selectProject(await inspectProject(root))
    await saveHistory()
  }
  finally {
    selecting = false
  }
}

function createWindow() {
  window = new BrowserWindow({
    width: 1280,
    height: 860,
    minWidth: 900,
    minHeight: 640,
    title: 'Valaxy Desktop',
    backgroundColor: '#f6f8fc',
    webPreferences: {
      preload: join(directory, 'preload.cjs'),
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      nodeIntegrationInSubFrames: false,
      webviewTag: false,
    },
  })
  window.webContents.on('will-navigate', event => event.preventDefault())
  window.webContents.setWindowOpenHandler(({ url }) => {
    // Article preview links may open in the user's browser. Other protocols and
    // unrelated remote URLs never reach the privileged shell API.
    if (runtime.state.previewUrl && new URL(url).origin === new URL(runtime.state.previewUrl).origin)
      void shell.openExternal(url)
    return { action: 'deny' }
  })
  window.webContents.session.setPermissionRequestHandler((_contents, _permission, callback) => callback(false))
  window.webContents.session.setPermissionCheckHandler(() => false)
  window.on('close', (event) => {
    if (!quitting) {
      event.preventDefault()
      app.quit()
    }
  })
  void window.loadURL(rendererUrl)
}

if (process.env.VALAXY_DESKTOP_USER_DATA && !app.isPackaged)
  app.setPath('userData', process.env.VALAXY_DESKTOP_USER_DATA)

async function main() {
  if (!app.requestSingleInstanceLock()) {
    app.quit()
  }
  else {
    app.on('second-instance', () => {
      if (window?.isMinimized())
        window.restore()
      window?.focus()
    })
    await app.whenReady()
    wrangler = new WranglerClient(nodePath, resources, join(app.getPath('userData'), 'publish'), url => shell.openExternal(url))
    publisher = new CloudflarePublisher((args, account) => wrangler.run(args, account))
    try {
      const recent = JSON.parse(await readFile(join(app.getPath('userData'), 'projects.json'), 'utf8'))
      if (Array.isArray(recent))
        runtime.state.recentProjects = recent.filter((value: unknown) => typeof value === 'string').slice(0, 8)
    }
    catch { /* Missing or corrupt history must not prevent startup. */ }
    handle('desktop:state', () => runtime.state)
    handle('desktop:cloudflare-login', () => cloudflareAction(async () => {
      runtime.state.accounts = await publisher.login()
      if (!runtime.state.accounts.some(account => account.id === runtime.state.publishTarget?.accountId)) {
        runtime.state.publishTarget = undefined
        runtime.state.publishedUrl = undefined
      }
    }))
    handle('desktop:publish-target', (account: unknown, name: unknown) => cloudflareAction(async () => {
      if (!runtime.state.project || typeof account !== 'string' || typeof name !== 'string')
        throw new Error('请先打开博客并填写发布信息。')
      runtime.state.publishTarget = await publisher.connect(account, name)
    }))
    handle('desktop:publish', () => cloudflareAction(async () => {
      const target = runtime.state.publishTarget
      if (!target)
        throw new Error('请先连接发布站点。')
      runtime.state.publishedUrl = undefined
      await runtime.buildSite(target.url)
      const output = await runtime.waitForBuild()
      if (quitting)
        throw new Error('发布已取消。')
      runtime.state.publishedUrl = await publisher.publish(target, output)
    }))
    handle('desktop:open-published', async () => {
      const url = runtime.state.publishedUrl
      if (url)
        await shell.openExternal(url)
    })
    handle('desktop:open-project', openProject)
    handle('desktop:create-blog', createProject)
    handle('desktop:install', () => runtime.installDependencies())
    handle('desktop:start-preview', () => runtime.startPreview())
    handle('desktop:stop-preview', async () => {
      const result = await dialog.showMessageBox(window!, {
        type: 'question',
        message: '停止预览并关闭文章编辑器？',
        detail: '请先保存编辑器中的修改。',
        buttons: ['继续编辑', '停止预览'],
        defaultId: 0,
        cancelId: 0,
      })
      if (result.response === 1)
        await runtime.stopPreview()
    })
    handle('desktop:build', () => runtime.buildSite())
    handle('desktop:cancel-build', () => runtime.cancelBuild())
    handle('desktop:open-output', async () => {
      if (!runtime.state.outputDir || runtime.state.build !== 'success')
        throw new Error('请先成功构建站点。')
      const error = await shell.openPath(runtime.state.outputDir)
      if (error)
        throw new Error(error)
    })
    handle('desktop:open-preview', async () => {
      if (runtime.state.previewUrl)
        await shell.openExternal(runtime.state.previewUrl)
    })
    Menu.setApplicationMenu(Menu.buildFromTemplate([
      ...(process.platform === 'darwin' ? [{ role: 'appMenu' as const }] : []),
      { role: 'editMenu' },
      { role: 'viewMenu' },
      { role: 'windowMenu' },
    ]))
    createWindow()
  }
}
void main().catch((error) => {
  dialog.showErrorBox('Valaxy Desktop 启动失败', String(error))
  app.exit(1)
})

app.on('before-quit', (event) => {
  if (quitting)
    return
  event.preventDefault()
  if (runtime.state.preview === 'running' || runtime.state.build === 'building' || runtime.state.setup === 'installing' || cloudflareBusy) {
    const response = dialog.showMessageBoxSync(window!, {
      type: 'question',
      message: '关闭 Valaxy Desktop？',
      detail: '请先保存编辑器中的修改。预览和正在运行的构建会停止。',
      buttons: ['继续使用', '关闭'],
      defaultId: 0,
      cancelId: 0,
    })
    if (response !== 1)
      return
  }
  quitting = true
  wrangler?.close()
  void runtime.close().finally(() => app.quit())
})
