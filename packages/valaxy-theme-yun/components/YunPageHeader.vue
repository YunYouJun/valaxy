<script lang="ts" setup>
import { useConfig } from 'valaxy'

defineProps<{
  color?: string
  icon?: string
  title?: string
  cover?: string
}>()

const config = useConfig()
</script>

<template>
  <header class="post-header">
    <img
      v-if="config.cover.enable && cover"
      :src="cover"
      max-h="42vh"
      min-h="260px"
      class="select-none object-contain"
    >
    <h1 class="post-title" p="2" text="2xl center" font="serif black" :style="`color:${color}`">
      <div v-if="icon" class="icon" m="r-1" inline-flex :class="icon" />
      <span>{{ title }}</span>
    </h1>
  </header>
</template>
