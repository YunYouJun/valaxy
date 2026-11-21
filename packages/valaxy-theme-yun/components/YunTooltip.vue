<script lang="ts" setup>
import {
  injectTooltipProviderContext,
  TooltipArrow,
  TooltipContent,
  TooltipPortal,
  TooltipProvider,
  TooltipRoot,
  TooltipTrigger,
} from 'reka-ui'

withDefaults(defineProps<{
  content?: string
  side?: 'top' | 'bottom' | 'left' | 'right'
  sideOffset?: number
  delayDuration?: number
}>(), {
  side: 'top',
  sideOffset: 6,
  delayDuration: 200,
})

const hasProvider = Boolean(injectTooltipProviderContext(null))
</script>

<template>
  <TooltipProvider v-if="!hasProvider" :delay-duration="delayDuration">
    <TooltipRoot>
      <TooltipTrigger as-child>
        <slot />
      </TooltipTrigger>
      <TooltipPortal to="#valaxy-teleports">
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
  </TooltipProvider>
  <TooltipRoot v-else>
    <TooltipTrigger as-child>
      <slot />
    </TooltipTrigger>
    <TooltipPortal to="#valaxy-teleports">
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
  overflow-wrap: anywhere;
  background: var(--yun-bg-elevated, var(--va-c-bg-light));
  color: var(--va-c-text);
  border: 1px solid var(--yun-surface-line);
  font-size: 0.75rem;
  line-height: 1.4;
  padding: 0.25rem 0.65rem;
  box-shadow: 0 4px 12px -2px rgb(0 0 0 / 0.14);
  border-radius: 0.375rem;
  z-index: 100;
  user-select: none;
  animation: yun-tooltip-fade-in 0.15s ease-out;
}

.yun-tooltip-arrow {
  fill: var(--yun-bg-elevated, var(--va-c-bg-light));
}

@media (prefers-reduced-motion: reduce) {
  .yun-tooltip {
    animation: none;
  }
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
