<script setup lang="ts">
import { useYunAppStore } from '../../stores'
import type { PageProps } from '../../types'

defineProps<{
  page: PageProps
}>()

const yunApp = useYunAppStore()
</script>

<template>
  <AppLink
    class="link-item w-full h-12 items-center justify-center gap-2 transition rounded"
    inline-flex
    :to="page.url" :title="page.name"
    :style="`color:${page.color}`"
    hover="bg-gray-100/50 dark:bg-gray-800/50"
    @click="yunApp.fullscreenMenu.isOpen = false"
  >
    <div :class="page.icon" class="icon size-6" />
    <span class="text-lg">
      {{ page.name }}
    </span>
  </AppLink>
</template>
