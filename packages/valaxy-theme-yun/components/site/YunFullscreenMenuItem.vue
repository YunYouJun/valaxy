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
    class="inline-flex link-item items-center justify-center md:justify-start gap-2 transition rounded text-xl p-3 sm:(text-3xl p-6) lg:(text-4xl p-7 w-full)"
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
