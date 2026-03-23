<script lang="ts" setup>
defineProps<{
  removable?: boolean
}>()

defineEmits<{
  remove: []
}>()
</script>

<template>
  <div
    class="vd-tag inline-flex items-center gap-0.5 rounded-full text-xs cursor-pointer transition bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/40"
    p="x-2 y-1"
  >
    <div class="i-ri:hashtag text-2.5 op-70" />
    <slot />
    <button
      v-if="removable"
      class="inline-flex items-center justify-center w-3.5 h-3.5 ml-0.5 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors cursor-pointer"
      @click.stop="$emit('remove')"
    >
      <div class="i-ri:close-line text-2.5" />
    </button>
  </div>
</template>
