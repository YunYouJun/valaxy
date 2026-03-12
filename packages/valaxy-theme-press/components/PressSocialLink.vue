<script lang="ts" setup>
defineProps<{
  icon: string
  link: string
}>()
</script>

<template>
  <a
    class="pr-social-link"
    :href="link"
    target="_blank"
    rel="noopener"
  >
    <div :class="icon" />
  </a>
</template>

<style scoped>
.pr-social-link {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 36px;
  height: 36px;
  color: var(--pr-c-text-2);
  transition: color var(--va-transition-duration-moderate);
}

.pr-social-link:hover {
  color: var(--pr-c-text-1);
  transition: color var(--va-transition-duration);
}

.pr-social-link > :deep(svg) {
  width: 20px;
  height: 20px;
  fill: currentcolor;
}
</style>
