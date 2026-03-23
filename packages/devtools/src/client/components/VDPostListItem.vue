<script setup lang="ts">
import type { ClientPageData } from '../types'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { tObject } from '../../../../valaxy/shared'
import { activePath } from '../composables/app'
import { clientPageData, settings } from '../stores/app'
import { openInEditor } from '../utils'

const props = defineProps<{
  post: ClientPageData
}>()

const { locale } = useI18n()

dayjs.extend(relativeTime)

function onClickPost(post: ClientPageData) {
  clientPageData.value = post
}

function openPostInBrowser(post: ClientPageData) {
  const baseUrl = settings.value.siteUrl.replace(/\/$/, '')
  window.open(`${baseUrl}${post.routePath}`, '_blank')
}

const active = computed(() => {
  return clientPageData.value?.routePath === props.post.routePath || activePath.value === props.post.routePath
})

const isCompact = computed(() => settings.value.listDensity === 'compact')

const title = computed(() => tObject(props.post.frontmatter.title || '', locale.value))

const formattedDate = computed(() => dayjs(props.post.frontmatter.date).format('YYYY-MM-DD'))

const relativeTimeStr = computed(() => dayjs(props.post.frontmatter.updated || props.post.frontmatter.date).fromNow())

const categoryLabel = computed(() => {
  const cats = props.post.frontmatter.categories
  if (!cats)
    return ''
  if (typeof cats === 'string')
    return cats
  if (Array.isArray(cats)) {
    if (cats.length > 0 && Array.isArray(cats[0]))
      return (cats[0] as string[]).join(' > ')
    return (cats as string[]).join(' > ')
  }
  return ''
})

const tags = computed(() => {
  const t = props.post.frontmatter.tags
  if (!t || !Array.isArray(t))
    return []
  return t as string[]
})
</script>

<template>
  <li
    class="group border-b border-gray-50 dark:border-gray-800/50 cursor-pointer transition-colors px-3"
    :class="[
      active ? 'bg-indigo-50/50 dark:bg-indigo-900/10 border-l-2 border-l-indigo-500' : 'hover:bg-gray-50 dark:hover:bg-gray-800/50 border-l-2 border-l-transparent',
      isCompact ? 'py-1' : 'py-2',
    ]"
    @click="onClickPost(post)"
  >
    <!-- Line 1: Title + badges + actions -->
    <div class="flex items-center gap-1.5">
      <button
        v-if="post.filePath"
        class="op-40 hover:op-100 transition-opacity text-xs filter-grayscale-100 hover:filter-grayscale-0 flex-shrink-0"
        title="Open in editor"
        @click.stop="openInEditor({ file: post.filePath, line: 2 })"
      >
        <div i-vscode-icons:file-type-vscode />
      </button>
      <span class="flex-1 text-sm font-medium truncate">{{ title }}</span>
      <span
        v-if="post.frontmatter.draft"
        class="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex-shrink-0"
      >DRAFT</span>
      <button
        class="op-40 hover:op-100 transition-opacity text-xs flex-shrink-0"
        title="Open in browser"
        @click.stop="openPostInBrowser(post)"
      >
        <div class="i-ri:external-link-line" />
      </button>
    </div>

    <!-- Line 2: Metadata (hidden in compact mode) -->
    <div v-if="!isCompact" class="flex items-center gap-2 mt-0.5 text-xs op-50">
      <span class="font-mono">{{ formattedDate }}</span>
      <span>·</span>
      <span>{{ relativeTimeStr }}</span>
      <template v-if="categoryLabel">
        <span>·</span>
        <span class="inline-flex items-center gap-0.5">
          <div class="i-ri:folder-2-line text-[10px]" />{{ categoryLabel }}
        </span>
      </template>
      <template v-if="tags.length > 0">
        <span>·</span>
        <span v-for="tag in tags.slice(0, 2)" :key="tag" class="text-[10px]">#{{ tag }}</span>
        <span v-if="tags.length > 2" class="text-[10px]">+{{ tags.length - 2 }}</span>
      </template>
    </div>
  </li>
</template>
