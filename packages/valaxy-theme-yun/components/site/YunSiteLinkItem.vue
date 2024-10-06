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
    class="link-item inline-flex-center gap-2 transition rounded text-base p-1 md:(text-xl p-3) text-$va-c-text"
    inline-flex
    :to="page.url" :title="page.name"
    :style="`color:${page.color}`"
    hover="bg-white/80 dark:bg-black/80"
    @click="yunApp.fullscreenMenu.isOpen = false"
  >
    <div :class="page.icon" class="icon" />
    <span>
      {{ page.name }}
    </span>
  </AppLink>
</template>
