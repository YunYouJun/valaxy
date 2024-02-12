<script lang="ts" setup>
import { Pane, Splitpanes } from 'splitpanes'
import { onMounted } from 'vue'
import { getWindowProperty, isStaticMode } from '../utils'

import type { BlogWindow } from '../types'
import { frontmatter } from '../composables/app'

onMounted(() => {
  if (isStaticMode)
    document.title = 'Valaxy DevTools (Production)'

  const $frontmatter = getWindowProperty('$frontmatter') as BlogWindow['$frontmatter']
  if ($frontmatter)
    frontmatter.value = $frontmatter
})
</script>

<template>
  <main class="h-full" flex="~ col" text="gray-700 dark:gray-200">
    <div class="w-full border-b shadow flex justify-end">
      <a href="https://valaxy.site" target="_blank" class="bg-gray-100 inline-flex justify-center items-center w-8 h-8">
        <div i-ri-book-line />
      </a>
    </div>

    <div style="height: calc(100% - 32px)" overflow="auto">
      <Splitpanes class="h-full">
        <Pane>
          <VDPostList />
        </Pane>
        <Pane>
          <PageFrontmatter :frontmatter="frontmatter" />
        </Pane>
      </Splitpanes>
    </div>
  </main>
</template>
