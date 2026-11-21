<script setup lang="ts">
defineProps<{
  item: {
    url: string
    icon: string
    color: string
    label?: string
  }
}>()
</script>

<template>
  <a
    class="yun-project-link-item yun-action-btn"
    :href="item.url"
    target="_blank"
    rel="noopener noreferrer"
    :title="item.label"
    :aria-label="item.label"
    :style="{
      '--yun-project-link-color': item.color,
    }"
  >
    <span :class="item.icon" aria-hidden="true" />
  </a>
</template>

<style lang="scss" scoped>
.yun-project-link-item.yun-action-btn {
  --yun-action-btn-size: 2rem;
  --yun-action-btn-icon-size: 1.05rem;
  --yun-action-btn-radius: 0.5rem;

  @media (pointer: coarse) {
    --yun-action-btn-size: 2.5rem;
  }

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: var(--yun-project-link-color);
      background-color: color-mix(in srgb, var(--yun-project-link-color) 11%, transparent);
    }
  }

  &:active {
    color: var(--yun-project-link-color);
    background-color: color-mix(in srgb, var(--yun-project-link-color) 17%, transparent);
  }
}
</style>
