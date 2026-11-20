<script lang="ts" setup>
import type { Post } from 'valaxy'
import { useValaxyI18n } from 'valaxy'
import { computed } from 'vue'

const props = defineProps<{
  categories?: Post['categories']
}>()

const { $tCategory } = useValaxyI18n()
const categoryPath = computed(() => Array.isArray(props.categories) ? props.categories.join('/') : props.categories)
</script>

<template>
  <RouterLink
    v-if="categoryPath?.trim()"
    :to="{
      path: '/categories',
      query: { category: categoryPath },
    }"
    class="yun-post-badge post-category inline-flex-center text-xs"
    px-2 h="7"
    border rounded-full
  >
    <div m="x-1" inline-flex i-ri-folder-2-line />
    <span>
      {{ Array.isArray(categories) ? categories.map($tCategory).join(' / ') : $tCategory(categories || '') }}
    </span>
  </RouterLink>
</template>
