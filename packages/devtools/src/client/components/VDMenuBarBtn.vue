<script setup lang="ts">
defineProps<{
  tag?: string
}>()
</script>

<template>
  <component :is="tag || 'button'" :type="tag === 'a' ? undefined : 'button'" class="btn-icon-compact shrink-0 color-muted">
    <slot />
  </component>
</template>
