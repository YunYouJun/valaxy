<script setup lang="ts">
import type { Feature } from '../types'

defineProps<{
  feature: Feature
}>()
</script>

<template>
  <article class="press-feature">
    <div v-if="feature.icon" class="icon">
      {{ feature.icon }}
    </div>
    <h2 class="title">
      {{ feature.title }}
    </h2>
    <p class="details">
      {{ feature.details }}
    </p>
  </article>
</template>

<style scoped>
.press-feature {
  border: 1px solid var(--va-c-bg-soft);
  border-radius: 12px;
  padding: 24px;
  height: 100%;
  background-color: var(--va-c-bg-soft);
}

.icon {
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 20px;
  border-radius: 6px;
  background-color: var(--va-c-gray-light-4);
  width: 48px;
  height: 48px;
  font-size: 24px;
}

.dark .icon {
  background-color: var(--va-c-bg);
}

.title {
  line-height: 24px;
  font-size: 16px;
  font-weight: 600;
}

.details {
  padding-top: 8px;
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  color: var(--va-c-text-light);
}
</style>
