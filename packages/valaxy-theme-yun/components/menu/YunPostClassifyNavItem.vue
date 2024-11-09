<script lang="ts" setup>
import { computed } from 'vue'

import { useRoute } from 'vue-router'

const props = defineProps<{
  activeIcon?: string
  icon: string
  title: string
  /**
   * Total number
   */
  total: number
  to: string
}>()

const route = useRoute()
const active = computed(() => route.path === props.to)

const icon = computed(() => {
  if (active.value && props.activeIcon)
    return props.activeIcon
  return props.icon
})
</script>

<template>
  <RouterLink
    flex="~ col center"
    class="post-classify-nav-item gap-1 w-20 p-2 rounded transition op-80"
    :to="to"
    :title="title"
    hover="bg-$va-c-bg-soft op-100"
  >
    <div flex="~ col" class="text-$va-c-text inline-flex-center gap-1">
      <div
        class="text-2xl"
        :class="icon"
      />
      <span class="text-xs">
        {{ title }}
      </span>
    </div>
    <span
      class="count text-base text-black/80 dark:text-white/80"
    >
      {{ total }}
    </span>
  </RouterLink>
</template>

<style lang="scss">
.post-classify-nav-item {
  &.router-link-active {
    background-color: rgba(var(--va-c-primary-rgb), 0.08);
  }
}
</style>
