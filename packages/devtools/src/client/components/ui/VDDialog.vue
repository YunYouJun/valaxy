<script setup lang="ts">
import OverlayModal from '@antfu/design/components/Overlay/OverlayModal.vue'

defineProps<{
  title?: string
  description?: string
}>()

const open = defineModel<boolean>('open', { default: false })
</script>

<template>
  <OverlayModal v-model:open="open" :title="title" :description="description">
    <slot />
    <template v-if="$slots.footer" #footer>
      <slot name="footer" />
    </template>
  </OverlayModal>
</template>
