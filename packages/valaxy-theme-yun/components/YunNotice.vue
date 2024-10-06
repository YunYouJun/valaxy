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
  border: 1px solid var(--va-c-text);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  font-family: var(--va-font-serif);
  font-weight: bold;
  padding: 1rem;
  max-width: var(--yun-post-card-max-width);
  background-color: rgb(200 200 200 / 0.1);
}
</style>
