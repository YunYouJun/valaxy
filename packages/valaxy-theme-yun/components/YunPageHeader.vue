<script lang="ts" setup>
const props = withDefaults(defineProps<{
  pageTitleClass?: string
  /**
   * @deprecated Use `pageTitleClass` instead
   */
  color?: string
  icon?: string
  title?: string
  titleId?: string
  /** Filtered tag and category cards use 2 so the page keeps a single h1. */
  level?: 1 | 2
}>(), {
  level: 1,
})
</script>

<template>
  <header class="post-header">
    <component
      :is="props.level === 2 ? 'h2' : 'h1'"
      :id="titleId"
      class="post-title flex-center" p="2" text="center"
      font="serif semibold"
      :style="`color:${color}`"
      :class="pageTitleClass"
    >
      <div v-if="icon" class="icon" m="r-1 t-1px" inline-flex :class="icon" />
      <span inline-flex class="leading-none">{{ title }}</span>
    </component>
  </header>
</template>
