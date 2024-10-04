<script lang="ts" setup>
defineProps<{
  pageTitleClass?: string
  /**
   * @deprecated Use `pageTitleClass` instead
   */
  color?: string
  icon?: string
  title?: string
}>()
</script>

<template>
  <header class="post-header">
    <h1
      class="post-title flex-center" p="2" text="2xl center"
      font="serif black"
      :style="`color:${color}`"
      :class="pageTitleClass"
    >
      <div v-if="icon" class="icon" m="r-1 t-1px" inline-flex :class="icon" />
      <span inline-flex class="leading-none">{{ title }}</span>
    </h1>
  </header>
</template>
