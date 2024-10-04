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
    class="gap-1 w-20"
    :to="to" :title="title"
  >
    <div flex="~ col" class="text-$va-c-text inline-flex-center gap-1">
      <div class="text-xl" :class="icon" />
      <span class="text-sm">
        {{ title }}
      </span>
    </div>
    <span
      class="count text-base"
    >{{ total }}</span>
  </RouterLink>
</template>
