<script setup lang="ts">
defineProps<{ page: string }>()
</script>

<template>
  <PostList :cur-page="parseInt(page)" />
</template>

<route lang="yaml">
meta:
  layout: home
</route>
