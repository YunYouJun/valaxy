<script lang="ts" setup>
defineProps<{
  color?: string
  icon?: string
  title?: string
}>()
</script>

<template>
  <header class="post-header">
    <h1 class="post-title" p="2" m="t-2" text="2xl center" font="serif black" :style="`color:${color}`">
      <div v-if="icon" class="icon" inline-flex :class="icon" />
      <span m="l-1">{{ title }}</span>
    </h1>
  </header>
</template>
