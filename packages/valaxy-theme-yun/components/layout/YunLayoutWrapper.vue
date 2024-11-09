<script setup lang="ts">
import { computed } from 'vue'
import { useYunAppStore } from '../../stores'

// common layout

const yun = useYunAppStore()
const classes = computed(() => {
  if (yun.isNimbo)
    return 'mt-24 md:mt-36'
  return 'mt-12'
})
</script>

<template>
  <div
    flex="~"
    class="w-full m-auto justify-center items-start gap-4"
    :class="classes"
  >
    <slot />
  </div>
</template>
