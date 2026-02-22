<script lang="ts" setup>
defineProps<{
  ariaLabel?: string
  ariaKeyshortcuts?: string
}>()
</script>

<template>
  <button type="button" class="PressNavBarAskAiButton" :aria-label="ariaLabel || 'Ask AI'" :aria-keyshortcuts="ariaKeyshortcuts">
    <span i-ri-sparkle-line aria-hidden="true" />
  </button>
</template>

<style>
/* stylelint-disable selector-class-pattern */
.PressNavBarAskAiButton {
  display: flex;
  align-items: center;
  height: var(--pr-nav-height);
  padding: 8px 14px;
  font-size: 20px;
  color: var(--va-c-text-2);
  cursor: pointer;
  background: transparent;
  border: none;
}

@media (width >= 768px) {
  .PressNavBarAskAiButton {
    height: auto;
    padding: 11.5px;
    transition: color 0.3s ease;
    background-color: var(--va-c-bg-alt);
    border-radius: 8px;
    font-size: 15px;
  }

  .PressNavBarAskAiButton:hover {
    color: var(--va-c-primary);
  }
}
</style>
