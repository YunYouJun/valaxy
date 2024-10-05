<script setup lang="ts">
defineProps<{
  active?: boolean
}>()
</script>

<template>
  <button
    class="bg-white-90 m-2 inline-flex items-center justify-center rounded px-2 gap-2 h-8"
    :class="{
      'bg-blue-500 text-white': active,
      'hover:bg-$va-c-bg-soft': !active,
    }"
  >
    <slot />
  </button>
</template>
