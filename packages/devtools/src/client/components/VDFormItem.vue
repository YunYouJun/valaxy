<script setup lang="ts">
defineProps<{
  label: string
  value?: string
}>()
</script>

<template>
  <div
    class="flex flex-col sm:flex-row gap-1 sm:gap-2 text-sm min-h-8"
  >
    <div class="sm:w-28 sm:shrink-0 flex items-center min-h-6 color-muted">
      <span>{{ label }}</span>
    </div>
    <div class="inline-flex items-center min-w-0 min-h-8">
      <slot>
        <code class="px-2 py-1 bg-secondary rounded text-xs break-all">
          {{ value }}
        </code>
      </slot>
    </div>
  </div>
</template>
