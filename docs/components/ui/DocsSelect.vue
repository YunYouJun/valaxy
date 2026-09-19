<script setup lang="ts" generic="T extends string">
import { Label, SelectContent, SelectIcon, SelectItem, SelectItemIndicator, SelectItemText, SelectPortal, SelectRoot, SelectTrigger, SelectValue, SelectViewport } from 'reka-ui'
import { useId } from 'vue'

const props = defineProps<{
  label: string
  options: { value: T, label: string }[]
}>()
const model = defineModel<T>({ required: true })
const id = useId()

function select(value: unknown) {
  const option = props.options.find(option => option.value === value)
  if (option)
    model.value = option.value
}
</script>

<template>
  <div class="docs-select">
    <Label :for="id" class="docs-select-label">{{ label }}</Label>
    <SelectRoot :model-value="model" @update:model-value="select">
      <SelectTrigger :id="id" class="docs-select-trigger" :aria-label="label">
        <SelectValue>{{ options.find(option => option.value === model)?.label }}</SelectValue>
        <SelectIcon class="docs-select-icon" aria-hidden="true">
          <span i-ri-expand-up-down-line />
        </SelectIcon>
      </SelectTrigger>
      <SelectPortal>
        <SelectContent class="docs-select-content" position="popper" :side-offset="6" :collision-padding="16">
          <SelectViewport class="docs-select-viewport">
            <SelectItem v-for="option in options" :key="option.value" class="docs-select-item" :value="option.value" :text-value="option.label">
              <SelectItemText>{{ option.label }}</SelectItemText>
              <SelectItemIndicator class="docs-select-check">
                <span i-ri-check-line aria-hidden="true" />
              </SelectItemIndicator>
            </SelectItem>
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>
  </div>
</template>

<style scoped>
.docs-select {
  display: grid;
  align-content: start;
  gap: 8px;
  min-width: 0;
}

.docs-select-label {
  color: var(--pr-c-text-1);
  font-size: 13px;
  font-weight: 600;
}

.docs-select-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  width: 100%;
  min-height: 46px;
  border: 1px solid var(--pr-c-divider-light);
  border-radius: 8px;
  padding: 10px 13px;
  background: var(--pr-c-bg);
  color: var(--pr-c-text-1);
  font: inherit;
  font-size: 14px;
  text-align: left;
  cursor: pointer;
  transition: border-color 160ms, box-shadow 160ms;
}

.docs-select-trigger:hover, .docs-select-trigger[data-state="open"] {
  border-color: var(--pr-c-brand, var(--va-c-primary));
}

.docs-select-trigger:focus-visible {
  outline: 2px solid var(--pr-c-brand, var(--va-c-primary));
  outline-offset: 3px;
}

.docs-select-icon, .docs-select-check {
  display: inline-flex;
  flex: none;
  color: var(--pr-c-brand, var(--va-c-primary));
}

.docs-select-content {
  z-index: 50;
  width: var(--reka-select-trigger-width);
  max-width: calc(100vw - 32px);
  max-height: var(--reka-select-content-available-height);
  overflow: auto;
  border: 1px solid var(--pr-c-divider-light);
  border-radius: 10px;
  background: var(--pr-c-bg);
  color: var(--pr-c-text-1);
  box-shadow: 0 12px 32px rgb(20 28 60 / 0.14);
  font-family: var(--pr-font-body, var(--va-font-sans));
}

.docs-select-viewport {
  padding: 5px;
}

.docs-select-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 42px;
  padding: 9px 10px;
  border-radius: 6px;
  font-size: 14px;
  line-height: 1.5;
  cursor: pointer;
  outline: none;
}

.docs-select-item[data-highlighted] {
  background: var(--pr-c-brand-soft, color-mix(in srgb, var(--va-c-primary) 8%, transparent));
  color: var(--pr-c-brand, var(--va-c-primary));
}

.docs-select-item[data-state="checked"] {
  font-weight: 600;
}

@media (prefers-reduced-motion: reduce) {
  .docs-select-trigger { transition: none; }
}
</style>
