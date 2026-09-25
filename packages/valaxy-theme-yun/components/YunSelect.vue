<script setup lang="ts">
import {
  SelectContent,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
} from 'reka-ui'
import { computed } from 'vue'

export interface YunSelectOption {
  value: string
  label: string
}

const props = defineProps<{
  options: Array<string | YunSelectOption>
  ariaLabel?: string
  placeholder?: string
  block?: boolean
  compact?: boolean
}>()

const model = defineModel<string>()
const normalizedOptions = computed(() => props.options.map(option => typeof option === 'string'
  ? { value: option, label: option }
  : option))
const selectedLabel = computed(() => normalizedOptions.value.find(option => option.value === model.value)?.label)
</script>

<template>
  <SelectRoot v-model="model">
    <SelectTrigger
      class="yun-select-trigger"
      :class="{ 'is-block': block, 'is-compact': compact }"
      :aria-label="ariaLabel"
    >
      <SelectValue :placeholder="placeholder" class="yun-select-value">
        {{ selectedLabel }}
      </SelectValue>
      <span i-ri-arrow-down-s-line class="yun-select-chevron" aria-hidden="true" />
    </SelectTrigger>

    <SelectPortal to="#valaxy-teleports">
      <SelectContent class="yun-select-content" position="popper" align="start" :side-offset="6">
        <SelectViewport class="yun-select-viewport">
          <SelectItem
            v-for="option in normalizedOptions"
            :key="option.value"
            class="yun-select-item"
            :value="option.value"
          >
            <SelectItemText>{{ option.label }}</SelectItemText>
            <SelectItemIndicator class="yun-select-indicator">
              <span i-ri-check-line aria-hidden="true" />
            </SelectItemIndicator>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>

<style>
.yun-select-trigger {
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 7.5rem;
  min-height: 44px;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--va-c-divider);
  border-radius: 0.5rem;
  color: var(--va-c-text);
  background: var(--va-c-bg-soft);
  font: inherit;
  font-size: 14px;
  cursor: pointer;
}

.yun-select-trigger.is-block {
  width: 100%;
}

.yun-select-trigger.is-compact {
  min-height: 32px;
  padding: 0.25rem 0.5rem;
}

.yun-select-trigger:hover,
.yun-select-trigger[data-state='open'] {
  border-color: var(--va-c-primary);
}

.yun-select-trigger:focus-visible {
  outline: 2px solid var(--yun-focus-color);
  outline-offset: 2px;
}

.yun-select-value {
  overflow: hidden;
  min-width: 0;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.yun-select-chevron {
  flex: none;
  font-size: 18px;
  transition: transform var(--va-transition-duration-fast);
}

.yun-select-trigger[data-state='open'] .yun-select-chevron {
  transform: rotate(180deg);
}

.yun-select-content {
  z-index: var(--yun-z-left-sidebar);
  min-width: var(--reka-select-trigger-width);
  max-width: calc(100vw - 2rem);
  max-height: min(18rem, var(--reka-select-content-available-height));
  overflow: hidden;
  border: 1px solid var(--va-c-divider);
  border-radius: 0.5rem;
  background: var(--va-c-bg);
  box-shadow: 0 4px 12px rgb(0 0 0 / 0.08);
}

.yun-select-viewport {
  padding: 0.25rem;
}

.yun-select-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  min-height: 44px;
  padding: 0.5rem 0.625rem;
  border-radius: 0.25rem;
  color: var(--va-c-text);
  cursor: pointer;
  font-size: 14px;
  outline: none;
}

.yun-select-item[data-highlighted] {
  color: var(--va-c-primary);
  background: var(--va-c-bg-soft);
}

.yun-select-item[data-state='checked'] {
  font-weight: 600;
}

.yun-select-indicator {
  display: inline-flex;
  color: var(--va-c-primary);
}

@media (prefers-reduced-motion: reduce) {
  .yun-select-chevron {
    transition: none;
  }
}
</style>
