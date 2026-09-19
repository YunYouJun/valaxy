<script setup lang="ts">
import type { Feature } from '../types'
import { useI18n } from 'vue-i18n'

defineProps<{
  feature: Feature
}>()

const { t } = useI18n()
</script>

<template>
  <article class="press-feature">
    <div v-if="feature.icon" class="icon" aria-hidden="true">
      <template v-if="feature.icon.startsWith('i-')">
        <div :class="feature.icon" />
      </template>
      <template v-else>
        {{ feature.icon }}
      </template>
    </div>
    <h2 class="title">
      {{ t(feature.title) }}
    </h2>
    <p class="details">
      {{ t(feature.details) }}
    </p>
  </article>
</template>

<style scoped>
.press-feature {
  height: 100%;
  padding: 40px 36px;
  transition: background-color 0.2s;
}

.press-feature:hover {
  background: var(--pr-c-brand-soft);
}

.icon {
  display: flex;
  align-items: center;
  height: 32px;
  margin-bottom: 24px;
  font-size: 32px;
  color: var(--pr-c-brand);
}

/* The Markdown logo is monochrome; preserve the colors of other brand icons. */
:global(.dark .press-feature .icon [class~='i-logos:markdown']) {
  filter: invert(1);
}

.title {
  margin: 0;
  font-family: var(--pr-font-display);
  font-size: 19px;
  font-weight: 600;
  line-height: 1.5;
  letter-spacing: normal;
  text-wrap: balance;
}

.details {
  margin: 14px 0 0;
  font-size: 15px;
  line-height: 1.8;
  text-wrap: pretty;
  color: var(--pr-c-text-2);
}

@media (width <= 639px) {
  .press-feature { padding: 32px 24px; }
  .icon { margin-bottom: 20px; }
}

@media (prefers-reduced-motion: reduce) {
  .press-feature { transition: none; }
}
</style>
