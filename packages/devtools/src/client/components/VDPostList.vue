<script lang="ts" setup>
// 是否已经滚到列表末尾
import { useScroll } from '@vueuse/core'

import { ref } from 'vue'

import { postList } from '../stores/app'
import VDBottomGradient from './VDBottomGradient.vue'

const postListElRef = ref()
const { arrivedState } = useScroll(postListElRef)
</script>

<template>
  <ul
    ref="postListElRef" class="h-full relative" overflow="auto"
    flex="~ col gap-0.5"
    pl="12" pr="4" py="4"
  >
    <VDPostListItem
      v-for="post in postList.posts" :key="post.routePath"
      :post="post"
      class="list-decimal text-sm"
    />

    <Transition>
      <VDBottomGradient v-if="!arrivedState.bottom" class="fixed" />
    </Transition>
  </ul>
</template>
