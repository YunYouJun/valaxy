<script lang="ts" setup>
defineProps<{
  content: string
}>()
</script>

<template>
  <div class="w-full px-4 flex-center">
    <div class="yun-notice w-full">
      <span v-html="content" />
      <slot />
    </div>
  </div>
</template>

<style>
.yun-notice {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  max-width: var(--yun-post-card-max-width);
  padding: 0.875rem 1.25rem;
  border: 1px solid var(--yun-surface-line);
  border-radius: var(--va-card-border-radius, 0.5rem);
  color: var(--va-c-text);
  background-color: var(--va-c-bg-light);
  box-shadow: 0 2px 10px -4px rgb(20 35 60 / 0.06);
  font-family: var(--va-font-serif);
  font-size: 0.9375rem;
  font-weight: 600;
  line-height: 1.6;
  text-align: center;
}

html.dark .yun-notice {
  box-shadow: 0 4px 14px -4px rgb(0 0 0 / 0.35);
}
</style>
