<script lang="ts" setup>
import type { Post } from 'valaxy'
import { useValaxyI18n } from 'valaxy'

defineProps<{
  tags: Post['tags']
}>()

const { $t } = useValaxyI18n()
</script>

<template>
  <div
    class="post-tags inline-flex" items="center" gap="1"
    flex="wrap 1" justify="end"
  >
    <RouterLink
      v-for="tag, i in tags" :key="i" :to="{ path: '/tags/', query: { tag } }"
      class="transition post-tag inline-flex-center text-xs border-$va-c-divider"
      px-2 h="7"
      rounded-full
      border
      hover="bg-blue-500 text-white"
    >
      <span>{{ $t(tag) }}</span>
    </RouterLink>
  </div>
</template>
