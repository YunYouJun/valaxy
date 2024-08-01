<script lang="ts" setup>
import { onMounted } from 'vue'
import { initDevtoolsClient } from './utils'

onMounted(() => {
  initDevtoolsClient()
})
</script>

<template>
  <main class="h-full" flex="~ col" text="gray-700 dark:gray-200">
    <RouterLink to="/">
      Posts
    </RouterLink>
    <!-- <RouterLink to="/categories">Categories</RouterLink>
    <RouterLink to="/tags">Tags</RouterLink> -->
    <RouterLink to="/migration">
      Migration
    </RouterLink>
    <!-- <RouterLink to="/about">About</RouterLink> -->
    <div class="w-full border-b shadow flex justify-end" dark="border-b-black">
      <a href="https://valaxy.site" target="_blank" class="bg-gray-100 dark:bg-gray-900 inline-flex justify-center items-center w-8 h-8">
        <div i-ri-book-line />
      </a>
    </div>

    <div style="height: calc(100% - 32px)" overflow="auto">
      <RouterView />
    </div>
  </main>
</template>
