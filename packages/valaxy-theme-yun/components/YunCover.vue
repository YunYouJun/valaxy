<script setup lang="ts">
withDefaults(defineProps<{
  src?: string
  component?: string
  componentProps?: Record<string, unknown>
  alt?: string
  context?: 'card' | 'page'
}>(), { context: 'page' })
</script>

<template>
  <ValaxyCover
    class="yun-cover" :class="context === 'page' && 'h-64 md:h-sm'"
    :src="src" :component="component" :component-props="componentProps" :alt="alt" :context="context"
  />
</template>
