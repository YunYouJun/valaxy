<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { getGlobalValaxyProperty } from '../utils'
import { activePath, devtoolsRouter } from '../composables/app'

const postList = ref()

onMounted(() => {
  postList.value = getGlobalValaxyProperty('postList').value
})

function onClickPost(post: any) {
  devtoolsRouter.value?.push(post.path)
}
</script>

<template>
  <ul class="h-full" overflow="auto" pl="12" pr="4" py="4">
    <li v-for="post in postList" :key="post.path" class="list-decimal">
      <div flex>
        <span
          class="inline-flex flex-grow cursor-pointer hover:text-blue-500"
          :class="{ 'text-blue-500 font-bold': activePath === post.path }"
          @click="onClickPost(post)"
        >
          {{ post.title }}
        </span>
      </div>
    </li>
  </ul>
</template>
