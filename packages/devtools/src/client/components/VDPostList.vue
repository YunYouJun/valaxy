<script lang="ts" setup>
import type { ClientPageData } from '../types'
// 是否已经滚到列表末尾
import { useScroll } from '@vueuse/core'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'

import { ref } from 'vue'

import { clientPageData, postList } from '../stores/app'
import { openInEditor } from '../utils'
import VDBottomGradient from './VDBottomGradient.vue'

dayjs.extend(relativeTime)

function onClickPost(post: ClientPageData) {
  // devtoolsRouter.value?.push(post.path)
  clientPageData.value = post
}

const postListElRef = ref()
const { arrivedState } = useScroll(postListElRef)
</script>

<template>
  <ul
    ref="postListElRef" class="h-full relative" overflow="auto"
    flex="~ col gap-0.5"
    pl="12" pr="4" py="4"
  >
    <li v-for="post in postList.posts" :key="post.routePath" class="list-decimal text-sm">
      <div
        flex="~ gap-1"
        class="items-center justify-center hover:text-blue-500"
        :class="{ 'text-blue-500': clientPageData?.routePath === post.routePath }"
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
          class="inline-flex flex-grow cursor-pointer"
          @click="onClickPost(post)"
        >
          {{ post.frontmatter.title }}
        </span>

        <div class="text-xs">
          <span class="op-80">
            {{ dayjs(post.frontmatter.updated).fromNow() }}
          </span>
          <span class="mx-1">|</span>
          <span class="font-mono op-55">
            {{ dayjs(post.frontmatter.date).format('YYYY-MM-DD HH:MM') }}
          </span>
        </div>
      </div>
    </li>

    <Transition>
      <VDBottomGradient v-if="!arrivedState.bottom" class="fixed" />
    </Transition>
  </ul>
</template>
