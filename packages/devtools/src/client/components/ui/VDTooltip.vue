<script setup lang="ts">
import {
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from 'reka-ui'

defineProps<{
  content: string
  side?: 'top' | 'right' | 'bottom' | 'left'
}>()
</script>

<template>
  <TooltipProvider :delay-duration="0">
    <TooltipRoot>
      <TooltipTrigger as-child>
        <slot />
      </TooltipTrigger>
      <TooltipPortal>
        <TooltipContent
          :side="side || 'bottom'"
          :side-offset="4"
          class="z-tooltip bg-tooltip color-base border border-base text-xs px-2 py-1 rounded shadow-lg select-none"
        >
          {{ content }}
        </TooltipContent>
      </TooltipPortal>
    </TooltipRoot>
  </TooltipProvider>
</template>
