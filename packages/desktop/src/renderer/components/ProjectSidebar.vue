<script setup lang="ts">
import type { DesktopProject } from '../../shared/types'
import valaxyLogo from '../../../../valaxy/client/assets/images/valaxy-logo.png'

defineProps<{
  /** The inspected project currently selected in the main process. */
  project?: DesktopProject
  /** Previously selected canonical directories, most recent first. */
  recentProjects: string[]
  /** Project switching is unavailable while a runtime is active. */
  disabled: boolean
}>()
defineEmits<{
  /** Select a recent project, or invoke the native picker when omitted. */
  open: [root?: string]
  /** Show the new-blog form. */
  create: []
}>()

function projectName(root: string) {
  return root.split(/[\\/]/).at(-1) || root
}
</script>

<template>
  <aside class="sidebar">
    <div class="brand">
      <img class="brand-mark" :src="valaxyLogo" alt="" width="40" height="40"><div><span class="brand-name">Valaxy</span><span class="brand-caption">桌面工作台</span></div>
    </div>
    <button class="primary open-project" :disabled="disabled" @click="$emit('create')">
      创建博客 <span aria-hidden="true">＋</span>
    </button>
    <button class="open-project" :disabled="disabled" @click="$emit('open')">
      打开项目 <span aria-hidden="true">＋</span>
    </button>
    <h2 class="section-label">
      最近打开
    </h2>
    <ul class="project-list">
      <li v-for="root in recentProjects" :key="root">
        <button class="project-link" :class="{ selected: project?.root === root }" :disabled="disabled" :title="root" @click="$emit('open', root)">
          <span class="project-name">{{ projectName(root) }}</span><span class="project-path">{{ root }}</span>
        </button>
      </li>
    </ul>
    <p v-if="!recentProjects.length" class="empty-history">
      打开的博客会出现在这里。
    </p>
    <div class="sidebar-footer">
      你的文章，留在本地。<br><span>Valaxy Desktop · 预览版</span>
    </div>
  </aside>
</template>

<style scoped>
.sidebar { display: flex; flex-direction: column; padding: 32px 18px 22px; border-right: 1px solid var(--line); background: var(--paper); min-width: 0; }
.brand { display: flex; align-items: center; gap: 12px; margin: 0 12px 36px; font: 650 25px var(--display); letter-spacing: -.8px; }
.brand-mark { width: 40px; height: 40px; object-fit: contain; }
.brand-name { background: var(--brand-text); background-clip: text; color: transparent; }
.brand-caption { display: block; font-size: 11px; font-weight: 400; color: var(--muted); margin-top: 3px; letter-spacing: 2px; }
.open-project { display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 12px 14px; margin-bottom: 8px; }
.section-label { font-size: 11px; color: var(--muted); font-weight: 500; letter-spacing: 1px; margin: 30px 12px 12px; }
.project-list { list-style: none; padding: 0; margin: 0; }
.project-link { width: 100%; text-align: left; padding: 12px; margin-bottom: 5px; border-color: transparent; background: transparent; }
.project-link.selected { background: var(--blue-soft); color: var(--blue); }
.project-name { display: block; font-weight: 550; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.project-path { display: block; font: 10px/1.6 var(--mono); color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; margin-top: 4px; }
.empty-history { color: var(--muted); font-size: 12px; padding: 0 12px; }
.sidebar-footer { margin-top: auto; padding: 30px 12px 0; font-size: 12px; line-height: 1.9; }
.sidebar-footer span { font-size: 10px; color: var(--muted); }
</style>
