<script setup lang="ts">
defineProps<{
  label: string
  value?: string
}>()
</script>

<template>
  <li
    class="flex gap-2 text-sm min-h-8"
  >
    <div class="w-32 flex items-center h-8">
      <strong>{{ label }}</strong>
    </div>
    <div class="inline-flex items-center w-full min-h-8">
      <slot>
        <code class="px-2 py-1 bg-gray-1 rounded text-xs dark:bg-dark">
          {{ value }}
        </code>
      </slot>
    </div>
  </li>
</template>
