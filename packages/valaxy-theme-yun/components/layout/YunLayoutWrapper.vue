<script setup lang="ts">
import { computed } from 'vue'
import { useYunAppStore } from '../../stores'

// common layout

withDefaults(defineProps<{
  footer?: boolean
  noMargin?: boolean
}>(), {
  footer: true,
  noMargin: false,
})

const yun = useYunAppStore()
const classes = computed(() => {
  if (yun.isNimbo)
    return 'mt-12 md:mt-24'
  return 'mt-12'
})
</script>

<template>
  <div class="min-h-screen flex flex-col">
    <div
      class="yun-layout-wrapper__content"
      :class="noMargin ? '' : classes"
    >
      <slot />
    </div>
    <YunFooter v-if="footer" />
  </div>
</template>

<style>
.yun-layout-wrapper__content {
  display: flex;
  flex-grow: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  width: 100%;
  margin: 0 auto;
}

/* Switch to horizontal three-column layout on large screens */
@media (width >= 1024px) {
  .yun-layout-wrapper__content {
    flex-direction: row;
    align-items: start;
  }
}
</style>
