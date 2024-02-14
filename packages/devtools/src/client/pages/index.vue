<script lang="ts" setup>
import { Pane, Splitpanes } from 'splitpanes'
import { onMounted } from 'vue'
import { isStaticMode } from '../utils'

onMounted(() => {
  if (isStaticMode)
    document.title = 'Valaxy DevTools (Production)'
})
</script>

<template>
  <main class="h-full" flex="~ col" text="gray-700 dark:gray-200">
    <div class="w-full border-b shadow flex justify-end" dark="border-b-black">
      <a href="https://valaxy.site" target="_blank" class="bg-gray-100 dark:bg-gray-900 inline-flex justify-center items-center w-8 h-8">
        <div i-ri-book-line />
      </a>
    </div>

    <div style="height: calc(100% - 32px)" overflow="auto">
      <Splitpanes class="h-full">
        <Pane>
          <VDPostList />
        </Pane>
        <Pane>
          <PostPanel />
        </Pane>
      </Splitpanes>
    </div>
  </main>
</template>
