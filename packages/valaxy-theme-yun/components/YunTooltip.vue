<script lang="ts" setup>
import {
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipRoot,
  TooltipTrigger,
} from 'reka-ui'

withDefaults(defineProps<{
  content?: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  sideOffset?: number
}>(), {
  side: 'top',
  sideOffset: 4,
})
</script>

<template>
  <TooltipRoot>
    <TooltipTrigger as-child>
      <slot />
    </TooltipTrigger>
    <TooltipPortal>
      <TooltipContent
        class="yun-tooltip"
        :side="side"
        :side-offset="sideOffset"
      >
        <slot name="content">
          {{ content }}
        </slot>
        <TooltipArrow class="yun-tooltip-arrow" />
      </TooltipContent>
    </TooltipPortal>
  </TooltipRoot>
</template>

<style>
.yun-tooltip {
  max-width: 12.5rem;
  white-space: pre-line;
  word-break: break-word;
  background: var(--va-c-bg);
  color: var(--va-c-text);
  padding: 0.25rem 0.75rem;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  border-radius: 4px;
  z-index: 100;
  user-select: none;
  animation: yun-tooltip-fade-in 0.15s ease-out;
}

.yun-tooltip-arrow {
  fill: var(--va-c-bg);
}

@keyframes yun-tooltip-fade-in {
  from {
    opacity: 0;
    transform: translateY(2px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
