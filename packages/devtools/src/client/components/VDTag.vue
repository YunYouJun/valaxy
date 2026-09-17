<script lang="ts" setup>
import { identityColor } from '../utils/colors'

defineProps<{
  value: string
  removable?: boolean
}>()

defineEmits<{
  remove: []
}>()
</script>

<template>
  <div
    class="vd-tag badge vd-accent vd-tint cursor-pointer transition hover:opacity-80"
    :style="identityColor(value)"
    p="x-2 y-1"
  >
    <div class="i-ri:hashtag text-2.5 op-70" />
    <slot />
    <button
      v-if="removable"
      class="inline-flex items-center justify-center w-3.5 h-3.5 ml-0.5 rounded-full hover:bg-hover transition-colors cursor-pointer"
      @click.stop="$emit('remove')"
    >
      <div class="i-ri:close-line text-2.5" />
    </button>
  </div>
</template>
