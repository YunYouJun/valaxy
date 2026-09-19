import type { EventEmitter } from 'node:events'
import type { DesktopProject, DesktopState, RuntimeMessage } from '../shared/types'
import { lstat } from 'node:fs/promises'
import { join } from 'node:path'
import process from 'node:process'
import { stripVTControlCharacters } from 'node:util'
import { inspectProject } from './project'

/** Minimal process boundary, also used by lifecycle regression tests. */
export interface RuntimeProcess extends EventEmitter {
  stdout: NodeJS.ReadableStream | null
  stderr: NodeJS.ReadableStream | null
  pid?: number
  postMessage: (message: unknown) => void
  kill: () => boolean
}

/** Owns one preview and one build process for the selected project. */
export class DesktopRuntime {
  readonly state: DesktopState = { recentProjects: [], preview: 'stopped', build: 'idle', logs: '' }
  private previewProcess?: RuntimeProcess
  private buildProcess?: RuntimeProcess
  private buildGeneration = 0
  private installProcess?: RuntimeProcess
  private previewTimer?: ReturnType<typeof setTimeout>
  private closing = false

  constructor(
    private readonly spawn: (mode: 'dev' | 'build' | 'install', root: string, siteUrl?: string) => RuntimeProcess,
    private readonly changed: (state: DesktopState) => void,
  ) {}

  private publish() {
    this.changed(this.state)
  }

  /** Notify observers after a main-process publishing operation. */
  notify(): void {
    this.publish()
  }

  private log(value: string) {
    this.state.logs = `${this.state.logs}${stripVTControlCharacters(value)}`.slice(-96_000)
    this.publish()
  }

  private attachLogs(child: RuntimeProcess) {
    child.stdout?.on('data', data => this.log(data.toString()))
    child.stderr?.on('data', data => this.log(data.toString()))
  }

  private project(): DesktopProject {
    if (this.closing)
      throw new Error('工作台正在关闭。')
    if (!this.state.project)
      throw new Error('请先打开一个 Valaxy 项目。')
    return this.state.project
  }

  /** Select a project only after all previous work has stopped. */
  assertCanSelect(): void {
    if (this.closing || this.previewProcess || this.buildProcess || this.state.build === 'building' || this.state.setup === 'installing')
      throw new Error('请先停止预览和构建，再切换项目。')
  }

  /** Set inspected metadata after all previous operations have completed. */
  selectProject(project: DesktopProject): void {
    this.assertCanSelect()
    Object.assign(this.state, {
      project,
      preview: 'stopped',
      build: 'idle',
      setup: undefined,
      logs: '',
      error: undefined,
      previewUrl: undefined,
      devtoolsUrl: undefined,
      outputDir: undefined,
      publishTarget: undefined,
      publishedUrl: undefined,
      recentProjects: [project.root, ...this.state.recentProjects.filter(root => root !== project.root)].slice(0, 8),
    })
    this.publish()
  }

  /** Start a fresh process so project configuration never enters the main process. */
  startPreview(): void {
    const project = this.project()
    if (!project.dependenciesReady)
      throw new Error('请先点击安装项目依赖。')
    if (this.previewProcess || this.buildProcess || this.state.build === 'building' || this.state.setup === 'installing')
      throw new Error('请等待当前任务完成。')
    this.state.preview = 'starting'
    this.state.error = undefined
    this.publish()
    let child: RuntimeProcess
    try {
      child = this.spawn('dev', project.root)
    }
    catch (error) {
      this.state.preview = 'error'
      this.state.error = String(error)
      this.publish()
      throw error
    }
    this.previewProcess = child
    this.attachLogs(child)
    this.previewTimer = setTimeout(() => {
      this.state.error = '启动超时，请查看日志并重试。'
      void this.stopPreview().then(() => {
        this.state.preview = 'error'
        this.publish()
      })
    }, 120_000)
    child.on('message', (message: RuntimeMessage) => {
      if (this.previewProcess !== child || this.state.preview === 'stopping')
        return
      if (message.type === 'ready') {
        const url = new URL(message.previewUrl)
        if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1') {
          this.state.error = '预览服务必须使用本机 HTTP 地址。'
          void this.stopPreview()
          return
        }
        clearTimeout(this.previewTimer)
        this.state.preview = 'running'
        this.state.previewUrl = url.href
        this.state.devtoolsUrl = message.devtoolsUrl
      }
      else if (message.type === 'error') {
        this.state.error = message.message
      }
      this.publish()
    })
    child.once('exit', (code: number) => {
      clearTimeout(this.previewTimer)
      this.previewProcess = undefined
      const stopped = this.state.preview === 'stopping' || this.closing
      this.state.preview = stopped ? 'stopped' : 'error'
      this.state.previewUrl = undefined
      this.state.devtoolsUrl = undefined
      if (!stopped)
        this.state.error ||= `预览进程已退出（${code}），请查看日志后重新启动。`
      this.publish()
    })
    child.once('error', (error: Error) => {
      clearTimeout(this.previewTimer)
      this.previewProcess = undefined
      this.state.preview = 'error'
      this.state.error = error.message
      this.publish()
    })
  }

  /** Stop preview and release its listening port before allowing another start. */
  async stopPreview(): Promise<void> {
    const child = this.previewProcess
    if (!child)
      return
    clearTimeout(this.previewTimer)
    this.state.preview = 'stopping'
    this.publish()
    await terminate(child)
  }

  /** Build saved files into the project's dist directory using the SSG engine. */
  async buildSite(siteUrl?: string): Promise<void> {
    const project = this.project()
    if (!project.dependenciesReady)
      throw new Error('请先点击安装项目依赖。')
    if (this.buildProcess || this.state.setup === 'installing' || this.state.build === 'building' || ['starting', 'stopping'].includes(this.state.preview))
      throw new Error('请等待当前任务完成。')
    this.state.build = 'building'
    const generation = ++this.buildGeneration
    this.state.outputDir = undefined
    this.state.error = undefined
    this.publish()
    try {
      // Vite empties this directory. Never follow an output symlink.
      const output = await lstat(join(project.root, 'dist')).catch((error: NodeJS.ErrnoException) => {
        if (error.code !== 'ENOENT')
          throw error
      })
      if (output?.isSymbolicLink())
        throw new Error('dist 是符号链接。请改为普通输出目录后再构建。')
      if (this.closing || generation !== this.buildGeneration)
        return
      const child = this.spawn('build', project.root, siteUrl)
      this.buildProcess = child
      this.attachLogs(child)
      let completed = false
      child.on('message', (message: RuntimeMessage) => {
        if (this.state.build !== 'building')
          return
        if (message.type === 'built')
          completed = true
        else if (message.type === 'error')
          this.state.error = message.message
      })
      child.once('exit', (code: number) => {
        this.buildProcess = undefined
        if (this.state.build === 'building') {
          this.state.build = code === 0 && completed ? 'success' : 'error'
          if (this.state.build === 'success')
            this.state.outputDir = join(project.root, 'dist')
          else
            this.state.error ||= `构建失败（${code}），请查看运行日志。`
        }
        this.publish()
      })
      child.once('error', (error: Error) => {
        this.buildProcess = undefined
        this.state.build = 'error'
        this.state.error = error.message
        this.publish()
      })
    }
    catch (error) {
      this.state.build = 'error'
      this.state.error = error instanceof Error ? error.message : String(error)
      this.publish()
      throw error
    }
  }

  /** Resolve only when the current build has produced verified output. */
  async waitForBuild(): Promise<string> {
    if (this.buildProcess) {
      await new Promise<void>((resolve) => {
        this.buildProcess!.once('exit', () => resolve())
        this.buildProcess!.once('error', () => resolve())
      })
    }
    if (this.state.build !== 'success' || !this.state.outputDir)
      throw new Error(this.state.error || '构建未完成，尚未发布任何文件。')
    return this.state.outputDir
  }

  /** Install dependencies with the bundled Node and pnpm, with a retryable state. */
  async installDependencies(): Promise<void> {
    this.assertCanSelect()
    const project = this.project()
    this.state.setup = 'installing'
    this.state.error = undefined
    this.publish()
    try {
      await new Promise<void>((resolve, reject) => {
        const child = this.spawn('install', project.root)
        this.installProcess = child
        this.attachLogs(child)
        child.once('error', reject)
        child.once('exit', (code: number) => code === 0 ? resolve() : reject(new Error('依赖安装失败，请检查网络后重试。')))
      })
      this.state.project = await inspectProject(project.root)
      if (!this.state.project.dependenciesReady)
        throw new Error('安装结束，但 Valaxy 仍不可用，请查看运行日志。')
      this.state.setup = undefined
    }
    catch (error) {
      this.state.setup = 'error'
      this.state.error = error instanceof Error ? error.message : String(error)
      throw error
    }
    finally {
      this.installProcess = undefined
      this.publish()
    }
  }

  /** Cancel a build without presenting partial output as a successful artifact. */
  async cancelBuild(): Promise<void> {
    if (this.state.build !== 'building')
      return
    this.buildGeneration++
    this.state.build = 'cancelled'
    this.state.outputDir = undefined
    this.publish()
    if (this.buildProcess)
      await terminate(this.buildProcess)
  }

  /** Release all owned processes on application exit. */
  async close(): Promise<void> {
    this.closing = true
    await Promise.all([this.stopPreview(), this.cancelBuild(), this.installProcess ? terminate(this.installProcess) : undefined])
  }
}

async function terminate(child: RuntimeProcess): Promise<void> {
  await new Promise<void>((resolve) => {
    const killTimer = setTimeout(() => child.kill(), 3_000)
    const forceTimer = setTimeout(() => {
      if (child.pid) {
        try {
          process.kill(child.pid, 'SIGKILL')
        }
        catch { /* The exit event may already be queued. */ }
      }
    }, 5_000)
    child.once('exit', () => {
      clearTimeout(killTimer)
      clearTimeout(forceTimer)
      resolve()
    })
    child.postMessage('stop')
  })
}
