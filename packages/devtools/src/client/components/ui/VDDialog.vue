<script setup lang="ts">
import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogOverlay,
  DialogPortal,
  DialogRoot,
  DialogTitle,
} from 'reka-ui'

defineProps<{
  title?: string
  description?: string
}>()

const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <DialogRoot v-model:open="open">
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-black/50 animate-overlay-show" />
      <DialogContent
        class="fixed z-50 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-xl p-5 w-full max-w-md animate-content-show"
      >
        <DialogTitle v-if="title" class="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">
          {{ title }}
        </DialogTitle>
        <DialogDescription v-if="description" class="text-sm text-gray-500 dark:text-gray-400 mb-4">
          {{ description }}
        </DialogDescription>
        <slot />
        <DialogClose
          class="absolute top-3 right-3 inline-flex items-center justify-center w-6 h-6 rounded hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
        >
          <div class="i-ri:close-line text-sm op-50" />
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>

<style scoped>
.animate-overlay-show {
  animation: overlayShow 150ms ease-out;
}
.animate-content-show {
  animation: contentShow 150ms ease-out;
}
@keyframes overlayShow {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes contentShow {
  from { opacity: 0; transform: translate(-50%, -48%) scale(0.96); }
  to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
}
</style>
