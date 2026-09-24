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
    class="yun-site-link-item link-item inline-flex-center gap-2 transition rounded-lg text-xl p-2 md:(text-lg p-2) lg:(text-xl p-3) text-$va-c-text"
    bg="white/5 dark:black/5"
    inline-flex
    :to="page.url"
    :title="$t(page.name)"
    :style="{ 'color': page.color, '--yun-site-link-accent': page.iconColor || page.color || 'var(--va-c-primary)' }"
    hover="bg-white/80 dark:bg-black/80"
    @click="yunApp.fullscreenMenu.isOpen = false"
  >
    <span class="yun-site-link-icon inline-flex-center shrink-0" aria-hidden="true">
      <span :class="page.icon" class="icon" :style="{ color: page.iconColor }" />
    </span>
    <span class="yun-site-link-label">
      {{ $t(page.name) }}
    </span>
  </AppLink>
</template>
