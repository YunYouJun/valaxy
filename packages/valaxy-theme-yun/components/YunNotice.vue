<script lang="ts" setup>
defineProps<{
  content: string
}>()
</script>

<template>
  <div class="yun-notice">
    <span v-html="content" />
    <slot />
  </div>
</template>

<style>
.yun-notice {
  border: 1px solid var(--va-c-text);
  width: calc(100% - 2rem);

  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: var(--va-font-serif);
  font-weight: bold;
  padding: 1rem;
  max-width: var(--yun-post-card-max-width);
  background-color: rgba(200, 200, 200, 0.1);
}
</style>
