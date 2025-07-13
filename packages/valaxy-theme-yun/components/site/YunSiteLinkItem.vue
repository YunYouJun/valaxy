<script setup lang="ts">
import type { PageProps } from '../../types'
import { useValaxyI18n } from 'valaxy'
import { useYunAppStore } from '../../stores'

defineProps<{
  page: PageProps
}>()

const { $t } = useValaxyI18n()

const yunApp = useYunAppStore()
</script>

<template>
  <AppLink
    class="link-item inline-flex-center gap-2 transition rounded-lg text-xl p-2 md:(text-lg p-2) lg:(text-xl p-3) text-$va-c-text"
    bg="white/5 dark:black/5"
    inline-flex
    :to="page.url"
    :title="$t(page.name)"
    :style="`color:${page.color}`"
    hover="bg-white/80 dark:bg-black/80"
    @click="yunApp.fullscreenMenu.isOpen = false"
  >
    <div :class="page.icon" class="icon" />
    <span>
      {{ $t(page.name) }}
    </span>
  </AppLink>
</template>
