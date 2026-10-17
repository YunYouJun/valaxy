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
  position: relative;
  height: 100%;
  padding: 40px 36px;
  transition: background-color var(--va-transition-duration);
}

/* A brand line draws across the top edge on hover. */
.press-feature::before {
  content: '';
  position: absolute;
  inset: 0 0 auto;
  height: 2px;
  background: var(--pr-button-brand-bg);
  transform: scaleX(0);
  transform-origin: left;
  transition: transform var(--va-transition-duration-moderate) var(--pr-ease-out);
}

.press-feature:hover {
  background: var(--pr-c-brand-soft);
}

.press-feature:hover::before {
  transform: scaleX(1);
}

.icon {
  display: flex;
  align-items: center;
  height: 32px;
  margin-bottom: 24px;
  font-size: 32px;
  color: var(--pr-c-brand);
  transition: transform var(--va-transition-duration-moderate) var(--pr-ease-out);
}

.press-feature:hover .icon {
  transform: translateY(-3px);
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

/* Single-column phones: put the icon beside the title to keep long lists short. */
@media (width <= 639px) {
  .press-feature {
    padding: 24px;
  }

  .press-feature:has(> .icon) {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    column-gap: 14px;
  }

  .icon {
    height: 28px;
    margin-bottom: 0;
    font-size: 28px;
  }

  .details {
    grid-column: 1 / -1;
    margin-top: 10px;
  }
}

@media (prefers-reduced-motion: reduce) {
  .press-feature,
  .press-feature::before,
  .icon { transition: none; }

  .press-feature:hover .icon { transform: none; }
}
</style>
