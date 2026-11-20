<script lang="ts" setup>
import type { Post } from 'valaxy'
import { useValaxyI18n } from 'valaxy'

defineProps<{
  tags: Post['tags']
}>()

const { $tTag } = useValaxyI18n()
</script>

<template>
  <div
    class="yun-post-badge post-tags inline-flex" items="center" gap="1"
    flex="wrap 1" justify="end"
  >
    <RouterLink
      v-for="tag, i in tags" :key="i" :to="{ path: '/tags/', query: { tag } }"
      class="yun-post-badge post-tag inline-flex-center text-xs"
      px-2 h="7"
      rounded-full
      border
    >
      <span>{{ $tTag(tag) }}</span>
    </RouterLink>
  </div>
</template>
