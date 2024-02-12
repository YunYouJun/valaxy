<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import type { Router } from 'vue-router/auto'
import { getGlobalValaxyProperty, getWindowProperty, openInEditor } from '../utils'
import { frontmatter } from '../composables/app'

const activePath = ref('')

const __VUE_DEVTOOLS_ROUTER__ = getWindowProperty('__VUE_DEVTOOLS_ROUTER__') as Router
__VUE_DEVTOOLS_ROUTER__.beforeEach((to, _from, next) => {
  activePath.value = to.path
  frontmatter.value = getWindowProperty('$frontmatter')
  next()
})

const postList = ref()

onMounted(() => {
  postList.value = getGlobalValaxyProperty('postList').value
})

function onClickPost(post: any) {
  __VUE_DEVTOOLS_ROUTER__.push(post.path)
}

function launchEditor() {
  openInEditor({
    file: getWindowProperty('$pageData').path,
  })
}
</script>

<template>
  <ul class="h-full" overflow="auto" pl="12" pr="4" py="4">
    {{ activePath }}
    <li v-for="post in postList" :key="post.path" class="list-decimal">
      <div flex>
        <span
          class="inline-flex flex-grow cursor-pointer underline hover:text-blue-500"
          :class="{ 'text-blue-500': activePath === post.path }"
          @click="onClickPost(post)"
        >
          {{ post.title }}
        </span>
        <button class="ml-2 text-xs" @click="launchEditor()">
          <div i-vscode-icons:file-type-vscode />
        </button>
      </div>
    </li>
  </ul>
</template>
