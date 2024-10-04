<script lang="ts" setup>
defineProps<{
  icon: string
  title: string
  /**
   * Total number
   */
  total: number
  to: string
}>()
</script>

<template>
  <RouterLink
    flex="~ col center"
    class="gap-1 w-20 p-2 rounded transition op-80"
    :to="to" :title="title"
    hover="bg-$va-c-bg-soft op-100"
  >
    <div flex="~ col" class="text-$va-c-text inline-flex-center gap-1">
      <div class="text-2xl" :class="icon" />
      <span class="text-xs">
        {{ title }}
      </span>
    </div>
    <span
      class="count text-base dark:text-white/80"
    >{{ total }}</span>
  </RouterLink>
</template>
