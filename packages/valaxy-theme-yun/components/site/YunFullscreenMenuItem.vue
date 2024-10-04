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
    class="link-item w-full items-center justify-center md:justify-start gap-2 transition rounded text-2xl p-4 sm:(text-3xl p-6) lg:(text-4xl p-7)"
    inline-flex
    :to="page.url" :title="page.name"
    :style="`color:${page.color}`"
    hover="bg-gray-100/50 dark:bg-gray-800/50"
    @click="yunApp.fullscreenMenu.isOpen = false"
  >
    <div :class="page.icon" class="icon" />
    <span>
      {{ page.name }}
    </span>
  </AppLink>
</template>
