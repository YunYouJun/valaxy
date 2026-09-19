<script setup lang="ts">
import type { DesktopState } from '../../shared/types'
import { computed, shallowRef } from 'vue'
import PublishPanel from './PublishPanel.vue'
import RuntimeLog from './RuntimeLog.vue'
import WelcomeWorkspace from './WelcomeWorkspace.vue'

const props = defineProps<{
  /** Authoritative project and process state. */
  state: DesktopState
  /** The most recent actionable failure. */
  error?: string
  /** An action or lifecycle transition is in progress. */
  busy: boolean
}>()
defineEmits<{
  /** Start the local preview service. */
  start: []
  /** Stop the preview service after a save reminder. */
  stop: []
  /** Build saved articles into static files. */
  build: []
  /** Cancel the current build. */
  cancel: []
  /** Reveal the last successful output. */
  output: []
  /** Open the running preview in the system browser. */
  preview: []
  /** Choose a project directory. */
  open: []
  /** Show the new-blog form. */
  create: []
  /** Prepare the project's dependencies. */
  install: []
  /** Connect a Cloudflare account. */
  login: []
  /** Select or create the publishing target. */
  connect: [accountId: string, name: string]
  /** Build and publish the current blog. */
  publish: []
  /** Open the deployed site. */
  visit: []
}>()
const tab = shallowRef<'editor' | 'preview'>('editor')
const statusLabel = computed(() => ({ stopped: '尚未启动', starting: '正在启动', running: '预览运行中', stopping: '正在停止', error: '启动失败' })[props.state.preview])
const buildLabel = computed(() => ({ idle: '构建静态站点', building: '正在构建…', success: '重新构建', error: '重试构建', cancelled: '重新构建' })[props.state.build])
</script>

<template>
  <main class="workspace">
    <header class="workspace-header">
      <div><span class="section-label">当前项目</span><h1>{{ state.project?.name || '开始写作之前' }}</h1></div>
      <span v-if="state.project" class="runtime-status" :class="{ running: state.preview === 'running' }" role="status"><i />{{ statusLabel }}</span>
    </header>
    <div v-if="error" class="error-banner" role="alert">
      {{ error }}
    </div>
    <template v-if="state.project">
      <div class="project-toolbar">
        <div class="project-location">
          <code>{{ state.project.root }}</code><span>Valaxy {{ state.project.version }}</span>
        </div>
        <div class="actions">
          <button v-if="!state.project.dependenciesReady || state.setup === 'error'" class="primary" :disabled="busy" @click="$emit('install')">
            {{ state.setup === 'installing' ? '正在安装依赖…' : '安装项目依赖' }}
          </button>
          <button v-if="state.preview === 'running'" :disabled="busy" @click="$emit('stop')">
            停止预览
          </button>
          <button v-else class="primary" :disabled="busy || !state.project.dependenciesReady" @click="$emit('start')">
            {{ state.preview === 'starting' ? '正在启动…' : '启动预览' }}
          </button>
          <button :disabled="busy || !state.project.dependenciesReady" @click="$emit('build')">
            {{ buildLabel }}
          </button>
          <button v-if="state.build === 'building'" @click="$emit('cancel')">
            取消构建
          </button>
          <button v-if="state.build === 'success'" @click="$emit('output')">
            打开产物目录 ↗
          </button>
        </div>
      </div>
      <div v-if="state.build === 'success'" class="build-result" role="status">
        静态站点已生成至 dist，可以上传到静态托管服务。
      </div>
      <div v-else-if="state.build === 'cancelled'" class="build-result" role="status">
        构建已取消。部分输出不代表完整站点，请重新构建。
      </div>
      <PublishPanel :state="state" :busy="busy" @login="$emit('login')" @connect="(account, name) => $emit('connect', account, name)" @publish="$emit('publish')" @visit="$emit('visit')" />
      <template v-if="state.preview === 'running'">
        <nav class="workspace-tabs" aria-label="工作区视图">
          <button :aria-pressed="tab === 'editor'" @click="tab = 'editor'">
            文章与配置
          </button>
          <button :aria-pressed="tab === 'preview'" @click="tab = 'preview'">
            站点预览
          </button>
          <button class="browser-link" @click="$emit('preview')">
            在浏览器中打开 ↗
          </button>
        </nav>
        <div class="frame-container">
          <iframe v-if="state.devtoolsUrl" v-show="tab === 'editor'" :src="state.devtoolsUrl" title="Valaxy 文章与配置" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
          <div v-else-if="tab === 'editor'" class="empty-workspace">
            项目关闭了 DevTools。请在 valaxy.config.ts 中启用 devtools，再重新启动预览。
          </div>
          <iframe v-show="tab === 'preview'" :src="state.previewUrl" title="Valaxy 站点预览" sandbox="allow-scripts allow-same-origin allow-forms allow-popups" />
        </div>
      </template>
      <div v-else class="empty-workspace">
        <div class="writing-line" aria-hidden="true" />
        <h2>{{ state.preview === 'starting' ? '正在准备你的写作空间' : '让下一篇文章，从这里开始。' }}</h2>
        <p>启动预览，即可管理文章、编辑正文和调整配置。</p>
        <p class="muted">
          构建使用已保存的文件，并更新项目中的 dist 目录。
        </p>
      </div>
    </template>
    <WelcomeWorkspace v-else :busy="busy" @create="$emit('create')" @open="$emit('open')" />
    <RuntimeLog :logs="state.logs" />
  </main>
</template>

<style scoped>
.workspace { display: flex; flex-direction: column; min-width: 0; min-height: 0; }
.workspace-header { padding: 28px 30px 24px; display: flex; align-items: center; justify-content: space-between; gap: 20px; background: var(--paper); border-bottom: 1px solid var(--line); }
.section-label { font-size: 10px; letter-spacing: 1.5px; color: var(--muted); }
.workspace-header h1 { font-size: 21px; font-weight: 550; margin: 7px 0 0; }
.runtime-status { display: flex; align-items: center; gap: 7px; color: var(--muted); font-size: 12px; white-space: nowrap; }
.runtime-status i { width: 6px; height: 6px; background: currentColor; border-radius: 50%; }
.runtime-status.running { color: var(--green); }
.project-toolbar { padding: 18px 24px; display: flex; flex-wrap: wrap; gap: 16px; align-items: center; justify-content: space-between; }
.project-location { min-width: 0; flex: 1 1 220px; }
.project-location code { display: block; font: 11px var(--mono); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.project-location span { display: block; margin-top: 6px; font-size: 10px; color: var(--muted); }
.actions { display: flex; gap: 8px; flex-wrap: wrap; }
.error-banner { color: #9d313f; background: #fff0f1; padding: 14px 24px; font-size: 13px; overflow-wrap: anywhere; }
.build-result { padding: 0 24px 14px; font-size: 12px; color: var(--green); }
.workspace-tabs { display: flex; align-items: center; gap: 8px; padding: 0 24px 12px; }
.workspace-tabs button { border: 0; background: transparent; color: var(--muted); }
.workspace-tabs button[aria-pressed=true] { color: var(--blue); background: var(--blue-soft); }
.workspace-tabs .browser-link { margin-left: auto; font-size: 11px; }
.frame-container { position: relative; flex: 1; min-height: 0; background: var(--paper); }
.frame-container iframe { width: 100%; height: 100%; border: 0; }
.empty-workspace { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 40px; text-align: center; color: var(--muted); }
.empty-workspace h2 { color: var(--ink); font-size: 23px; font-weight: 450; }
.empty-workspace p { margin: 0 0 12px; font-size: 13px; }
.empty-workspace .muted { font-size: 11px; }
.writing-line { height: 3px; width: 70px; background: var(--blue); margin-bottom: 16px; transform: rotate(-12deg); }
</style>
