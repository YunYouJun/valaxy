<script setup lang="ts">
import { ref } from 'vue'

defineProps<{
  severity?: 'success' | 'error' | 'warn' | 'info'
  closable?: boolean
}>()

const visible = ref(true)
</script>

<template>
  <div
    v-if="visible"
    class="vd-message flex items-center gap-2 px-3 py-2 rounded-lg text-sm"
    :class="[
      severity === 'success'
        ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400 border border-green-200 dark:border-green-800'
        : severity === 'error'
          ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400 border border-red-200 dark:border-red-800'
          : severity === 'warn'
            ? 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
            : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800',
    ]"
  >
    <div
      :class="[
        severity === 'success'
          ? 'i-ri:check-line'
          : severity === 'error'
            ? 'i-ri:error-warning-line'
            : severity === 'warn'
              ? 'i-ri:alert-line'
              : 'i-ri:information-line',
      ]"
      class="text-base flex-shrink-0"
    />
    <div class="flex-1">
      <slot />
    </div>
    <button
      v-if="closable"
      class="i-ri:close-line op-50 hover:op-100 cursor-pointer transition-opacity"
      @click="visible = false"
    />
  </div>
</template>
