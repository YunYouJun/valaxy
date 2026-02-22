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
      flex="~ grow"
      class="w-full m-auto justify-center items-start gap-4"
      :class="noMargin ? '' : classes"
    >
      <slot />
    </div>
    <YunFooter v-if="footer" />
  </div>
</template>
