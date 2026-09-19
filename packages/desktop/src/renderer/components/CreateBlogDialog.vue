<script setup lang="ts">
import type { CreateBlogOptions } from '../../shared/types'
import { onMounted, reactive, useTemplateRef } from 'vue'

defineEmits<{
  /** Create this blog in a directory selected by the user. */
  create: [options: CreateBlogOptions]
  /** Dismiss without writing files. */
  close: []
}>()
const form = reactive<CreateBlogOptions>({ directory: 'my-blog', title: '我的博客', author: '' })
const dialog = useTemplateRef('dialog')
onMounted(() => dialog.value?.showModal())
</script>

<template>
  <dialog ref="dialog" class="create-dialog" @cancel.prevent="$emit('close')">
    <form @submit.prevent="$emit('create', { ...form })">
      <h2>创建你的博客</h2>
      <p>填写基本信息，再选择保存位置。运行环境与依赖由工作台准备。</p>
      <label>博客标题<input v-model="form.title" required maxlength="120" autofocus></label>
      <label>作者<input v-model="form.author" required maxlength="120" autocomplete="name"></label>
      <label>目录名称<input v-model="form.directory" required pattern="[a-z0-9][a-z0-9-]{0,63}" title="使用小写字母、数字和短横线"></label>
      <p>首次创建需要联网下载依赖。已有同名目录不会被覆盖。</p>
      <div class="dialog-actions">
        <button type="button" @click="$emit('close')">
          取消
        </button><button type="submit" class="primary">
          选择位置并创建
        </button>
      </div>
    </form>
  </dialog>
</template>

<style scoped>
.create-dialog { width: 450px; max-width: calc(100vw - 40px); padding: 32px; border: 1px solid var(--line); border-radius: 14px; color: var(--ink); background: var(--paper); box-shadow: 0 20px 80px #23324722; }
.create-dialog::backdrop { background: #23324755; }
.create-dialog h2 { font-size: 24px; font-weight: 550; margin-top: 0; }
.create-dialog p { font-size: 12px; line-height: 1.8; color: var(--muted); }
.create-dialog label { display: block; margin: 18px 0; font-size: 12px; }
.create-dialog input { display: block; width: 100%; margin-top: 8px; padding: 10px; border: 1px solid var(--line); border-radius: 6px; font: inherit; font-size: 14px; background: var(--canvas); color: var(--ink); }
.create-dialog input:focus { outline: 2px solid var(--blue); }
.dialog-actions { display: flex; justify-content: flex-end; gap: 12px; margin-top: 26px; }
</style>
