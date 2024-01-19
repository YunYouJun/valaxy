<script setup lang="ts">
defineProps<{
  icon: string
  link: string
}>()
</script>

<template>
  <p class="leading-0! text-4xl">
    <a class="inline leading-0" :href="link" target="_blank" rel="noopener noreferrer">
      <div :class="icon" />
    </a>
  </p>
</template>
