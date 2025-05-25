<script setup lang="ts">
import type { ClientPageData } from '../types'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { computed } from 'vue'
import { activePath, devtoolsRouter } from '../composables/app'
import { clientPageData } from '../stores/app'
import { openInEditor } from '../utils'

const props = defineProps<{
  post: ClientPageData
}>()

dayjs.extend(relativeTime)

function onClickPost(post: ClientPageData) {
  devtoolsRouter.value?.push(post.routePath)
  clientPageData.value = post
}

const active = computed(() => {
  return clientPageData.value?.routePath === props.post.routePath || activePath.value === props.post.routePath
})
</script>

<template>
  <li class="list-decimal text-sm">
    <div
      flex="~ gap-1"
      class="items-center justify-center hover:op-100 op-80"
      :class="{ 'text-blue-600 dark:text-blue-400': active }"
    >
      <button
        v-if="post.filePath"
        class="text-xs  transition filter-grayscale-100 hover:filter-grayscale-0" @click="openInEditor({
          file: post.filePath,
          line: 2,
        })"
      >
        <div i-vscode-icons:file-type-vscode />
      </button>

      <span
        class="inline-flex flex-grow cursor-pointer truncate"
        @click="onClickPost(post)"
      >
        {{ post.frontmatter.title }}
      </span>

      <div class="text-xs">
        <span class="op-80">
          {{ dayjs(post.frontmatter.updated).fromNow() }}
        </span>
        <span class="mx-1">|</span>
        <span class="font-mono op-60">
          {{ dayjs(post.frontmatter.date).format('YYYY-MM-DD HH:MM') }}
        </span>
      </div>
    </div>
  </li>
</template>
