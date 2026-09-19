<script setup lang="ts">
import type { DesktopState } from '../../shared/types'
import { shallowRef, watch } from 'vue'

const props = defineProps<{
  /** Current account selection and last verified deployment. */
  state: DesktopState
  /** An application operation is active. */
  busy: boolean
}>()
defineEmits<{
  /** Start browser-based Cloudflare authorization. */
  login: []
  /** Explicitly create or connect a named Pages project. */
  connect: [accountId: string, name: string]
  /** Build saved files and publish to the displayed target. */
  publish: []
  /** Open the successfully deployed site. */
  visit: []
}>()
const account = shallowRef('')
const name = shallowRef('')
watch(() => props.state.accounts, (accounts) => {
  if (!accounts?.some(item => item.id === account.value))
    account.value = accounts?.[0]?.id || ''
}, { immediate: true })
watch(() => props.state.project?.root, () => {
  name.value = props.state.project?.name.replace(/[^a-z0-9-]/g, '-').slice(0, 59) || ''
}, { immediate: true })
</script>

<template>
  <details class="publish-panel">
    <summary>发布到线上 <span>Cloudflare Pages</span></summary>
    <div class="publish-content">
      <template v-if="!state.accounts?.length">
        <p>连接 Cloudflare 账号，为博客创建一个可以分享的网址。</p>
        <button :disabled="busy" @click="$emit('login')">
          {{ state.publishing ? '请在浏览器中完成授权…' : '登录 Cloudflare' }}
        </button>
      </template>
      <form v-else-if="!state.publishTarget" class="target-form" @submit.prevent="$emit('connect', account, name)">
        <label>发布账号<select v-model="account" required :disabled="busy"><option v-for="item in state.accounts" :key="item.id" :value="item.id">{{ item.name }}</option></select></label>
        <label>站点名称<input v-model="name" required pattern="[a-z0-9][a-z0-9-]{0,57}[a-z0-9]" :disabled="busy" placeholder="my-blog"></label>
        <button :disabled="busy" type="submit">
          创建或连接站点
        </button>
        <button :disabled="busy" type="button" @click="$emit('login')">
          重新登录
        </button>
      </form>
      <template v-else>
        <p class="publish-target">
          {{ state.publishTarget.url }}
        </p>
        <p>发布已保存的文章。博客会重新构建，并更新这个线上站点。</p>
        <button class="primary" :disabled="busy || !state.project?.dependenciesReady" @click="$emit('publish')">
          {{ state.publishing ? '正在构建并发布…' : '构建并发布' }}
        </button>
        <button :disabled="busy" @click="$emit('login')">
          重新登录
        </button>
      </template>
      <p v-if="state.publishedUrl" class="published" role="status">
        发布成功 <button @click="$emit('visit')">
          打开我的博客 ↗
        </button>
      </p>
    </div>
  </details>
</template>

<style scoped>
.publish-panel { border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); background: var(--paper); }
.publish-panel summary { padding: 12px 24px; font-size: 12px; cursor: pointer; }
.publish-panel summary span { margin-left: 12px; font: 10px var(--mono); color: var(--muted); }
.publish-content { padding: 0 24px 18px; }
.publish-content p { font-size: 12px; color: var(--muted); }
.publish-content button + button { margin-left: 8px; }
.target-form { display: flex; align-items: flex-end; flex-wrap: wrap; gap: 12px; }
.target-form label { font-size: 11px; color: var(--muted); }
.target-form input, .target-form select { display: block; margin-top: 7px; padding: 8px; border: 1px solid var(--line); border-radius: 5px; background: var(--paper); color: var(--ink); font: inherit; min-width: 180px; }
.publish-content .publish-target { font: 13px var(--mono); color: var(--ink); }
.publish-content .published { color: var(--green); }
</style>
